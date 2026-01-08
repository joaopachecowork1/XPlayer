import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { GameResult } from "./GameSearchDropdown";

interface GameListProps {
  games: GameResult[];
  onSelect: (game: GameResult) => void;
}

export function GameList({ games, onSelect }: GameListProps) {
  const getPlatformNames = (platforms?: GameResult["platforms"]) => {
    if (!platforms || platforms.length === 0) return [];
    return platforms.slice(0, 3).map(p => p.platform.name);
  };

  return (
    <Card className="absolute z-10 w-full mt-2 max-h-96 overflow-y-auto">
      {games.map((game) => (
        <button
          key={game.id}
          onClick={() => onSelect(game)}
          className="w-full flex items-start gap-3 p-3 hover:bg-accent transition-colors text-left border-b last:border-b-0"
        >
          <img
            src={game.background_image || "https://via.placeholder.com/80x60?text=No+Image"}
            alt={game.name}
            className="w-20 h-16 object-cover rounded flex-shrink-0"
          />
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold truncate">{game.name}</h3>
            <p className="text-sm text-muted-foreground mt-0.5">
              {game.released || "Data desconhecida"}
            </p>
            <div className="flex gap-1 mt-1 flex-wrap">
              {getPlatformNames(game.platforms).map((platform, idx) => (
                <Badge key={idx} variant="secondary" className="text-xs">
                  {platform}
                </Badge>
              ))}
            </div>
          </div>
        </button>
      ))}
    </Card>
  );
}