import React, { memo, useMemo, useRef, useState } from 'react';
import {
  Button,
  Callout,
  Classes,
  Code,
  Dialog,
  HTMLTable,
  Icon,
  Intent,
  ProgressBar,
  Tag,
  TextArea,
} from '@blueprintjs/core';
import styled from 'styled-components';
import { useBackpackApi } from 'api/backpack';
import { useInvalidateArtifacts } from 'api/queries';
import { Processor } from 'types/Processor';
import { CancelledError, mapWithConcurrency } from 'utils/async';
import {
  ADD_OUTCOME_TEXT,
  AddOutcome,
  classifyAddResponse,
} from 'utils/addArtifact';
import { getErrorMessage } from 'utils/errors';
import { auxFieldList, parseAuxConfig } from 'utils/processorConfig';
import { ScrollTableContainer } from 'app/components/ScrollTableContainer';
import { BulkLine, parseBulkLines } from './parseBulkLines';

interface Props {
  processor: Processor;
  isOpen: boolean;
  onClose: () => void;
}

type RowStatus =
  | { state: 'waiting' }
  | { state: 'running' }
  | { state: 'done'; outcome: AddOutcome }
  | { state: 'failed'; message: string }
  | { state: 'skipped' };

const Layout = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 2fr) minmax(240px, 1fr);
  gap: 1rem;

  @media (max-width: 800px) {
    grid-template-columns: 1fr;
  }
