"use client";

import { HubFeedModule } from "@/components/modules/hub/HubFeedModule";

export default function CanhoesPage() {
  // Feed = Hub (Instagram style). Inline composer is hidden; the + button opens a bottom sheet.
  return <HubFeedModule variant="instagram" showComposer={false} />;
}
