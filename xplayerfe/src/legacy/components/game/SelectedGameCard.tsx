import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { GameResult } from "./GameSearchDropdown";

interface SelectedGameCardProps {
  game: GameResult;
}

export function SelectedGameCard({ game }: SelectedGameCardProps) {
  const getPlatformNames = (platforms?: GameResult["platforms"]) => {
    if (!platforms || platforms.length === 0) return [];
    return platforms.slice(0, 3).map(p => p.platform.name);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Jogo Selecionado</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-4">
          <img
            src={game.background_image || "https://via.placeholder.com/100x75?text=No+Image"}
            alt={game.name}
            className="w-24 h-18 object-cover rounded"
          />
          <div className="flex-1">
            <h3 className="font-bold text-lg">{game.name}</h3>
            <p className="text-sm text-muted-foreground">
              Lançamento: {game.released || "Data desconhecida"}
            </p>
            <div className="flex gap-1 mt-2 flex-wrap">
              {getPlatformNames(game.platforms).map((platform, idx) => (
                <Badge key={idx} variant="outline">
                  {platform}
                </Badge>
              ))}
            </div>
          </div>
        </div>
        <Button className="w-full mt-4">
          Criar Sessão
        </Button>
      </CardContent>
    </Card>
  );
}