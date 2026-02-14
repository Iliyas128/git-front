export type UserRole = 'admin' | 'club' | 'player';

export interface User {
  id: string;
  phone: string;
  role: UserRole;
  name?: string;
  email?: string;
  createdAt: string;
}

export interface Player extends User {
  role: 'player';
  balance: number;
  clubId?: string;
  prizes: Prize[];
  history: Transaction[];
}

export interface Club extends User {
  role: 'club';
  clubId: string;
  clubName: string;
  qrCode: string;
  token: string;
  players: string[];
  statistics: ClubStatistics;
}

export interface Admin extends User {
  role: 'admin';
}

export interface Prize {
  id: string;
  name: string;
  type: 'physical' | 'points' | 'time' | 'none' | 'club_time';
  value?: number;
  description: string;
  image?: string;
  probability: number;
  slotIndex?: number;
  status: 'pending' | 'confirmed' | 'issued';
  wonAt: string;
  clubId?: string;
}

export interface Transaction {
  id: string;
  type: 'earned' | 'spent' | 'prize';
  amount: number;
  description: string;
  date: string;
  clubId?: string;
}

export interface ClubStatistics {
  totalPlayers: number;
  totalSpins: number;
  totalPrizes: number;
  activePlayers: number;
}

export interface RouletteSlot {
  id: string;
  prizeId: string;
  probability: number;
}

export interface RouletteConfig {
  slots: RouletteSlot[];
  totalProbability: number;
}
