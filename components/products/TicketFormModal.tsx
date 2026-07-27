"use client";

import { Plus, Trash2, X } from "lucide-react";
import { useEffect, useState } from "react";
import { getLeagues, getTeams, getTicketStadiums } from "@/lib/services";
import type {
  CreateTicketRequest,
  LeagueBrief,
  StadiumBrief,
  TeamBrief,
  TicketOptionInput,
} from "@/lib/types";

interface TicketFormModalProps {
  onSubmit: (request: CreateTicketRequest) => Promise<void>;
  onClose: () => void;
}

const EMPTY_OPTION: TicketOptionInput = { seatType: "", price: 0, currency: "KRW", maxQuantity: 4 };

export default function TicketFormModal({ onSubmit, onClose }: TicketFormModalProps) {
  const [leagues, setLeagues] = useState<LeagueBrief[]>([]);
  const [teams, setTeams] = useState<TeamBrief[]>([]);
  const [stadiums, setStadiums] = useState<StadiumBrief[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [competitionType, setCompetitionType] = useState("LEAGUE");
  const [leagueId, setLeagueId] = useState<string>("");
  const [homeTeamId, setHomeTeamId] = useState<string>("");
  const [awayTeamId, setAwayTeamId] = useState<string>("");
  const [stadiumId, setStadiumId] = useState<string>("");
  const [matchDatetime, setMatchDatetime] = useState("");
  const [reservationStatus, setReservationStatus] = useState("OPEN");
  const [isReservable, setIsReservable] = useState(true);
  const [options, setOptions] = useState<TicketOptionInput[]>([{ ...EMPTY_OPTION }]);

  useEffect(() => {
    Promise.all([getLeagues(), getTeams(), getTicketStadiums()]).then(
      ([leagueRes, teamRes, stadiumRes]) => {
        setLeagues(leagueRes.data);
        setTeams(teamRes.data);
        setStadiums(stadiumRes.data);
      },
    );
  }, []);

  const updateOption = (index: number, patch: Partial<TicketOptionInput>) => {
    setOptions((prev) => prev.map((o, i) => (i === index ? { ...o, ...patch } : o)));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!homeTeamId || !awayTeamId || !stadiumId || !matchDatetime) {
      setError("팀 / 경기장 / 경기일시는 필수입니다.");
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit({
        competitionType,
        leagueId: leagueId ? Number(leagueId) : null,
        homeTeamId: Number(homeTeamId),
        awayTeamId: Number(awayTeamId),
        stadiumId: Number(stadiumId),
        matchDatetime: new Date(matchDatetime).toISOString(),
        timezone: "Asia/Seoul",
        reservationStatus,
        isReservable,
        ticketOptions: options.filter((o) => o.seatType.trim() !== ""),
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "등록에 실패했습니다.");
    } finally {
      setSubmitting(false);
    }
  };

  const selectClass =
    "w-full rounded-lg border border-[#dddddd] bg-white px-3.5 py-2.5 text-sm text-ink outline-none focus:border-[#bbbbbb]";
  const inputClass = selectClass;
  const labelClass = "mb-1.5 block text-xs font-bold text-muted";

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/45 px-4"
      onMouseDown={onClose}
    >
      <div
        className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-2xl bg-white shadow-2xl"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-5">
          <h3 className="text-base font-extrabold text-ink">티켓 등록</h3>
          <button onClick={onClose} aria-label="닫기" className="text-ink hover:text-brand-strong">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 px-6 pb-6">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>대회 구분</label>
              <input
                value={competitionType}
                onChange={(e) => setCompetitionType(e.target.value)}
                className={inputClass}
                placeholder="LEAGUE"
              />
            </div>
            <div>
              <label className={labelClass}>리그</label>
              <select value={leagueId} onChange={(e) => setLeagueId(e.target.value)} className={selectClass}>
                <option value="">선택안함</option>
                {leagues.map((l) => (
                  <option key={l.leagueId} value={l.leagueId}>
                    {l.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass}>홈팀</label>
              <select value={homeTeamId} onChange={(e) => setHomeTeamId(e.target.value)} className={selectClass}>
                <option value="">선택</option>
                {teams.map((t) => (
                  <option key={t.teamId} value={t.teamId}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass}>원정팀</label>
              <select value={awayTeamId} onChange={(e) => setAwayTeamId(e.target.value)} className={selectClass}>
                <option value="">선택</option>
                {teams.map((t) => (
                  <option key={t.teamId} value={t.teamId}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass}>경기장</label>
              <select value={stadiumId} onChange={(e) => setStadiumId(e.target.value)} className={selectClass}>
                <option value="">선택</option>
                {stadiums.map((s) => (
                  <option key={s.stadiumId} value={s.stadiumId}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass}>경기 일시</label>
              <input
                type="datetime-local"
                value={matchDatetime}
                onChange={(e) => setMatchDatetime(e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>판매 상태</label>
              <select
                value={reservationStatus}
                onChange={(e) => setReservationStatus(e.target.value)}
                className={selectClass}
              >
                <option value="OPEN">OPEN (판매중)</option>
                <option value="PENDING">PENDING (오픈예정)</option>
                <option value="CLOSED">CLOSED (판매종료)</option>
              </select>
            </div>
            <div className="flex items-end pb-2.5">
              <label className="flex items-center gap-2 text-sm text-ink">
                <input
                  type="checkbox"
                  checked={isReservable}
                  onChange={(e) => setIsReservable(e.target.checked)}
                />
                예매 가능
              </label>
            </div>
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between">
              <label className="text-xs font-bold text-muted">좌석 옵션</label>
              <button
                type="button"
                onClick={() => setOptions((prev) => [...prev, { ...EMPTY_OPTION }])}
                className="flex items-center gap-1 text-xs font-bold text-ink hover:text-brand-strong"
              >
                <Plus size={14} /> 옵션 추가
              </button>
            </div>
            <div className="space-y-2">
              {options.map((option, i) => (
                <div key={i} className="flex items-center gap-2">
                  <input
                    value={option.seatType}
                    onChange={(e) => updateOption(i, { seatType: e.target.value })}
                    placeholder="좌석등급 (예: VIP)"
                    className={`${inputClass} flex-1`}
                  />
                  <input
                    type="number"
                    value={option.price}
                    onChange={(e) => updateOption(i, { price: Number(e.target.value) })}
                    placeholder="가격"
                    className={`${inputClass} w-28`}
                  />
                  <input
                    type="number"
                    value={option.maxQuantity ?? 4}
                    onChange={(e) => updateOption(i, { maxQuantity: Number(e.target.value) })}
                    placeholder="최대수량"
                    className={`${inputClass} w-20`}
                  />
                  <button
                    type="button"
                    onClick={() => setOptions((prev) => prev.filter((_, idx) => idx !== i))}
                    aria-label="옵션 삭제"
                    className="shrink-0 text-[#bbbbbb] hover:text-[#da1d52]"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {error && <p className="text-sm text-[#da1d52]">{error}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-xl bg-[#111111] py-4 text-sm font-extrabold text-white transition hover:bg-black active:scale-[0.99] disabled:opacity-60"
          >
            {submitting ? "등록 중..." : "등록하기"}
          </button>
        </form>
      </div>
    </div>
  );
}
