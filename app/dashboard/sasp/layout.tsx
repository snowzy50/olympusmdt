import Sidebar from '@/components/layout/Sidebar';

export default function SASPDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-dark-200 flex">
      <Sidebar />

      {/* Main content with margin to accommodate sidebar */}
      <main className="flex-1 ml-64 transition-all duration-300">
        {children}
      </main>
    </div>
  );
}
