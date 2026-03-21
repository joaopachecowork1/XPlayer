// src/app/canhoes/(app)/admin/page.tsx
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { redirect } from "next/navigation";
import CanhoesAdminModule from "@/components/modules/canhoes/admin/CanhoesAdminModule";

export default async function AdminPage() {
  const session = await getServerSession(authOptions);
  const isAdmin = Boolean(session?.user?.isAdmin);
  if (!isAdmin) {
    redirect("/canhoes");
  }
  return <CanhoesAdminModule />;
}
