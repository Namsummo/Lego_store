import AdminSidebar from "@/components/layout/(components)/(pages)/Adminsidebar";
import HeaderAdmin from "@/components/layout/(components)/(pages)/HeaderAdmin";
import { Toaster } from "sonner";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen w-full">
      <AdminSidebar />
      <div className="flex-1 flex flex-col">
        <HeaderAdmin />
        <main className="flex-1 p-6 bg-gray-50 dark:bg-gray-900">
          {children}
          <Toaster />
        </main>
      </div>
    </div>
  );
}
