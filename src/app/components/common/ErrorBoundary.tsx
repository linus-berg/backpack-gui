import React, { ErrorInfo, ReactNode } from 'react';
import { Button, ButtonGroup, Code, NonIdealState } from '@blueprintjs/core';

interface Props {
  children: ReactNode;
  /** When this value changes the boundary clears its error (e.g. on navigation). */
  resetKey?: unknown;
  title?: string;
}

interface State {
  error: Error | null;
}

/**
 * Catches render errors so one broken component shows a message instead of
 * blanking the entire app.
 */
export class ErrorBoundary extends React.Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Backpack UI error', error, info.componentStack);
  }

  componentDidUpdate(prevProps: Props) {
    if (this.state.error && prevProps.resetKey !== this.props.resetKey) {
      this.setState({ error: null });
    }
  }

  render() {
    const { error } = this.state;
    if (!error) {
      return this.props.children;
    }
    return (
      <div style={{ padding: '3rem 1rem' }}>
        <NonIdealState
          icon="error"
          title={this.props.title ?? 'Something went wrong'}
          description={
            <>
              <p>This part of the page failed to display.</p>
              <Code>{error.message}</Code>
            </>
          }
          action={
            <ButtonGroup>
              <Button
                icon="refresh"
                text="Try again"
                onClick={() => this.setState({ error: null })}
              />
              <Button
                icon="repeat"
                text="Reload page"
                onClick={() => window.location.reload()}
              />
            </ButtonGroup>
          }
        />
      </div>
    );
  }
}
