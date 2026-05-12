import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import TopBar from "@/components/layout/TopBar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  return (
    <>
      <TopBar />
      <div className="min-h-screen bg-[var(--color-paper)]">
        {children}
      </div>
    </>
  );
}