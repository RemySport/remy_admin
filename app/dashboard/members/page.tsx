"use client";

import { Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import Header from "@/components/Header";
import MockBanner from "@/components/MockBanner";
import MemberCard from "@/components/members/MemberCard";
import SelectBox from "@/components/members/SelectBox";
import { useAdminSession } from "@/lib/admin-session";
import {
  GROUP_FILTERS,
  STATUS_FILTERS,
} from "@/lib/mock/members";
import { getMembers } from "@/lib/services";
import type { Member } from "@/lib/types";

// 필터 라벨("제휴사 A") → 실제 그룹 코드("제휴A") 매핑
function matchGroup(filter: string, group: string) {
  if (filter === "전체") return true;
  return filter.replace("사 ", "").replace(" ", "") === group;
}

export default function MembersPage() {
  const { name } = useAdminSession();
  const [members, setMembers] = useState<Member[]>([]);
  const [total, setTotal] = useState(0);
  const [fromMock, setFromMock] = useState(false);
  const [loading, setLoading] = useState(true);

  const [group, setGroup] = useState("전체");
  const [status, setStatus] = useState("전체");
  const [keyword, setKeyword] = useState("");

  // 필터가 바뀔 때마다 (가상)API 재요청 → 실패 시 mock
  useEffect(() => {
    let alive = true;
    getMembers({ group, status, keyword }).then((res) => {
      if (!alive) return;
      setMembers(res.data.members);
      setTotal(res.data.total);
      setFromMock(res.fromMock);
      setLoading(false);
    });
    return () => {
      alive = false;
    };
  }, [group, status, keyword]);

  const handleGroupChange = (value: string) => {
    setLoading(true);
    setGroup(value);
  };

  const handleStatusChange = (value: string) => {
    setLoading(true);
    setStatus(value);
  };

  const handleKeywordChange = (value: string) => {
    setLoading(true);
    setKeyword(value);
  };

  // mock 폴백 시에는 클라이언트에서 필터링 (실서버 붙으면 서버가 필터링)
  const visible = useMemo(() => {
    if (!fromMock) return members;
    return members.filter(
      (m) =>
        matchGroup(group, m.group) &&
        (status === "전체" || m.status === status) &&
        (keyword.trim() === "" ||
          m.name.includes(keyword.trim()) ||
          m.nickname.includes(keyword.trim())),
    );
  }, [members, fromMock, group, status, keyword]);

  return (
    <>
      <Header
        title="회원관리"
        userName={name || "관리자"}
        menuItems={[
          { label: "회원그룹 관리", href: "/dashboard/members/groups" },
          { label: "후기목록", href: "/dashboard/members/reviews" },
        ]}
      />

      <main className="mx-auto w-full max-w-6xl flex-1 px-6 pb-32 pt-6">
        {fromMock && <MockBanner />}

        {/* 필터 바 */}
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-ink">
            전체 <span className="font-bold">{total}</span>
          </p>

          <div className="flex flex-wrap items-center gap-2.5">
            <SelectBox
              value={group}
              hint="그룹선택"
              options={GROUP_FILTERS}
              onChange={handleGroupChange}
            />
            <SelectBox
              value={status}
              hint="상태선택"
              options={STATUS_FILTERS}
              onChange={handleStatusChange}
            />
            <div className="flex items-center gap-2 rounded-lg border border-[#dddddd] bg-white px-3.5 py-2.5">
              <input
                value={keyword}
                onChange={(e) => handleKeywordChange(e.target.value)}
                placeholder="이름 / 닉네임 검색"
                className="w-40 bg-transparent text-sm text-ink outline-none placeholder:text-[#bbbbbb]"
              />
              <Search size={16} className="text-[#888888]" />
            </div>
          </div>
        </div>

        {/* 목록 */}
        {loading ? (
          <MemberGridSkeleton />
        ) : visible.length === 0 ? (
          <div className="rounded-2xl border border-[#eeeeee] bg-white py-20 text-center text-sm text-muted">
            조건에 맞는 회원이 없습니다.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {visible.map((m) => (
              <MemberCard key={m.id} member={m} />
            ))}
          </div>
        )}
      </main>
    </>
  );
}

function MemberGridSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="h-44 animate-pulse rounded-2xl border border-[#eeeeee] bg-white/60"
        />
      ))}
    </div>
  );
}
