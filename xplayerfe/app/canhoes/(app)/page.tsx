"use client";

import { HubFeedModule } from "@/components/modules/hub/HubFeedModule";

export default function CanhoesPage() {
  // Feed = Hub (reddit/twitter style). Inline composer is hidden; the + button opens a bottom sheet.
  return <HubFeedModule variant="reddit" showComposer={false} />;
}
