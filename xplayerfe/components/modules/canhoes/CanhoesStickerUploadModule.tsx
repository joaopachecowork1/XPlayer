"use client";

import { useEffect, useState } from "react";
import { canhoesRepo } from "@/lib/repositories/canhoesRepo";
import type { NomineeDto, CanhoesStateDto } from "@/lib/api/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ImageOff, Upload } from "lucide-react";
import { XPLAYER_API_URL } from "@/lib/api/xplayerClient";

export function CanhoesStickerUploadModule() {
  const [state, setState] = useState<CanhoesStateDto | null>(null);
  const [nominees, setNominees] = useState<NomineeDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [title, setTitle] = useState("");
  const [file, setFile] = useState<File | null>(null);

  const refresh = async () => {
    setLoading(true);
    try {
      const [st, noms] = await Promise.all([canhoesRepo.getState(), canhoesRepo.getNominees()]);
      setState(st);
      setNominees(Array.isArray(noms) ? noms : []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void refresh(); }, []);

  const onSubmit = async () => {
    if (!state || state.phase !== "nominations") return;
    if (!file) return;

    setSaving(true);
    try {
      const created = await canhoesRepo.createNominee({ categoryId: null, title: title.trim() || "Sticker" });
      await canhoesRepo.uploadNomineeImage(created.id, file);
      setTitle("");
      setFile(null);
      await refresh();
    } finally {
      setSaving(false);
    }
  };

  const approvedOrPending = nominees.filter(n => n.imageUrl);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <div>
          <div className="text-xl font-semibold">Sticker do Ano 📸</div>
          <div className="text-sm text-muted-foreground">
            Submete um sticker (png/jpg). Mais tarde abrimos a votação só de stickers.
          </div>
        </div>
        {state ? <Badge variant="outline">Fase: {state.phase}</Badge> : null}
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Submeter sticker</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Título (opcional)" />
          <label className="inline-flex items-center gap-2 text-sm">
            <Upload className="h-4 w-4" />
            <input type="file" accept="image/png,image/jpeg" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
          </label>
          <Button onClick={onSubmit} disabled={!file || !state || state.phase !== "nominations" || saving}>
            {state?.phase !== "nominations" ? "Submissões fechadas" : saving ? "A enviar..." : "Enviar"}
          </Button>

          <div className="text-xs text-muted-foreground">
            TODO: criar tabela própria StickerSubmission (separar de Nominee) + votação dedicada de stickers.
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <div className="text-sm text-muted-foreground">A carregar...</div>
      ) : approvedOrPending.length === 0 ? (
        <div className="text-sm text-muted-foreground">Ainda não há stickers.</div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {approvedOrPending.map((n) => (
            <Card key={n.id} className="overflow-hidden">
              <div className="aspect-square bg-muted flex items-center justify-center">
                {n.imageUrl ? (
                  <img
                    src={`${XPLAYER_API_URL}${n.imageUrl}`}
                    alt={n.title}
                    className="h-full w-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <ImageOff className="h-4 w-4 text-muted-foreground" />
                )}
              </div>
              <CardContent className="p-3">
                <div className="text-sm font-medium truncate">{n.title}</div>
                <div className="text-xs text-muted-foreground truncate">{n.status}</div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