`;

const STATUS_TAG: Record<
  string,
  {
    intent: Intent;
    icon: 'tick' | 'time' | 'duplicate' | 'error' | 'disable' | 'refresh';
  }
> = {
  added: { intent: Intent.SUCCESS, icon: 'tick' },
  pending: { intent: Intent.WARNING, icon: 'time' },
  exists: { intent: Intent.NONE, icon: 'duplicate' },
  failed: { intent: Intent.DANGER, icon: 'error' },
  skipped: { intent: Intent.NONE, icon: 'disable' },
  running: { intent: Intent.PRIMARY, icon: 'refresh' },
};

const StatusTag = ({ status }: { status?: RowStatus }) => {
  if (!status || status.state === 'waiting') {
    return <span className={Classes.TEXT_MUTED}>Waiting</span>;
  }
  if (status.state === 'running') {
    return (
      <Tag minimal intent={Intent.PRIMARY}>
        Adding…
      </Tag>
    );
  }
  if (status.state === 'skipped') {
    return (
      <Tag minimal icon="disable">
        Stopped
      </Tag>
    );
  }
  if (status.state === 'failed') {
    return (
      <Tag
        minimal
        intent={Intent.DANGER}
        icon="error"
        htmlTitle={status.message}
      >
        Failed: {status.message}
      </Tag>
    );
  }
  const style = STATUS_TAG[status.outcome];
  return (
    <Tag minimal intent={style.intent} icon={style.icon}>
      {ADD_OUTCOME_TEXT[status.outcome]}
    </Tag>
  );
};

export const BulkAddDialog = memo(({ processor, isOpen, onClose }: Props) => {
  const backpack = useBackpackApi();
  const invalidate = useInvalidateArtifacts();
  const aux = useMemo(() => parseAuxConfig(processor.config), [processor]);
  const exampleKey = auxFieldList(aux)[0]?.key ?? 'key';

  const [text, setText] = useState('');
  const [phase, setPhase] = useState<'edit' | 'running' | 'done'>('edit');
  const [statuses, setStatuses] = useState<Record<number, RowStatus>>({});
  const stopRequested = useRef(false);

  const lines = useMemo(() => parseBulkLines(text, aux), [text, aux]);
  const valid = lines.filter(l => l.errors.length === 0);
  const invalidCount = lines.length - valid.length;

  const setStatus = (line: number, status: RowStatus) =>
    setStatuses(prev => ({ ...prev, [line]: status }));

  const submit = async (batch: BulkLine[]) => {
    stopRequested.current = false;
    setPhase('running');
    setStatuses(prev => {
      const next = { ...prev };
      batch.forEach(l => (next[l.line] = { state: 'waiting' }));
      return next;
    });

    await mapWithConcurrency(
      batch,
      4,
      async line => {
        setStatus(line.line, { state: 'running' });
        try {
          const response = await backpack.AddArtifact({
            id: line.id,
            processor: processor.id,
            filter: line.filter,
            config: line.config,
          });
          setStatus(line.line, {
            state: 'done',
            outcome: classifyAddResponse(response.data),
          });
        } catch (e) {
          setStatus(line.line, {
            state: 'failed',
            message: getErrorMessage(e),
          });
          throw e;
        }
      },
      () => stopRequested.current,
    ).then(results =>
      results.forEach((r, i) => {
        if (r.status === 'rejected' && r.reason instanceof CancelledError) {
          setStatus(batch[i].line, { state: 'skipped' });
        }
      }),
    );

    invalidate(processor.id);
    setPhase('done');
  };

  const counts = useMemo(() => {
    const c = { added: 0, pending: 0, exists: 0, failed: 0, skipped: 0 };
    Object.values(statuses).forEach(s => {
      if (s.state === 'done') c[s.outcome]++;
      if (s.state === 'failed') c.failed++;
      if (s.state === 'skipped') c.skipped++;
    });
    return c;
  }, [statuses]);
  const finished =
    counts.added +
    counts.pending +
    counts.exists +
    counts.failed +
    counts.skipped;
  const submittedLines = valid.filter(l => statuses[l.line]);
  const retryable = valid.filter(l => {
    const s = statuses[l.line];
    return s?.state === 'failed' || s?.state === 'skipped';
  });

  const reset = () => {
    setText('');
    setStatuses({});
    setPhase('edit');
  };

  const close = () => {
    if (phase === 'running') {
      return;
    }
    if (phase === 'done') {
      reset();
    }
    onClose();
  };

  const isRunning = phase === 'running';

  return (
    <Dialog
      isOpen={isOpen}
      onClose={close}
      title={`Bulk add artifacts: ${processor.id}`}
      icon="add-row-bottom"
      style={{ width: 'min(1000px, 95vw)' }}
      canOutsideClickClose={!isRunning}
      canEscapeKeyClose={!isRunning}
      isCloseButtonShown={!isRunning}
    >
      <div className={Classes.DIALOG_BODY}>
        {phase === 'edit' ? (
          <Layout>
            <div>
              <label
                className={Classes.LABEL}
                htmlFor="bulk-add-text"
                style={{ marginBottom: 5 }}
              >
                Artifacts, one per line
              </label>
              <TextArea
                id="bulk-add-text"
                fill
                size="large"
                placeholder={`react\nlodash;^4\\.\nmy-pkg;;${exampleKey}=value`}
                value={text}
                onChange={e => setText(e.target.value)}
                style={{ minHeight: 220, fontFamily: 'monospace' }}
              />
              {lines.length > 0 && (
                <ScrollTableContainer style={{ maxHeight: 260, marginTop: 12 }}>
                  <HTMLTable compact striped style={{ width: '100%' }}>
                    <thead>
                      <tr>
                        <th>Line</th>
                        <th>ID</th>
                        <th>Filter</th>
                        <th>Config</th>
                        <th>Check</th>
                      </tr>
                    </thead>
                    <tbody>
                      {lines.map(l => (
                        <tr key={l.line}>
                          <td className={Classes.TEXT_MUTED}>{l.line}</td>
                          <td style={{ fontWeight: 600, whiteSpace: 'nowrap' }}>
                            {l.id}
                          </td>
                          <td style={{ fontFamily: 'monospace' }}>
                            {l.filter || (
                              <span className={Classes.TEXT_MUTED}>all</span>
                            )}
                          </td>
                          <td
                            style={{
                              fontSize: '0.85em',
                              overflowWrap: 'anywhere',
                            }}
                          >
                            {Object.entries(l.config)
                              .map(([k, v]) => `${k}=${v}`)
                              .join(', ')}
                          </td>
                          <td>
                            {l.errors.length > 0 ? (
                              <span style={{ color: 'var(--danger-text)' }}>
                                <Icon icon="error" intent={Intent.DANGER} />{' '}
                                {l.errors.join(' ')}
                              </span>
                            ) : l.warnings.length > 0 ? (
                              <span>
                                <Icon
                                  icon="warning-sign"
                                  intent={Intent.WARNING}
                                />{' '}
                                {l.warnings.join(' ')}
                              </span>
                            ) : (
                              <Icon
                                icon="tick"
                                intent={Intent.SUCCESS}
                                title="OK"
                              />
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </HTMLTable>
                </ScrollTableContainer>
              )}
            </div>
            <div>
              <Callout title="Format" intent={Intent.PRIMARY} icon="help">
                <Code>ID;Filter;Key=Value;...</Code>
                <ul
                  style={{
                    paddingLeft: '1.2rem',
                    margin: '0.5rem 0',
                    fontSize: '0.9em',
                  }}
                >
                  <li>
                    <b>ID</b>: the artifact name.
                  </li>
                  <li>
                    <b>Filter</b>: version regex, optional. Leave empty for
                    every version.
                  </li>
                  <li>
                    <b>Config</b>: <Code>key=value</Code> pairs. Values may
                    contain <Code>=</Code>.
                  </li>
                  <li>
                    Lines starting with <Code>#</Code> are ignored.
                  </li>
                </ul>
                {auxFieldList(aux).length > 0 && (
                  <div style={{ fontSize: '0.9em' }}>
                    Keys for {processor.id}:{' '}
                    {auxFieldList(aux).map(f => (
                      <Code key={f.key} style={{ marginRight: 4 }}>
                        {f.key}
                      </Code>
                    ))}
                  </div>
                )}
              </Callout>
              {processor.requires_approval && (
                <Callout
                  intent={Intent.WARNING}
                  style={{ marginTop: '1rem' }}
                  icon="shield"
                >
                  These artifacts need administrator approval before collection
                  starts.
                </Callout>
              )}
            </div>
          </Layout>
        ) : (
          <>
            <ProgressBar
              value={
                submittedLines.length ? finished / submittedLines.length : 0
              }
              intent={counts.failed ? Intent.WARNING : Intent.PRIMARY}
              animate={isRunning}
              stripes={isRunning}
            />
            <p style={{ margin: '12px 0' }} aria-live="polite">
              {isRunning
                ? `Adding ${finished} of ${submittedLines.length}…`
                : `Finished: ${counts.added} added, ${
                    counts.pending
                  } waiting for approval, ${counts.exists} already tracked, ${
                    counts.failed
                  } failed${
                    counts.skipped ? `, ${counts.skipped} stopped` : ''
                  }.`}
            </p>
            <ScrollTableContainer style={{ maxHeight: '50vh' }}>
              <HTMLTable compact striped style={{ width: '100%' }}>
                <thead>
                  <tr>
                    <th>Line</th>
                    <th>ID</th>
                    <th>Result</th>
                  </tr>
                </thead>
                <tbody>
                  {lines.map(l => (
                    <tr key={l.line}>
                      <td className={Classes.TEXT_MUTED}>{l.line}</td>
                      <td style={{ fontWeight: 600, whiteSpace: 'nowrap' }}>
                        {l.id || l.raw}
                      </td>
                      <td>
                        {l.errors.length > 0 ? (
                          <Tag
                            minimal
                            icon="disable"
                            htmlTitle={l.errors.join(' ')}
                          >
                            Skipped: {l.errors[0]}
                          </Tag>
                        ) : (
                          <StatusTag status={statuses[l.line]} />
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </HTMLTable>
            </ScrollTableContainer>
          </>
        )}
      </div>
      <div className={Classes.DIALOG_FOOTER}>
        <div className={Classes.DIALOG_FOOTER_ACTIONS}>
          {phase === 'edit' && (
            <>
              {invalidCount > 0 && (
                <span
                  className={Classes.TEXT_MUTED}
                  style={{ alignSelf: 'center', marginRight: 8 }}
                >
                  {invalidCount} line{invalidCount === 1 ? '' : 's'} with errors
                  will be skipped
                </span>
              )}
              <Button onClick={close}>Cancel</Button>
              <Button
                intent={Intent.PRIMARY}
                icon="add"
                onClick={() => submit(valid)}
                disabled={valid.length === 0}
              >
                Add {valid.length || ''} artifact{valid.length === 1 ? '' : 's'}
              </Button>
            </>
          )}
          {isRunning && (
            <Button
              icon="stop"
              onClick={() => (stopRequested.current = true)}
              text="Stop after current"
            />
          )}
          {phase === 'done' && (
            <>
              <Button
                text="Edit list"
                onClick={() => {
                  setStatuses({});
                  setPhase('edit');
                }}
              />
              {retryable.length > 0 && (
                <Button
                  icon="refresh"
                  intent={Intent.WARNING}
                  text={`Retry ${retryable.length}`}
                  onClick={() => submit(retryable)}
                />
              )}
              <Button intent={Intent.PRIMARY} text="Close" onClick={close} />
            </>
          )}
        </div>
      </div>
    </Dialog>
  );
});
