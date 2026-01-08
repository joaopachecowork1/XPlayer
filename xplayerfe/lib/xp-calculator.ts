/**
 * Sistema de XP baseado em tempo real
 * - 10 XP por minuto (600 XP por hora)
 * - Bónus de streak multiplicador
 */
export class XPCalculator {
  private static readonly XP_PER_MINUTE = 10;
  
  static calculateXP(durationInSeconds: number, streakDays: number = 0): number {
    const minutes = Math.floor(durationInSeconds / 60);
    const baseXP = minutes * this.XP_PER_MINUTE;
    const streakMultiplier = 1 + (streakDays * 0.05); // +5% por dia de streak
    return Math.floor(baseXP * streakMultiplier);
  }

  static calculateLevel(totalXP: number): number {
    // Fórmula: level = floor(sqrt(totalXP / 100))
    return Math.floor(Math.sqrt(totalXP / 100));
  }

  static calculateXPToNextLevel(currentLevel: number): number {
    const nextLevel = currentLevel + 1;
    return (nextLevel * nextLevel * 100);
  }

  static calculateXPForCurrentLevel(currentLevel: number): number {
    return currentLevel * currentLevel * 100;
  }
}