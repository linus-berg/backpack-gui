import { IconName, Intent } from '@blueprintjs/core';
import { QueueStatus } from 'types/QueueStatus';

export interface QueueHealth {
  rank: number;
  intent: Intent;
  icon: IconName;
  label: string;
  description: string;
}

/**
 * Classifies a queue. Consumers alone don't make a queue healthy: a backlog
 * that grows faster than it drains needs attention too.
 * @param queue Queue statistics from RabbitMQ.
 */
export const getQueueHealth = (queue: QueueStatus): QueueHealth => {
  const ingress = queue.avg_ingress_rate ?? 0;
  const egress = queue.avg_egress_rate ?? 0;
  if (queue.consumers === 0) {
    return {
      rank: 0,
      intent: Intent.DANGER,
      icon: 'error',
      label: 'No consumers',
      description:
        'No service is consuming this queue, so its messages are not processed.',
    };
  }
  if (queue.messages > 0 && ingress > egress) {
    return {
      rank: 1,
      intent: Intent.WARNING,
      icon: 'trending-up',
      label: 'Backlog growing',
      description: 'Messages arrive faster than they are processed.',
    };
  }
  if (queue.messages > 0) {
    return {
      rank: 2,
      intent: Intent.PRIMARY,
      icon: 'exchange',
      label: 'Processing',
      description: 'Working through queued messages.',
    };
  }
  return {
    rank: 3,
    intent: Intent.SUCCESS,
    icon: 'tick',
    label: 'Healthy',
    description: 'Consumers connected and nothing waiting.',
  };
};
