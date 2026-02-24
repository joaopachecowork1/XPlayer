/**
 * Sistema de XP baseado em tempo real
 * - 10 XP por minuto (600 XP por hora)
 * - Bónus de streak multiplicador
 */
export class XPCalculator {
  private static readonly XP_PER_MINUTE = 10;
  /** Cada nível requer uma quantidade fixa de XP. */
  private static readonly XP_PER_LEVEL = 1000;
  
  static calculateXP(durationInSeconds: number, streakDays: number = 0): number {
    const minutes = Math.floor(durationInSeconds / 60);
    const baseXP = minutes * this.XP_PER_MINUTE;
    const streakMultiplier = 1 + (streakDays * 0.05); // +5% por dia de streak
    return Math.floor(baseXP * streakMultiplier);
  }

  static calculateLevel(totalXP: number): number {
    // Regra atual: 1000 XP por nível.
    // Nível 1: 0-999 XP, Nível 2: 1000-1999 XP, etc.
    return Math.max(1, Math.floor(totalXP / this.XP_PER_LEVEL) + 1);
  }

  static calculateXPToNextLevel(currentLevel: number): number {
    const nextLevelThreshold = currentLevel * this.XP_PER_LEVEL;
    return nextLevelThreshold;
  }

  static calculateXPForCurrentLevel(currentLevel: number): number {
    // XP mínimo necessário para o nível atual.
    return Math.max(0, (currentLevel - 1) * this.XP_PER_LEVEL);
  }

  static calculateXPToNextLevelFromTotal(totalXP: number): number {
    const currentLevel = this.calculateLevel(totalXP);
    const nextLevelMinXP = currentLevel * this.XP_PER_LEVEL;
    return Math.max(0, nextLevelMinXP - totalXP);
  }
}