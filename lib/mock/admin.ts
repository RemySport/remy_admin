import type {
  AdminAccountListResponse,
  AdminGradeListResponse,
  AdminMenuItem,
  AdminMeResponse,
} from "../types";

export const MOCK_ADMIN_MENUS: AdminMenuItem[] = [
  { menuKey: "DASHBOARD", label: "홈", path: "/dashboard" },
  { menuKey: "MEMBERS", label: "회원관리", path: "/dashboard/members" },
  { menuKey: "TICKETS", label: "티켓관리", path: "/dashboard/products" },
  { menuKey: "ORDERS", label: "구매관리", path: "/dashboard/orders" },
  { menuKey: "GOODS", label: "굿즈관리", path: "/dashboard/goods" },
  { menuKey: "ADMINS", label: "어드민관리", path: "/dashboard/admins" },
];

/** 백엔드 없이 화면을 확인할 때 쓰는 기본 세션 — 슈퍼 관리자로 가정 */
export const mockAdminMe: AdminMeResponse = {
  userId: 1,
  name: "슈퍼관리자",
  email: "admin@remy.com",
  gradeId: 1,
  gradeName: "슈퍼관리자",
  isSuper: true,
  menuKeys: MOCK_ADMIN_MENUS.map((m) => m.menuKey),
};

export const mockAdminAccounts: AdminAccountListResponse = {
  total: 2,
  accounts: [
    {
      adminId: 1,
      email: "admin@remy.com",
      name: "슈퍼관리자",
      gradeId: 1,
      gradeName: "슈퍼관리자",
      isSuper: true,
      status: "ACTIVE",
    },
    {
      adminId: 2,
      email: "goods-manager@remy.com",
      name: "굿즈담당자",
      gradeId: 2,
      gradeName: "굿즈담당",
      isSuper: false,
      status: "ACTIVE",
    },
  ],
};

export const mockAdminGrades: AdminGradeListResponse = {
  grades: [
    {
      gradeId: 1,
      name: "슈퍼관리자",
      description: "모든 어드민 메뉴 및 계정/등급 관리 권한",
      isSuper: true,
      menuKeys: MOCK_ADMIN_MENUS.map((m) => m.menuKey),
      adminCount: 1,
    },
    {
      gradeId: 2,
      name: "굿즈담당",
      description: "굿즈관리 화면만 접근 가능",
      isSuper: false,
      menuKeys: ["DASHBOARD", "GOODS"],
      adminCount: 1,
    },
  ],
  allMenus: MOCK_ADMIN_MENUS,
};
