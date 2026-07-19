import { TriangleAlert } from "lucide-react";

/** API 연결 실패로 mock 데이터를 표시 중일 때 노출되는 안내 배너 */
export default function MockBanner() {
  return (
    <div className="mb-4 flex items-center gap-2 rounded-xl border border-[#f6ae24]/40 bg-[#f6ae24]/10 px-4 py-2.5 text-xs text-[#8a5a00]">
      <TriangleAlert size={15} className="shrink-0" />
      <span>
        API 서버에 연결하지 못해 <strong>임시(mock) 데이터</strong>를 표시하고
        있습니다. 실제 API 주소가 연결되면 자동으로 실데이터로 전환됩니다.
      </span>
    </div>
  );
}
