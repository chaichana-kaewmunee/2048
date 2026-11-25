import type { GameResult, PlayerStatistics } from './types';

export const EMPTY_STATISTICS: PlayerStatistics = {
  totalGamesPlayed: 0,
  totalGamesWon: 0,
  totalGamesLost: 0,
  bestScore: 0,
  highestTile: 0,
  averageScore: 0,
};

export function applyGameResult(
  statistics: PlayerStatistics,
  result: GameResult,
  totalScore: number,
): { statistics: PlayerStatistics; totalScore: number } {
  const played = statistics.totalGamesPlayed + 1;
  const nextTotalScore = totalScore + result.score;

  return {
    totalScore: nextTotalScore,
    statistics: {
      totalGamesPlayed: played,
      totalGamesWon: statistics.totalGamesWon + Number(result.won),
      totalGamesLost: statistics.totalGamesLost + Number(result.lost),
      bestScore: Math.max(statistics.bestScore, result.score),
      highestTile: Math.max(statistics.highestTile, result.highestTile),
      averageScore: nextTotalScore / played,
    },
  };
}
