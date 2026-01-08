import { XPCalculator } from "@/lib/xp-calculator";
import { Session, SessionStatus } from "@/models/session";
import { useState, useEffect, useRef } from "react";

export function useSession() {
  const [activeSession, setActiveSession] = useState<Session | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (activeSession?.status === SessionStatus.ACTIVE) {
      intervalRef.current = setInterval(() => {
        setElapsedTime(prev => prev + 1);
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [activeSession?.status]);

  const startSession = async (taskId?: string) => {
    const session: Session = {
      id: crypto.randomUUID(),
      startTime: new Date(),
      duration: 0,
      taskId,
      xpEarned: 0,
      status: SessionStatus.ACTIVE,
      createdAt: new Date()
    };

    setActiveSession(session);
    setElapsedTime(0);

    // TODO: API call to backend
    // await fetch('/api/sessions', { method: 'POST', body: JSON.stringify(session) });
  };

  const stopSession = async () => {
    if (!activeSession) return;

    const endTime = new Date();
    const duration = elapsedTime;
    const xpEarned = XPCalculator.calculateXP(duration, 0); // TODO: get real streak

    const completedSession: Session = {
      ...activeSession,
      endTime,
      duration,
      xpEarned,
      status: SessionStatus.COMPLETED
    };

    // TODO: API call to backend
    // await fetch(`/api/sessions/${activeSession.id}`, { 
    //   method: 'PUT', 
    //   body: JSON.stringify(completedSession) 
    // });

    setActiveSession(null);
    setElapsedTime(0);

    return completedSession;
  };

  const pauseSession = () => {
    if (activeSession) {
      setActiveSession({ ...activeSession, status: SessionStatus.PAUSED });
    }
  };

  const resumeSession = () => {
    if (activeSession) {
      setActiveSession({ ...activeSession, status: SessionStatus.ACTIVE });
    }
  };

  return {
    activeSession,
    elapsedTime,
    startSession,
    stopSession,
    pauseSession,
    resumeSession,
    isActive: activeSession?.status === SessionStatus.ACTIVE
  };
}