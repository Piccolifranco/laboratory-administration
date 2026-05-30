import { Sidebar } from "@/app/ui/Sidebar/Sidebar";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex">
      <Sidebar />
      <main className="min-h-screen flex-1">{children}</main>
    </div>
  );
}