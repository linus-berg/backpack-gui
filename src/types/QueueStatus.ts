export interface QueueStatus {
  name: string;
  /** All messages in the queue: waiting plus in progress. */
  messages: number;
  /** Waiting for a consumer. Missing on APIs from before it was added. */
  messages_ready?: number;
  /** Delivered to a consumer and being processed. */
  messages_in_progress?: number;
  consumers: number;
  avg_egress_rate: number;
  avg_ingress_rate: number;
}
