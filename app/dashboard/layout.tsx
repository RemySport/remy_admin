import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <Header title="어드민의 시작" userName="홍길동" />
      <main className="flex-1 px-4 pt-6 pb-32 max-w-5xl mx-auto w-full">
        {children}
      </main>
      <BottomNav />
    </div>
  );
}
