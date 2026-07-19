import BottomNav from "@/components/BottomNav";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // 각 페이지가 자체 Header(타이틀·드롭다운이 다름)를 렌더링합니다.
  return (
    <div className="min-h-screen bg-page flex flex-col">
      {children}
      <BottomNav />
    </div>
  );
}
