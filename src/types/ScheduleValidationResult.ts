export interface ScheduleValidationResult {
  valid: boolean;
  nextOccurrences: string[];
  error?: string;
}
