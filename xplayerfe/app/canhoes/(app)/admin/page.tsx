// src/app/canhoes/(app)/admin/page.tsx
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { redirect } from "next/navigation";
import dynamic from "next/dynamic";

const CanhoesAdminModule = dynamic(
  () => import("@/components/modules/canhoes/admin/CanhoesAdminModule"),
  { ssr: false }
);

export default async function AdminPage() {
  const session = await getServerSession(authOptions);
  const isAdmin = Boolean((session?.user as any)?.isAdmin);
  if (!isAdmin) {
    redirect("/canhoes");
  }
  return <CanhoesAdminModule />;
}
