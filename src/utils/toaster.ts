import {
  Intent,
  OverlayToaster,
  Position,
  Toaster,
  ToastProps,
} from '@blueprintjs/core';
import type { ReactNode } from 'react';

let toaster: Promise<Toaster> | null = null;

/**
 * Application-wide toaster. Blueprint 6 mounts toasters asynchronously
 * (React 18+ roots), so it is created on first use and reused afterwards.
 */
export const getToaster = (): Promise<Toaster> =>
  (toaster ??= OverlayToaster.create({ position: Position.TOP, maxToasts: 5 }));

const show = (props: ToastProps) => {
  getToaster()
    .then(t => t.show(props))
    .catch(err => console.error('Could not show toast', err));
};

type Extra = Partial<Omit<ToastProps, 'message'>>;

/**
 * Shortcuts for showing toasts with consistent intents, icons and timeouts.
 * Errors stay up longer so people have time to read them.
 */
export const notify = {
  success: (message: ReactNode, extra: Extra = {}) =>
    show({ message, intent: Intent.SUCCESS, icon: 'tick', ...extra }),
  info: (message: ReactNode, extra: Extra = {}) =>
    show({ message, intent: Intent.NONE, icon: 'info-sign', ...extra }),
  warning: (message: ReactNode, extra: Extra = {}) =>
    show({
      message,
      intent: Intent.WARNING,
      icon: 'warning-sign',
      timeout: 8000,
      ...extra,
    }),
  error: (message: ReactNode, extra: Extra = {}) =>
    show({
      message,
      intent: Intent.DANGER,
      icon: 'error',
      timeout: 10000,
      ...extra,
    }),
};
