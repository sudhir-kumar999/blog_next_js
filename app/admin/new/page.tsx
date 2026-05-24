import { redirect } from "next/navigation";

/** Manual posting disabled — AI cron publishes automatically */
export default function AdminNewRedirect() {
  redirect("/admin");
}
