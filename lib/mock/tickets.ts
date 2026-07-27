import type {
  LeagueBrief,
  StadiumBrief,
  TeamBrief,
  TicketDetail,
  TicketListResponse,
  TicketSummary,
} from "../types";

export const STATUS_FILTERS = ["전체", "OPEN", "PENDING", "CLOSED"];

const TEAMS = ["FC 레미", "유나이티드", "아틀레티코", "레알 소시", "분데스 FC", "세리에 SC"];
const STADIUMS = ["레미 스타디움", "센트럴 아레나", "리버사이드 파크"];
const LEAGUES = ["프리미어리그", "라리가", "세리에A", "K리그1"];

function makeTicket(id: number): TicketSummary {
  const home = TEAMS[id % TEAMS.length];
  const away = TEAMS[(id + 2) % TEAMS.length];
  return {
    ticketId: id,
    title: `${home} vs ${away}`,
    matchDatetime: new Date(2026, 7, (id % 27) + 1, 19, 0).toISOString(),
    stadiumName: STADIUMS[id % STADIUMS.length],
    leagueName: LEAGUES[id % LEAGUES.length],
    reservationStatus: id % 5 === 0 ? "CLOSED" : "OPEN",
    isReservable: id % 5 !== 0,
    minPrice: 30000 + (id % 5) * 10000,
  };
}

const list: TicketSummary[] = Array.from({ length: 20 }, (_, i) => makeTicket(23 - i));

export const mockTickets: TicketListResponse = {
  totalElements: 23,
  totalPages: 2,
  tickets: list,
};

export const mockTicketDetail: TicketDetail = {
  ticketId: 1,
  competitionType: "LEAGUE",
  leagueId: 1,
  leagueName: "프리미어리그",
  tournamentId: null,
  tournamentName: null,
  homeTeamId: 1,
  homeTeamName: "FC 레미",
  awayTeamId: 2,
  awayTeamName: "유나이티드",
  stadiumId: 1,
  stadiumName: "레미 스타디움",
  matchDatetime: new Date(2026, 7, 12, 19, 0).toISOString(),
  timezone: "Asia/Seoul",
  reservationStatus: "OPEN",
  isReservable: true,
  sourceUrl: null,
  ticketOptions: [
    { ticketOptionId: 1, seatType: "VIP", price: 100000, currency: "KRW", maxQuantity: 4, isActive: true },
    { ticketOptionId: 2, seatType: "일반석", price: 50000, currency: "KRW", maxQuantity: 4, isActive: true },
  ],
};

export const mockStadiums: StadiumBrief[] = STADIUMS.map((name, i) => ({
  stadiumId: i + 1,
  name,
  city: "서울",
  country: "대한민국",
}));

export const mockLeagues: LeagueBrief[] = LEAGUES.map((name, i) => ({
  leagueId: i + 1,
  name,
  country: null,
  logoUrl: null,
}));

export const mockTeams: TeamBrief[] = TEAMS.map((name, i) => ({
  teamId: i + 1,
  name,
  leagueId: 1,
  leagueName: LEAGUES[0],
  logoUrl: null,
}));
