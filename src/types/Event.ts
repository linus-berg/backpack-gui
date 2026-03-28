export enum EventSeverity {
  INFO = 'INFO',
  WARNING = 'WARNING',
  ERROR = 'ERROR',
  SUCCESS = 'SUCCESS',
}

export interface Event {
  id: string;
  timestamp: string;
  source: string;
  message: string;
  severity: EventSeverity;
  user: string;
}
