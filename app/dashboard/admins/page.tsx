"use client";

import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import AdminAccountFormModal, {
  type AdminAccountFormValues,
} from "@/components/admins/AdminAccountFormModal";
import Header from "@/components/Header";
import MockBanner from "@/components/MockBanner";
import { useAdminSession } from "@/lib/admin-session";
import {
  createAdminAccount,
  getAdminAccounts,
  getAdminGrades,
  updateAdminAccountGrade,
  updateAdminAccountStatus,
} from "@/lib/services";
import type { AdminAccountSummary, AdminGradeSummary } from "@/lib/types";

export default function AdminAccountsPage() {
  const router = useRouter();
  const { name, isSuper, loading: sessionLoading } = useAdminSession();

  const [accounts, setAccounts] = useState<AdminAccountSummary[]>([]);
  const [grades, setGrades] = useState<AdminGradeSummary[]>([]);
  const [fromMock, setFromMock] = useState(false);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);

  const load = () => {
    Promise.all([getAdminAccounts(), getAdminGrades()]).then(([accountsRes, gradesRes]) => {
      setAccounts(accountsRes.data.accounts);
      setGrades(gradesRes.data.grades);
      setFromMock(accountsRes.fromMock || gradesRes.fromMock);
      setLoading(false);
    });
  };

  useEffect(load, []);

  // 슈퍼 관리자가 아니면 접근 차단
  useEffect(() => {
    if (!sessionLoading && !isSuper) {
      router.replace("/dashboard");
    }
  }, [sessionLoading, isSuper, router]);

  const handleCreate = async (values: AdminAccountFormValues) => {
    await createAdminAccount(values);
    setFormOpen(false);
    setLoading(true);
    load();
  };

  const handleGradeChange = async (adminId: number, gradeId: number) => {
    await updateAdminAccountGrade(adminId, gradeId);
    setLoading(true);
    load();
  };

  const handleStatusToggle = async (account: AdminAccountSummary) => {
    const next = account.status === "ACTIVE" ? "BLOCKED" : "ACTIVE";
    await updateAdminAccountStatus(account.adminId, next);
    setLoading(true);
    load();
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
            전체 <span className="font-bold">{accounts.length}</span>
          </p>
          <button
            onClick={() => setFormOpen(true)}
            className="flex items-center gap-1.5 rounded-lg bg-[#111111] px-4 py-2.5 text-sm font-bold text-white transition hover:bg-black"
          >
            <Plus size={16} /> 관리자 추가
          </button>
        </div>

        {loading ? (
          <div className="h-64 animate-pulse rounded-2xl border border-[#eeeeee] bg-white/60" />
        ) : accounts.length === 0 ? (
          <div className="rounded-2xl border border-[#eeeeee] bg-white py-20 text-center text-sm text-muted">
            등록된 관리자 계정이 없습니다.
          </div>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-[#eeeeee] bg-white">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead>
                <tr className="border-b border-[#eeeeee] text-xs font-bold text-muted">
                  <th className="px-5 py-3">이메일</th>
                  <th className="px-5 py-3">이름</th>
                  <th className="px-5 py-3">등급</th>
                  <th className="px-5 py-3">상태</th>
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody>
                {accounts.map((account) => (
                  <tr key={account.adminId} className="border-b border-[#f5f5f5] last:border-0">
                    <td className="px-5 py-3 text-ink">{account.email}</td>
                    <td className="px-5 py-3 text-ink">
                      {account.name}
                      {account.isSuper && (
                        <span className="ml-2 rounded-full bg-[#111111] px-2 py-0.5 text-[11px] font-bold text-white">
                          슈퍼
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3">
                      <select
                        value={account.gradeId ?? ""}
                        onChange={(e) => handleGradeChange(account.adminId, Number(e.target.value))}
                        className="rounded-lg border border-[#dddddd] bg-white px-2.5 py-1.5 text-sm text-ink outline-none focus:border-[#bbbbbb]"
                      >
                        {grades.map((g) => (
                          <option key={g.gradeId} value={g.gradeId}>
                            {g.name}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-5 py-3">
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-bold ${
                          account.status === "ACTIVE"
                            ? "bg-[#eaf7ef] text-[#1c8a4c]"
                            : "bg-[#fdecef] text-[#da1d52]"
                        }`}
                      >
                        {account.status === "ACTIVE" ? "정상" : "차단"}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-right">
                      <button
                        onClick={() => handleStatusToggle(account)}
                        className="text-xs font-bold text-ink hover:text-brand-strong"
                      >
                        {account.status === "ACTIVE" ? "차단하기" : "차단해제"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>

      {formOpen && (
        <AdminAccountFormModal grades={grades} onSubmit={handleCreate} onClose={() => setFormOpen(false)} />
      )}
    </>
  );
}
