"use client";

import { RefreshCw } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { getCapostoreSyncRuns, startCapostoreSync } from "@/lib/services";
import type { GoodsSyncRun, GoodsSyncStatus } from "@/lib/types";

const STATUS_LABEL: Record<GoodsSyncStatus, string> = {
  RUNNING: "실행 중",
  SUCCEEDED: "성공",
  PARTIAL: "일부 실패",
  FAILED: "실패",
};

const STATUS_CLASS: Record<GoodsSyncStatus, string> = {
  RUNNING: "bg-[#111111]/10 text-ink",
  SUCCEEDED: "bg-[#1f9d55]/10 text-[#1f9d55]",
  PARTIAL: "bg-[#f6ae24]/15 text-[#b7791f]",
  FAILED: "bg-[#da1d52]/10 text-[#da1d52]",
};

const TRIGGER_LABEL: Record<string, string> = { GITHUB: "주간 자동", ADMIN: "수동" };

function formatTime(value: string | null) {
  if (!value) return "-";
  return new Date(value).toLocaleString("ko-KR", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * 카포스토어 굿즈 동기화 실행/이력. 정기 실행은 GitHub Actions 가 매주 월요일 06:00 에 한다.
 * 실행 중인 동안 10초마다 이력을 새로 읽고, 끝나면 onFinished 로 목록 갱신을 알린다.
 */
export default function GoodsSyncPanel({ onFinished }: { onFinished: () => void }) {
  const [runs, setRuns] = useState<GoodsSyncRun[]>([]);
  const [fromMock, setFromMock] = useState(false);
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const running = runs.some((r) => r.status === "RUNNING");

  const load = useCallback(() => {
    return getCapostoreSyncRuns(1, 5).then((res) => {
      setRuns(res.data.runs);
      setFromMock(res.fromMock);
      return res.data.runs;
    });
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (!running) return;
    const timer = setInterval(() => {
      load().then((next) => {
        if (!next.some((r) => r.status === "RUNNING")) onFinished();
      });
    }, 10_000);
    return () => clearInterval(timer);
  }, [running, load, onFinished]);

  const handleStart = async () => {
    if (!confirm("카포스토어 클럽 굿즈 동기화를 지금 실행할까요? 전체 실행에 30~60분 정도 걸립니다.")) return;
    setError(null);
    setStarting(true);
    try {
      await startCapostoreSync();
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "동기화를 시작하지 못했습니다.");
    } finally {
      setStarting(false);
    }
  };

  const latest = runs[0];

  return (
    <section className="mb-6 rounded-2xl border border-[#eeeeee] bg-white p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-sm font-extrabold text-ink">카포스토어 동기화</h2>
          <p className="mt-1 text-xs text-muted">
            클럽 정가 상품을 매주 월요일 06:00에 자동으로 가져옵니다. 할인 전환·판매종료 상품은 판매중지됩니다.
          </p>
        </div>
        <button
          onClick={handleStart}
          disabled={starting || running || fromMock}
          className="flex items-center gap-1.5 rounded-lg border border-[#dddddd] bg-white px-3.5 py-2 text-sm font-bold text-ink transition hover:border-[#bbbbbb] disabled:opacity-50"
        >
          <RefreshCw size={14} className={running ? "animate-spin" : ""} />
          {running ? "실행 중" : starting ? "시작 중..." : "지금 동기화"}
        </button>
      </div>

      {error && <p className="mt-3 text-xs text-[#da1d52]">{error}</p>}

      {latest ? (
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-xs">
            <thead className="text-muted">
              <tr className="border-b border-[#f0f0f0]">
                <th className="py-2 font-bold">시작</th>
                <th className="py-2 font-bold">방식</th>
                <th className="py-2 font-bold">상태</th>
                <th className="py-2 text-right font-bold">본 상품</th>
                <th className="py-2 text-right font-bold">신규</th>
                <th className="py-2 text-right font-bold">갱신</th>
                <th className="py-2 text-right font-bold">판매중지</th>
                <th className="py-2 text-right font-bold">건너뜀</th>
                <th className="py-2 text-right font-bold">실패</th>
              </tr>
            </thead>
            <tbody className="text-ink">
              {runs.map((run) => (
                <tr key={run.runId} className="border-b border-[#f7f7f7] align-top" title={run.message ?? undefined}>
                  <td className="py-2">{formatTime(run.startedAt)}</td>
                  <td className="py-2">{TRIGGER_LABEL[run.triggerType] ?? run.triggerType}</td>
                  <td className="py-2">
                    <span className={`rounded-full px-2 py-0.5 font-bold ${STATUS_CLASS[run.status]}`}>
                      {STATUS_LABEL[run.status]}
                    </span>
                  </td>
                  <td className="py-2 text-right">{run.seenCount}</td>
                  <td className="py-2 text-right">{run.createdCount}</td>
                  <td className="py-2 text-right">{run.updatedCount}</td>
                  <td className="py-2 text-right">{run.unavailableCount}</td>
                  <td className="py-2 text-right">{run.skippedCount}</td>
                  <td className="py-2 text-right">{run.failedCount}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {latest.message && (
            <pre className="mt-3 max-h-32 overflow-auto whitespace-pre-wrap rounded-lg bg-[#f7f7f7] p-3 text-[11px] text-muted">
              {latest.message}
            </pre>
          )}
        </div>
      ) : (
        <p className="mt-4 text-xs text-muted">아직 실행 이력이 없습니다.</p>
      )}
    </section>
  );
}
