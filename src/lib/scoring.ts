const LEGACY_CASE_BONUS = 40;
const WON_CASE_BASE = 20;

export function calculateCasePoints(input: {
  isLegacy: boolean;
  wonCase: boolean;
  customPoints?: number;
}): number {
  const custom = Number.isFinite(input.customPoints) ? Number(input.customPoints) : 0;
  let total = Math.max(0, custom);

  if (input.wonCase) {
    total += WON_CASE_BASE;
  }

  if (input.isLegacy) {
    total += LEGACY_CASE_BONUS;
  }

  return total;
}

export function calculateLevel(totalPoints: number): number {
  if (totalPoints >= 600) return 6;
  if (totalPoints >= 420) return 5;
  if (totalPoints >= 270) return 4;
  if (totalPoints >= 150) return 3;
  if (totalPoints >= 60) return 2;
  return 1;
}
