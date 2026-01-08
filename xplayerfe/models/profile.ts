export interface UserProfile {
  id: string;
  username: string;
  level: number;
  currentXP: number;
  xpToNextLevel: number;
  totalXP: number;
  streak: number;
  totalSessions: number;
  totalTimeTracked: number; // em segundos
}