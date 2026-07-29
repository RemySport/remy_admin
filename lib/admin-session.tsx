"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { getAdminMe } from "./services";
import type { AdminMenuKey } from "./types";

interface AdminSessionValue {
  name: string;
  email: string;
  isSuper: boolean;
  /** 응답을 받기 전까지는 null — 이 동안 BottomNav 는 기본 메뉴를 그대로 보여준다. */
  menuKeys: AdminMenuKey[] | null;
  loading: boolean;
}

const AdminSessionContext = createContext<AdminSessionValue>({
  name: "",
  email: "",
  isSuper: false,
  menuKeys: null,
  loading: true,
});

export function AdminSessionProvider({ children }: { children: React.ReactNode }) {
  const [value, setValue] = useState<AdminSessionValue>({
    name: "",
    email: "",
    isSuper: false,
    menuKeys: null,
    loading: true,
  });

  useEffect(() => {
    let alive = true;
    getAdminMe().then((res) => {
      if (!alive) return;
      setValue({
        name: res.data.name,
        email: res.data.email,
        isSuper: res.data.isSuper,
        menuKeys: res.data.menuKeys,
        loading: false,
      });
    });
    return () => {
      alive = false;
    };
  }, []);

  return (
    <AdminSessionContext.Provider value={value}>{children}</AdminSessionContext.Provider>
  );
}

export function useAdminSession() {
  return useContext(AdminSessionContext);
}
