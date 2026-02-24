using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Configuration;
using System.Net.Http.Json;

namespace XPlayer.Infrastructure.Media;

public interface IRawgClient
{
    Task<string?> GetBackgroundImageAsync(string externalId, CancellationToken ct);
}

public class RawgClient : IRawgClient
{
    private readonly HttpClient _http;
    private readonly IConfiguration _cfg;
    public RawgClient(HttpClient http, IConfiguration cfg){ _http=http; _cfg=cfg; _http.BaseAddress=new Uri(_cfg["Rawg:BaseUrl"]??"https://api.rawg.io/api/"); }
    public async Task<string?> GetBackgroundImageAsync(string externalId, CancellationToken ct)
    {
        var key=_cfg["Rawg:ApiKey"]; if(string.IsNullOrWhiteSpace(key)) return null;
        var resp = await _http.GetAsync($"games/{Uri.EscapeDataString(externalId)}?key={key}", ct);
        if(!resp.IsSuccessStatusCode) return null;
        var json = await resp.Content.ReadFromJsonAsync<Dictionary<string,object>>(cancellationToken: ct);
        return json is not null && json.TryGetValue("background_image", out var v) ? v?.ToString() : null;
    }
}

public interface IImageProxy
{
    Task<byte[]?> TryFetchAsync(string url, CancellationToken ct);
}

public class WhitelistedImageProxy : IImageProxy
{
    private readonly HttpClient _http;
    private readonly IConfiguration _cfg;
    public WhitelistedImageProxy(HttpClient http, IConfiguration cfg){ _http=http; _cfg=cfg; }
    public async Task<byte[]?> TryFetchAsync(string url, CancellationToken ct)
    {
        if(!Uri.TryCreate(url, UriKind.Absolute, out var uri)) return null;
        if(uri.Scheme!="http" && uri.Scheme!="https") return null;
        var allowed = _cfg.GetSection("AllowedImageHosts").Get<string[]>() ?? Array.Empty<string>();
        if(allowed.Length>0 && !allowed.Any(h=>uri.Host.EndsWith(h, StringComparison.OrdinalIgnoreCase))) return null;
        using var resp = await _http.GetAsync(uri, HttpCompletionOption.ResponseHeadersRead, ct);
        if(!resp.IsSuccessStatusCode) return null;
        var len = resp.Content.Headers.ContentLength ?? 0;
        if(len>5_000_000) return null; // 5MB cap simples
        return await resp.Content.ReadAsByteArrayAsync(ct);
    }
}

public interface IGameImageService
{
    Task<(string relativeUrl,bool cached)> GetOrFetchCoverAsync(string externalId, string? imageUrl, CancellationToken ct);
}

public class MultiImageService : IGameImageService
{
    private readonly IRawgClient _rawg;
    private readonly IImageProxy _proxy;
    private readonly IWebHostEnvironment _env;
    public MultiImageService(IRawgClient rawg, IImageProxy proxy, IWebHostEnvironment env){ _rawg=rawg; _proxy=proxy; _env=env; }

    public async Task<(string relativeUrl,bool cached)> GetOrFetchCoverAsync(string externalId, string? imageUrl, CancellationToken ct)
    {
        var fileName = $"{Sanitize(externalId)}.jpg";
        var relative = $"/media/games/{fileName}";
        var root = _env.WebRootPath ?? Path.Combine(Directory.GetCurrentDirectory(), "wwwroot");
        var dir = Path.Combine(root, "media", "games");
        Directory.CreateDirectory(dir);
        var full = Path.Combine(dir, fileName);

        if(File.Exists(full)) return (relative, true);

        // 1) Tentar URL fornecida (se vier do frontend)
        if(!string.IsNullOrWhiteSpace(imageUrl))
        {
            var data = await _proxy.TryFetchAsync(imageUrl!, ct);
            if(data is not null){ await File.WriteAllBytesAsync(full, data, ct); return (relative, false); }
        }

        // 2) Tentar RAWG
        var fromRawg = await _rawg.GetBackgroundImageAsync(externalId, ct);
        if(!string.IsNullOrWhiteSpace(fromRawg))
        {
            var data = await _proxy.TryFetchAsync(fromRawg!, ct);
            if(data is not null){ await File.WriteAllBytesAsync(full, data, ct); return (relative, false); }
        }

        // 3) Placeholder
        return ("/media/games/placeholder.jpg", true);
    }

    private static string Sanitize(string s){ foreach(var c in Path.GetInvalidFileNameChars()) s=s.Replace(c,'_'); return s; }
}