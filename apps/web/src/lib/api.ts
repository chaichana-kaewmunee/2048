export interface HealthResponse {
  readonly status: 'ok';
  readonly service: string;
  readonly version: string;
}

export interface LeaderboardEntry {
  readonly id: string;
  readonly playerName: string;
  readonly score: number;
  readonly highestTile: number;
  readonly mode: string;
  readonly createdAt: string;
}

export interface SubmitScorePayload {
  readonly playerName: string;
  readonly score: number;
  readonly highestTile: number;
  readonly mode?: string;
}

const configuredBase = (import.meta.env.VITE_API_BASE_URL ?? '').trim().replace(/\/$/, '');

export async function getApiHealth(signal?: AbortSignal): Promise<HealthResponse> {
  const response = await fetch(`${configuredBase}/api/v1/health`, {
    signal: signal ?? null,
    headers: { Accept: 'application/json' },
  });
  if (!response.ok) {
    throw new Error(`Health request failed with status ${response.status}.`);
  }
  const data: unknown = await response.json();
  if (
    typeof data !== 'object' ||
    data === null ||
    !('status' in data) ||
    data.status !== 'ok' ||
    !('service' in data) ||
    typeof data.service !== 'string' ||
    !('version' in data) ||
    typeof data.version !== 'string'
  ) {
    throw new Error('Health response has an invalid shape.');
  }
  return { status: 'ok', service: data.service, version: data.version };
}

export async function getLeaderboard(mode = 'classic', limit = 20, signal?: AbortSignal): Promise<LeaderboardEntry[]> {
  const response = await fetch(`${configuredBase}/api/v1/leaderboard?mode=${encodeURIComponent(mode)}&limit=${limit}`, {
    signal: signal ?? null,
    headers: { Accept: 'application/json' },
  });
  if (!response.ok) {
    throw new Error(`Leaderboard request failed with status ${response.status}.`);
  }
  const data: unknown = await response.json();
  if (typeof data === 'object' && data !== null && 'entries' in data && Array.isArray((data as { entries: unknown }).entries)) {
    return (data as { entries: LeaderboardEntry[] }).entries;
  }
  return [];
}

export async function submitLeaderboardScore(
  payload: SubmitScorePayload,
  signal?: AbortSignal,
): Promise<{ success: boolean; rank?: number }> {
  const response = await fetch(`${configuredBase}/api/v1/leaderboard`, {
    method: 'POST',
    signal: signal ?? null,
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    throw new Error(`Score submission failed with status ${response.status}.`);
  }
  const data: unknown = await response.json();
  if (typeof data === 'object' && data !== null && 'rank' in data) {
    return { success: true, rank: Number((data as { rank: number }).rank) };
  }
  return { success: true };
}
