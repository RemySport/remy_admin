"use client";

import { X } from "lucide-react";
import { useState } from "react";
import type { AdminGradeSummary } from "@/lib/types";

export interface AdminAccountFormValues {
  email: string;
  password: string;
  name: string;
  gradeId: number;
}

interface AdminAccountFormModalProps {
  grades: AdminGradeSummary[];
  onSubmit: (values: AdminAccountFormValues) => Promise<void>;
  onClose: () => void;
}

export default function AdminAccountFormModal({
  grades,
  onSubmit,
  onClose,
}: AdminAccountFormModalProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [gradeId, setGradeId] = useState<number | "">(grades[0]?.gradeId ?? "");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const inputClass =
    "w-full rounded-lg border border-[#dddddd] bg-white px-3.5 py-2.5 text-sm text-ink outline-none focus:border-[#bbbbbb]";
  const labelClass = "mb-1.5 block text-xs font-bold text-muted";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!email.trim() || !password.trim() || !name.trim() || gradeId === "") {
      setError("모든 항목을 입력해주세요.");
      return;
    }
    setSubmitting(true);
    try {
      await onSubmit({ email: email.trim(), password, name: name.trim(), gradeId: Number(gradeId) });
    } catch (err) {
      setError(err instanceof Error ? err.message : "저장에 실패했습니다.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/45 px-4"
      onMouseDown={onClose}
    >
      <div
        className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl bg-white shadow-2xl"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-5">
          <h3 className="text-base font-extrabold text-ink">관리자 추가</h3>
          <button onClick={onClose} aria-label="닫기" className="text-ink hover:text-brand-strong">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 px-6 pb-6">
          <div>
            <label className={labelClass}>이메일</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@remy.com"
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>비밀번호</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="초기 비밀번호"
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>이름</label>
            <input value={name} onChange={(e) => setName(e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>등급</label>
            <select
              value={gradeId}
              onChange={(e) => setGradeId(Number(e.target.value))}
              className={inputClass}
            >
              {grades.map((g) => (
                <option key={g.gradeId} value={g.gradeId}>
                  {g.name}
                  {g.isSuper ? " (슈퍼)" : ""}
                </option>
              ))}
            </select>
          </div>

          {error && <p className="text-sm text-[#da1d52]">{error}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-xl bg-[#111111] py-4 text-sm font-extrabold text-white transition hover:bg-black active:scale-[0.99] disabled:opacity-60"
          >
            {submitting ? "저장 중..." : "추가하기"}
          </button>
        </form>
      </div>
    </div>
  );
}
