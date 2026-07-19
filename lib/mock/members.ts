import type {
  Member,
  MemberGroup,
  MemberListResponse,
  MemberStatus,
} from "../types";

// 그룹변경 모달 옵션 (Figma 그룹변경 다이얼로그)
export const GROUP_OPTIONS: { value: MemberGroup; desc: string }[] = [
  { value: "일반", desc: "일반 이용으로 할인이 없는 그룹" },
  { value: "단골", desc: "장기 이용으로 할인 적용된 그룹" },
  { value: "제휴A", desc: "제휴A 이용으로 할인 적용된 그룹" },
  { value: "제휴B", desc: "제휴B 이용으로 할인 적용된 그룹" },
];

// 상태변경 모달 옵션 (Figma 상태변경 다이얼로그)
export const STATUS_OPTIONS: { value: MemberStatus; desc: string }[] = [
  { value: "정상", desc: "서비스 이용이 가능한 상태" },
  { value: "차단", desc: "서비스 이용이 제한된 상태" },
];

// 필터 셀렉트 옵션
export const GROUP_FILTERS = ["전체", "일반", "단골", "제휴사 A", "제휴사 B"];
export const STATUS_FILTERS = ["전체", "정상", "차단"];

const NAMES = [
  "장용호",
  "김서연",
  "이준혁",
  "박지민",
  "최유나",
  "정민석",
  "한소희",
  "오세훈",
  "윤아름",
  "강태오",
];
const NICKNAMES = ["퍼시몬", "라임", "코코", "블루밍", "체리", "무민", "포포", "달래"];
const GROUPS: MemberGroup[] = ["일반", "일반", "일반", "단골", "제휴A", "제휴B"];

function makeMember(id: number): Member {
  const name = NAMES[id % NAMES.length];
  const nickname = NICKNAMES[id % NICKNAMES.length];
  const group = GROUPS[id % GROUPS.length];
  // 350번 3명, 나머지는 대부분 정상 / 일부 차단
  const status: MemberStatus = id % 7 === 0 ? "차단" : "정상";
  const gender = id % 2 === 0 ? "남성" : "여성";
  return {
    id,
    name,
    nickname,
    birthYear: 1984 + (id % 20),
    gender,
    group,
    status,
    stats: {
      payment: 1 + (id % 3),
    },
  };
}

// 350명 중 화면에 뿌릴 24명 (번호 350 → 327 내림차순)
const list: Member[] = Array.from({ length: 24 }, (_, i) => makeMember(350 - i));

export const mockMembers: MemberListResponse = {
  total: 350,
  members: list,
};
