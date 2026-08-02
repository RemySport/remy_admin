"use client";

import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import AdminGradeFormModal, {
  type AdminGradeFormValues,
} from "@/components/admins/AdminGradeFormModal";
import Header from "@/components/Header";
import MockBanner from "@/components/MockBanner";
import { useAdminSession } from "@/lib/admin-session";
import {
  createAdminGrade,
  deleteAdminGrade,
  getAdminGrades,
  updateAdminGrade,
} from "@/lib/services";
import type { AdminGradeSummary, AdminMenuItem } from "@/lib/types";

export default function AdminGradesPage() {
  const router = useRouter();
  const { name, isSuper, loading: sessionLoading } = useAdminSession();

  const [grades, setGrades] = useState<AdminGradeSummary[]>([]);
  const [allMenus, setAllMenus] = useState<AdminMenuItem[]>([]);
  const [fromMock, setFromMock] = useState(false);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<AdminGradeSummary | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = () => {
    setLoading(true);
    getAdminGrades().then((res) => {
      setGrades(res.data.grades);
      setAllMenus(res.data.allMenus);
      setFromMock(res.fromMock);
      setLoading(false);
    });
  };

  useEffect(load, []);

  useEffect(() => {
    if (!sessionLoading && !isSuper) {
      router.replace("/dashboard");
    }
  }, [sessionLoading, isSuper, router]);

  const handleCreate = async (values: AdminGradeFormValues) => {
    await createAdminGrade(values);
    setFormOpen(false);
    load();
  };

  const handleUpdate = async (values: AdminGradeFormValues) => {
    if (!editTarget) return;
    await updateAdminGrade(editTarget.gradeId, values);
    setEditTarget(null);
    load();
  };

  const handleDelete = async (grade: AdminGradeSummary) => {
    setError(null);
    try {
      await deleteAdminGrade(grade.gradeId);
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "삭제에 실패했습니다.");
    }
  };

  if (!sessionLoading && !isSuper) return null;

  return (
    <>
      <Header
        title="어드민관리"
        userName={name || "관리자"}
        menuItems={[
          { label: "계정 관리", href: "/dashboard/admins" },
          { label: "등급 관리", href: "/dashboard/admins/grades" },
        ]}
      />

      <main className="mx-auto w-full max-w-6xl flex-1 px-6 pb-32 pt-6">
        {fromMock && <MockBanner />}

        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-ink">
            전체 <span className="font-bold">{grades.length}</span>
          </p>
          <button
            onClick={() => setFormOpen(true)}
            className="flex items-center gap-1.5 rounded-lg bg-[#111111] px-4 py-2.5 text-sm font-bold text-white transition hover:bg-black"
          >
            <Plus size={16} /> 등급 생성
          </button>
        </div>

        {error && <p className="mb-3 text-sm text-[#da1d52]">{error}</p>}

        {loading ? (
          <div className="h-64 animate-pulse rounded-2xl border border-[#eeeeee] bg-white/60" />
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {grades.map((grade) => (
              <div key={grade.gradeId} className="rounded-2xl border border-[#eeeeee] bg-white p-5">
                <div className="mb-2 flex items-center justify-between">
                  <h3 className="flex items-center gap-2 text-base font-extrabold text-ink">
                    {grade.name}
                    {grade.isSuper && (
                      <span className="rounded-full bg-[#111111] px-2 py-0.5 text-[11px] font-bold text-white">
                        슈퍼
                      </span>
                    )}
                  </h3>
                  <span className="text-xs text-muted">{grade.adminCount}명</span>
                </div>
                {grade.description && (
                  <p className="mb-3 text-sm text-muted">{grade.description}</p>
                )}
                <div className="mb-4 flex flex-wrap gap-1.5">
                  {grade.isSuper ? (
                    <span className="rounded-full bg-[#f5f6f8] px-2.5 py-1 text-xs text-ink">
                      전체 메뉴
                    </span>
                  ) : (
                    allMenus
                      .filter((m) => grade.menuKeys.includes(m.menuKey))
                      .map((m) => (
                        <span
                          key={m.menuKey}
                          className="rounded-full bg-[#f5f6f8] px-2.5 py-1 text-xs text-ink"
                        >
                          {m.label}
                        </span>
                      ))
                  )}
                </div>
                <div className="flex items-center gap-3 text-xs font-bold">
                  <button
                    onClick={() => setEditTarget(grade)}
                    className="text-ink hover:text-brand-strong"
                  >
                    수정
                  </button>
                  {!grade.isSuper && (
                    <button
                      onClick={() => handleDelete(grade)}
                      className="text-[#da1d52] hover:text-[#b3123f]"
                    >
                      삭제
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {formOpen && (
        <AdminGradeFormModal allMenus={allMenus} onSubmit={handleCreate} onClose={() => setFormOpen(false)} />
      )}
      {editTarget && (
        <AdminGradeFormModal
          allMenus={allMenus}
          initial={editTarget}
          onSubmit={handleUpdate}
          onClose={() => setEditTarget(null)}
        />
      )}
    </>
  );
}
