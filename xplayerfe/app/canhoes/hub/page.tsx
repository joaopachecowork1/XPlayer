import { redirect } from "next/navigation";

// Back-compat: old hub URL.
export default function CanhoesHubRedirect() {
  redirect("/canhoes");
}
