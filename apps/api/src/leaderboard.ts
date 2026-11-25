import { randomUUID } from 'crypto';

export interface LeaderboardRecord {
  id: string;
  playerName: string;
  score: number;
  highestTile: number;
  mode: string;
  createdAt: string;
}

export interface SubmitScoreInput {
  playerName: string;
  score: number;
  highestTile: number;
  mode?: string | undefined;
}

class LeaderboardStore {
  private records: LeaderboardRecord[] = [
    {
      id: 'neon-challenger-1',
      playerName: 'CyberNeon',
      score: 18456,
      highestTile: 2048,
      mode: 'classic',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'neon-challenger-2',
      playerName: 'RetroGrid',
      score: 12280,
      highestTile: 1024,
      mode: 'classic',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'neon-challenger-3',
      playerName: 'SynthMaster',
      score: 8320,
      highestTile: 512,
      mode: 'classic',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'neon-challenger-4',
      playerName: 'GridRunner',
      score: 24520,
      highestTile: 2048,
      mode: '5x5',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'neon-challenger-5',
      playerName: 'FlashFuser',
      score: 9540,
      highestTile: 1024,
      mode: 'time-attack',
      createdAt: new Date().toISOString(),
    },
  ];

  public getLeaderboard(mode = 'classic', limit = 20): LeaderboardRecord[] {
    return this.records
      .filter((entry) => entry.mode === mode)
      .sort((a, b) => b.score - a.score)
      .slice(0, Math.max(1, Math.min(100, limit)));
  }

  public addScore(input: SubmitScoreInput): { record: LeaderboardRecord; rank: number } {
    const sanitizedName = (input.playerName || 'Anonymous').trim().slice(0, 24) || 'Anonymous';
    const targetMode = input.mode || 'classic';

    const record: LeaderboardRecord = {
      id: randomUUID ? randomUUID() : `lb-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      playerName: sanitizedName,
      score: Math.max(0, Math.floor(input.score)),
      highestTile: Math.max(0, Math.floor(input.highestTile)),
      mode: targetMode,
      createdAt: new Date().toISOString(),
    };

    this.records.push(record);
    this.records.sort((a, b) => b.score - a.score);

    // Calculate rank in the mode
    const modeList = this.records.filter((entry) => entry.mode === targetMode);
    const rank = modeList.findIndex((entry) => entry.id === record.id) + 1;

    return { record, rank };
  }
}

export const leaderboardStore = new LeaderboardStore();
