import { AdminDashboard } from "@/app/_components/admincomponents/admin-dashboard";
import { HydrateClient } from "@/trpc/server";

export default async function AdminHome() {
  return (
    <HydrateClient>
      <AdminDashboard />
    </HydrateClient>
  );
}
