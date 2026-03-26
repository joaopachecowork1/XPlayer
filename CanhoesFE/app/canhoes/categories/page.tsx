import { redirect } from "next/navigation";

// Legacy route kept for backwards compatibility.
// Canonical route: /canhoes/categorias
export default function LegacyCategoriesPage() {
  redirect("/canhoes/categorias");
}
