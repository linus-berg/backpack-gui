import React from 'react';
import {
  Button,
  Classes,
  IconName,
  NonIdealState,
  Spinner,
} from '@blueprintjs/core';
import styled from 'styled-components';
import { getErrorMessage } from 'utils/errors';

const Center = styled.div<{ $fullPage?: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 3rem 1rem;
  ${p => (p.$fullPage ? 'height: 100vh;' : 'flex: 1; min-height: 160px;')}
`;

/** Centered spinner for a section that is loading. */
export const LoadingState = ({ label }: { label?: string }) => (
  <Center role="status" aria-live="polite">
    <Spinner size={40} />
    {label && <div className={Classes.TEXT_MUTED}>{label}</div>}
  </Center>
);

/** Spinner that fills the viewport; used before the app shell renders. */
export const FullPageSpinner = ({ label }: { label?: string }) => (
  <Center $fullPage role="status" aria-live="polite">
    <Spinner size={50} />
    {label && <div className={Classes.TEXT_MUTED}>{label}</div>}
  </Center>
);

interface FullPageMessageProps {
  icon?: IconName;
  title: string;
  description?: string | JSX.Element;
  action?: JSX.Element;
}

/** Full-viewport message for failures that happen before routing exists. */
export const FullPageMessage = ({
  icon = 'error',
  title,
  description,
  action,
}: FullPageMessageProps) => (
  <Center $fullPage>
    <NonIdealState
      icon={icon}
      title={title}
      description={description}
      action={action}
    />
  </Center>
);

interface QueryErrorStateProps {
  error: unknown;
  onRetry?: () => void;
  title?: string;
}

/** Explains why data failed to load and offers a retry. */
export const QueryErrorState = ({
  error,
  onRetry,
  title = "Couldn't load this data",
}: QueryErrorStateProps) => (
  <Center>
    <NonIdealState
      icon="error"
      title={title}
      description={getErrorMessage(error)}
      action={
        onRetry ? (
          <Button icon="refresh" text="Try again" onClick={onRetry} />
        ) : undefined
      }
    />
  </Center>
);

interface EmptyStateProps {
  icon?: IconName;
  title: string;
  description?: string | JSX.Element;
  action?: JSX.Element;
}

/** Shown when a list has nothing in it. */
export const EmptyState = ({
  icon = 'inbox',
  title,
  description,
  action,
}: EmptyStateProps) => (
  <Center>
    <NonIdealState
      icon={icon}
      title={title}
      description={description}
      action={action}
    />
  </Center>
);
