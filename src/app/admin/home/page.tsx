import { AdminDashboard } from "@/app/_components/admincomponents/admin-dashboard";
import { api } from "@/trpc/server";

export default async function AdminHome() {
  const hello = await api.form.hello({ text: "from tRPC" });

  void api.form.getLatest.prefetch();

  return (
    <>
      this is the main home page of the admin page
      <AdminDashboard />
    </>
  );
}
