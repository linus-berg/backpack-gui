import { Intent, Position, Toaster, ToastProps } from '@blueprintjs/core';
import type { ReactNode } from 'react';

/** Application-wide toaster, mounted once at the top of the page. */
export const AppToaster = Toaster.create({
  position: Position.TOP,
  maxToasts: 5,
});

type Extra = Partial<Omit<ToastProps, 'message'>>;

/**
 * Shortcuts for showing toasts with consistent intents, icons and timeouts.
 * Errors stay up longer so people have time to read them.
 */
export const notify = {
  success: (message: ReactNode, extra: Extra = {}) =>
    AppToaster.show({
      message,
      intent: Intent.SUCCESS,
      icon: 'tick',
      ...extra,
    }),
  info: (message: ReactNode, extra: Extra = {}) =>
    AppToaster.show({
      message,
      intent: Intent.NONE,
      icon: 'info-sign',
      ...extra,
    }),
  warning: (message: ReactNode, extra: Extra = {}) =>
    AppToaster.show({
      message,
      intent: Intent.WARNING,
      icon: 'warning-sign',
      timeout: 8000,
      ...extra,
    }),
  error: (message: ReactNode, extra: Extra = {}) =>
    AppToaster.show({
      message,
      intent: Intent.DANGER,
      icon: 'error',
      timeout: 10000,
      ...extra,
    }),
};
