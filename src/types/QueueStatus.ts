export interface QueueStatus {
  name: string;
  messages: number;
  consumers: number;
  avg_egress_rate: number;
  avg_ingress_rate: number;
}
