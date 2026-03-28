export interface Schedule {
  id: string;
  processor: string;
  cron: string;
  last_run?: string;
  next_run?: string;
}
