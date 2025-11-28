// src/lib/metrics.ts
export type MetricEvent =
  | 'user_register'
  | 'user_login'
  | 'user_delete'
  | 'save_progress'
  | 'get_latest_save'
  | 'get_save_history'
  | 'session_finished'
  | 'leaderboard_view';

export function logEvent(
  event: MetricEvent,
  payload: Record<string, unknown> = {}
) {
  // Simple structured logging - good enough as "instrumentation"
  console.log(
    '[METRIC]',
    new Date().toISOString(),
    event,
    JSON.stringify(payload)
  );
}
