import DashboardLayout from "@/components/layout/DashboardLayout";
import { BacklogGameDetailModule } from "@/components/modules/BacklogGameDetailModule";

export default async function BacklogGameDetailPage({ params }: { params: Promise<{ gameId: string }> }) {
  const { gameId } = await params;
  return (
    <DashboardLayout>
      <BacklogGameDetailModule gameId={gameId} />
    </DashboardLayout>
  );
}
