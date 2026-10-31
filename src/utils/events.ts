import { IconName, Intent } from '@blueprintjs/core';
import { EventSeverity } from 'types/Event';

export const SeverityToIntent = (severity: EventSeverity): Intent => {
  switch (severity) {
    case EventSeverity.SUCCESS:
      return Intent.SUCCESS;
    case EventSeverity.ERROR:
      return Intent.DANGER;
    case EventSeverity.WARNING:
      return Intent.WARNING;
    default:
      return Intent.NONE;
  }
};

export const SeverityToIcon = (severity: EventSeverity): IconName => {
  switch (severity) {
    case EventSeverity.SUCCESS:
      return 'tick-circle';
    case EventSeverity.ERROR:
      return 'error';
    case EventSeverity.WARNING:
      return 'warning-sign';
    default:
      return 'info-sign';
  }
};
