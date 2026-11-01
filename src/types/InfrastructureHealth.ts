/** Status of a health check, as ASP.NET Core reports it. */
export type HealthStatus = 'Healthy' | 'Degraded' | 'Unhealthy';

/** One piece of infrastructure, as the API sees it. */
export interface InfrastructureCheck {
  /** rabbitmq, rabbitmq-management, mongodb, redis, s3 or oidc. */
  name: string;
  status: HealthStatus;
  /** What the check found, e.g. "MongoDB is unreachable." */
  description?: string | null;
  duration_ms: number;
}

/** GET /api/status/health. */
export interface InfrastructureHealth {
  /** The worst status of the checks. */
  status: HealthStatus;
  /** When the API ran the checks (UTC); results are reused for 10 s. */
  checked_at: string;
  checks: InfrastructureCheck[];
}
