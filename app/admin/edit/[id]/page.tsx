import { redirect } from "next/navigation";

/** Manual editing disabled — AI cron publishes automatically */
export default function AdminEditRedirect() {
  redirect("/admin");
}
