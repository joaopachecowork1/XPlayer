"use client";

import Link from "next/link";
import { HubFeedModule } from "@/components/modules/hub/HubFeedModule";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function HubPage() {
  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="py-4 flex flex-col sm:flex-row gap-2 sm:items-center sm:justify-between">
          <div className="font-medium">Atalhos</div>
          <div className="flex flex-wrap gap-2">
            <Button asChild variant="outline">
              <Link href="/canhoes">Canhões</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/canhoes?tab=voting">Votações</Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      <HubFeedModule />
    </div>
  );
}
