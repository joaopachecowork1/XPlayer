export enum SessionStatus {
  ACTIVE = "ACTIVE",
  COMPLETED = "COMPLETED",
  PAUSED = "PAUSED"
}

export interface Session {
  id: string;
  startTime: Date;
  endTime?: Date;
  duration: number; // em segundos
  taskId?: string;
  xpEarned: number;
  status: SessionStatus;
  createdAt: Date;
}