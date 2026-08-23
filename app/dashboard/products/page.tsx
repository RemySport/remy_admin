"use client";

import { Plus, Search } from "lucide-react";
import { useEffect, useState } from "react";
import Header from "@/components/Header";
import MockBanner from "@/components/MockBanner";
import Pagination from "@/components/Pagination";
import SelectBox from "@/components/members/SelectBox";
import TicketCard from "@/components/products/TicketCard";
import TicketFormModal from "@/components/products/TicketFormModal";
import { useAdminSession } from "@/lib/admin-session";
import { STATUS_FILTERS } from "@/lib/mock/tickets";
import {
  createTicket,
  deleteTicket,
  getLeagues,
  getTicket,
  getTickets,
  updateTicket,
  updateTicketStatus,
} from "@/lib/services";
import type { CreateTicketRequest, LeagueBrief, TicketDetail, TicketSummary } from "@/lib/types";

const PAGE_SIZE = 20;
const ALL_LEAGUES = "전체";

export default function ProductsPage() {
  const { name } = useAdminSession();
  const [tickets, setTickets] = useState<TicketSummary[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [fromMock, setFromMock] = useState(false);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("전체");
  const [keyword, setKeyword] = useState("");
  const [leagues, setLeagues] = useState<LeagueBrief[]>([]);
  const [leagueName, setLeagueName] = useState(ALL_LEAGUES);
  const [page, setPage] = useState(1);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<TicketDetail | null>(null);

  useEffect(() => {
    getLeagues().then((res) => setLeagues(res.data));
  }, []);

  const leagueId = leagues.find((l) => l.name === leagueName)?.leagueId;

  // 상태/리그/검색어를 바꾸면 1페이지부터 다시 본다.
  const handleStatusChange = (v: string) => {
    setStatus(v);
    setPage(1);
  };
  const handleLeagueChange = (v: string) => {
    setLeagueName(v);
    setPage(1);
  };
  const handleKeywordChange = (v: string) => {
    setKeyword(v);
    setPage(1);
  };

  const load = () => {
    setLoading(true);
    getTickets({ status, keyword, leagueId, page, size: PAGE_SIZE }).then((res) => {
      setTickets(res.data.tickets);
      setTotal(res.data.totalElements);
      setTotalPages(res.data.totalPages);
      setFromMock(res.fromMock);
      setLoading(false);
    });
  };

  useEffect(load, [status, keyword, leagueId, page]);

  const handleChangeStatus = async (id: number, reservationStatus: "OPEN" | "PENDING" | "CLOSED") => {
    await updateTicketStatus(id, { reservationStatus, isReservable: reservationStatus === "OPEN" });
    load();
  };

  const handleDelete = async (id: number) => {
    await deleteTicket(id);
    load();
  };

  const handleCreate = async (request: CreateTicketRequest) => {
    await createTicket(request);
    setFormOpen(false);
    load();
  };

  const handleEdit = async (id: number) => {
    const res = await getTicket(id);
    setEditing(res.data);
  };

  const handleUpdate = async (request: CreateTicketRequest) => {
    if (!editing) return;
    await updateTicket(editing.ticketId, request);
    setEditing(null);
    load();
  };

  return (
    <>
      <Header title="티켓관리" userName={name || "관리자"} />

      <main className="mx-auto w-full max-w-6xl flex-1 px-6 pb-32 pt-6">
        {fromMock && <MockBanner />}

        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-ink">
            전체 <span className="font-bold">{total}</span>
          </p>

          <div className="flex flex-wrap items-center gap-2.5">
            <SelectBox value={status} hint="상태선택" options={STATUS_FILTERS} onChange={handleStatusChange} />
            <SelectBox
              value={leagueName}
              hint="리그선택"
              options={[ALL_LEAGUES, ...leagues.map((l) => l.name)]}
              onChange={handleLeagueChange}
            />
            <div className="flex items-center gap-2 rounded-lg border border-[#dddddd] bg-white px-3.5 py-2.5">
              <input
                value={keyword}
                onChange={(e) => handleKeywordChange(e.target.value)}
                placeholder="팀 / 경기장 검색"
                className="w-40 bg-transparent text-sm text-ink outline-none placeholder:text-[#bbbbbb]"
              />
              <Search size={16} className="text-[#888888]" />
            </div>
            <button
              onClick={() => setFormOpen(true)}
              className="flex items-center gap-1.5 rounded-lg bg-[#111111] px-4 py-2.5 text-sm font-bold text-white transition hover:bg-black"
            >
              <Plus size={16} /> 티켓 등록
            </button>
          </div>
        </div>

        {loading ? (
          <TicketGridSkeleton />
        ) : tickets.length === 0 ? (
          <div className="rounded-2xl border border-[#eeeeee] bg-white py-20 text-center text-sm text-muted">
            조건에 맞는 티켓이 없습니다.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {tickets.map((t) => (
              <TicketCard
                key={t.ticketId}
                ticket={t}
                onEdit={handleEdit}
                onChangeStatus={handleChangeStatus}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}

        <Pagination page={page} totalPages={totalPages} onChange={setPage} />
      </main>

      {formOpen && <TicketFormModal onSubmit={handleCreate} onClose={() => setFormOpen(false)} />}
      {editing && (
        <TicketFormModal
          initial={editing}
          onSubmit={handleUpdate}
          onClose={() => setEditing(null)}
        />
      )}
    </>
  );
}

function TicketGridSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="h-44 animate-pulse rounded-2xl border border-[#eeeeee] bg-white/60" />
      ))}
    </div>
  );
}
