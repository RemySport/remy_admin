"use client";

import { X } from "lucide-react";
import { useState } from "react";
import type { AdminGradeSummary, AdminMenuItem, AdminMenuKey } from "@/lib/types";

export interface AdminGradeFormValues {
  name: string;
  description: string;
  menuKeys: AdminMenuKey[];
}

interface AdminGradeFormModalProps {
  allMenus: AdminMenuItem[];
  initial?: AdminGradeSummary | null;
  onSubmit: (values: AdminGradeFormValues) => Promise<void>;
  onClose: () => void;
}

export default function AdminGradeFormModal({
  allMenus,
  initial,
  onSubmit,
  onClose,
}: AdminGradeFormModalProps) {
  const [name, setName] = useState(initial?.name ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [menuKeys, setMenuKeys] = useState<AdminMenuKey[]>(initial?.menuKeys ?? []);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const inputClass =
    "w-full rounded-lg border border-[#dddddd] bg-white px-3.5 py-2.5 text-sm text-ink outline-none focus:border-[#bbbbbb]";
  const labelClass = "mb-1.5 block text-xs font-bold text-muted";

  const toggleMenu = (menuKey: AdminMenuKey) => {
    setMenuKeys((prev) =>
      prev.includes(menuKey) ? prev.filter((k) => k !== menuKey) : [...prev, menuKey],
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!name.trim()) {
      setError("등급명을 입력해주세요.");
      return;
    }
    setSubmitting(true);
    try {
      await onSubmit({ name: name.trim(), description: description.trim(), menuKeys });
    } catch (err) {
      setError(err instanceof Error ? err.message : "저장에 실패했습니다.");
    } finally {
      setSubmitting(false);
    }
  };

  const isSuperGrade = initial?.isSuper ?? false;

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
          <h3 className="text-base font-extrabold text-ink">{initial ? "등급 수정" : "등급 생성"}</h3>
          <button onClick={onClose} aria-label="닫기" className="text-ink hover:text-brand-strong">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 px-6 pb-6">
          <div>
            <label className={labelClass}>등급명</label>
            <input value={name} onChange={(e) => setName(e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>설명</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              className={inputClass}
            />
          </div>

          <div>
            <label className={labelClass}>볼 수 있는 어드민 메뉴</label>
            {isSuperGrade ? (
              <p className="text-xs text-muted">슈퍼 등급은 모든 메뉴에 항상 접근할 수 있습니다.</p>
            ) : (
              <div className="space-y-1.5">
                {allMenus.map((menu) => (
                  <label
                    key={menu.menuKey}
                    className="flex items-center gap-2 rounded-lg border border-[#eeeeee] px-3 py-2 text-sm text-ink"
                  >
                    <input
                      type="checkbox"
                      checked={menuKeys.includes(menu.menuKey)}
                      onChange={() => toggleMenu(menu.menuKey)}
                    />
                    {menu.label}
                  </label>
                ))}
              </div>
            )}
          </div>

          {error && <p className="text-sm text-[#da1d52]">{error}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-xl bg-[#111111] py-4 text-sm font-extrabold text-white transition hover:bg-black active:scale-[0.99] disabled:opacity-60"
          >
            {submitting ? "저장 중..." : initial ? "수정하기" : "생성하기"}
          </button>
        </form>
      </div>
    </div>
  );
}
