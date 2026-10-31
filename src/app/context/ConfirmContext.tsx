import React, {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useRef,
  useState,
} from 'react';
import { Alert, H5, IconName, Intent } from '@blueprintjs/core';

export interface ConfirmOptions {
  title?: string;
  message: ReactNode;
  confirmText?: string;
  cancelText?: string;
  intent?: Intent;
  icon?: IconName;
}

type ConfirmFn = (options: ConfirmOptions) => Promise<boolean>;

const ConfirmContext = createContext<ConfirmFn>(() => Promise.resolve(false));

/**
 * Renders a single confirmation dialog for the whole app. Because the dialog
 * lives here rather than next to the button, it keeps working when the
 * trigger unmounts, e.g. a menu item inside a popover or a table cell.
 */
export const ConfirmProvider = ({ children }: { children: ReactNode }) => {
  const [options, setOptions] = useState<ConfirmOptions | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const resolver = useRef<(value: boolean) => void>();

  const confirm = useCallback<ConfirmFn>(opts => {
    resolver.current?.(false);
    setOptions(opts);
    setIsOpen(true);
    return new Promise<boolean>(resolve => {
      resolver.current = resolve;
    });
  }, []);

  const settle = (value: boolean) => {
    resolver.current?.(value);
    resolver.current = undefined;
    setIsOpen(false);
  };

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      <Alert
        isOpen={isOpen}
        intent={options?.intent ?? Intent.DANGER}
        icon={options?.icon ?? 'warning-sign'}
        confirmButtonText={options?.confirmText ?? 'Confirm'}
        cancelButtonText={options?.cancelText ?? 'Cancel'}
        canEscapeKeyCancel
        canOutsideClickCancel
        onConfirm={() => settle(true)}
        onCancel={() => settle(false)}
      >
        {options?.title && <H5>{options.title}</H5>}
        <div>{options?.message}</div>
      </Alert>
    </ConfirmContext.Provider>
  );
};

/**
 * @returns A function that opens the confirmation dialog and resolves to
 * true when the user confirms.
 */
export const useConfirm = () => useContext(ConfirmContext);
