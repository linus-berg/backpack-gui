import React, { memo, useMemo, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import {
  Button,
  ButtonGroup,
  Checkbox,
  Classes,
  Dialog,
  FormGroup,
  HTMLTable,
  Intent,
  Tag,
  TextArea,
} from '@blueprintjs/core';
import { useBackpackApi } from 'api/backpack';
import {
  useInvalidateArtifacts,
  usePendingApprovals,
  useProcessors,
} from 'api/queries';
import { useConfirm } from 'app/context/ConfirmContext';
import { PendingArtifact } from 'types/PendingArtifact';
import { mapWithConcurrency } from 'utils/async';
import { getErrorMessage } from 'utils/errors';
import { parseAuxConfig } from 'utils/processorConfig';
import { notify } from 'utils/toaster';
import { compileFilter } from 'utils/versionFilter';
import { ConfigDisplay } from 'app/components/common/ConfigDisplay';
import { DateTime } from 'app/components/common/DateTime';
import { FilterDisplay } from 'app/components/common/FilterDisplay';
import { FillPage, PageHeader } from 'app/components/common/PageHeader';
import {
  EmptyState,
  LoadingState,
  QueryErrorState,
} from 'app/components/common/States';
import { ScrollTableContainer } from 'app/components/ScrollTableContainer';

const keyOf = (p: PendingArtifact) => `${p.processor}/${p.id}`;

const describe = (items: PendingArtifact[]) =>
  items.length === 1 ? keyOf(items[0]) : `${items.length} artifacts`;

export const ApprovalsPage = memo(() => {
  const backpack = useBackpackApi();
  const confirm = useConfirm();
  const invalidate = useInvalidateArtifacts();
  const query = usePendingApprovals();
  const processors = useProcessors();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [busy, setBusy] = useState<Set<string>>(new Set());
  const [rejecting, setRejecting] = useState<PendingArtifact[] | null>(null);
  const [reason, setReason] = useState('');

  const pending = useMemo(() => query.data ?? [], [query.data]);
  const auxByProcessor = useMemo(() => {
    const map: Record<string, ReturnType<typeof parseAuxConfig>> = {};
    (processors.data ?? []).forEach(
      p => (map[p.id] = parseAuxConfig(p.config)),
    );
    return map;
  }, [processors.data]);
  const selectedItems = pending.filter(p => selected.has(keyOf(p)));

  /** Runs approve/reject on several items and summarises the outcome. */
  const runBatch = async (
    items: PendingArtifact[],
    action: 'approve' | 'reject',
    rejectReason?: string,
  ) => {
    const keys = items.map(keyOf);
    setBusy(prev => new Set(Array.from(prev).concat(keys)));
    const results = await mapWithConcurrency(
      items,
      4,
      (item): Promise<unknown> =>
        action === 'approve'
          ? backpack.ApproveArtifact(item)
          : backpack.RejectArtifact({ ...item, reason: rejectReason }),
    );
    setBusy(prev => {
      const next = new Set(prev);
      keys.forEach(k => next.delete(k));
      return next;
    });
    setSelected(prev => {
      const next = new Set(prev);
      keys.forEach(k => next.delete(k));
      return next;
    });
    invalidate();

    const failures = results
      .map((r, i) => ({ r, item: items[i] }))
      .filter(({ r }) => r.status === 'rejected');
    const verb = action === 'approve' ? 'Approved' : 'Rejected';
    if (failures.length === 0) {
      notify.success(
        action === 'approve'
          ? `${verb} ${describe(items)}. Collection has started.`
          : `${verb} ${describe(items)}.`,
      );
    } else if (items.length === 1) {
      notify.error(
        `Could not ${action} ${keyOf(items[0])}: ${getErrorMessage(
          (failures[0].r as PromiseRejectedResult).reason,
        )}`,
      );
    } else {
      notify.warning(
        `${verb} ${items.length - failures.length} of ${
          items.length
        }. Failed: ${failures.map(f => keyOf(f.item)).join(', ')}`,
      );
    }
  };

  const approve = async (items: PendingArtifact[]) => {
    if (items.length > 1) {
      const ok = await confirm({
        title: `Approve ${items.length} artifacts?`,
        message: 'Collection starts for all of them immediately.',
        confirmText: `Approve ${items.length}`,
        icon: 'tick',
        intent: Intent.SUCCESS,
      });
      if (!ok) return;
    }
    runBatch(items, 'approve');
  };

  const toggle = (key: string) =>
    setSelected(prev => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  const allSelected =
    pending.length > 0 && selectedItems.length === pending.length;

  let body: React.JSX.Element;
  if (query.isLoading) {
    body = <LoadingState label="Loading requests…" />;
  } else if (query.isError && !query.data) {
    body = (
      <QueryErrorState
        title="Couldn't load pending approvals"
        error={query.error}
        onRetry={() => query.refetch()}
      />
    );
  } else if (pending.length === 0) {
    body = (
      <EmptyState
        icon="tick-circle"
        title="Nothing waiting for approval"
        description="Requests for processors that require approval will appear here."
      />
    );
  } else {
    body = (
      <ScrollTableContainer>
        <HTMLTable striped compact style={{ width: '100%' }}>
          <thead>
            <tr>
              <th style={{ width: 32 }}>
                <Checkbox
                  checked={allSelected}
                  indeterminate={selectedItems.length > 0 && !allSelected}
                  onChange={() =>
                    setSelected(
                      allSelected ? new Set() : new Set(pending.map(keyOf)),
                    )
                  }
                  aria-label="Select all requests"
                  style={{ margin: 0 }}
                />
              </th>
              <th>Processor</th>
              <th>Artifact</th>
              <th>Version filter</th>
              <th>Configuration</th>
              <th>Requested by</th>
              <th>Requested</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {pending.map(item => {
              const key = keyOf(item);
              const isBusy = busy.has(key);
              const invalidFilter =
                compileFilter(item.filter).kind === 'invalid';
              return (
                <tr key={key}>
                  <td>
                    <Checkbox
                      checked={selected.has(key)}
                      onChange={() => toggle(key)}
                      aria-label={`Select ${key}`}
                      style={{ margin: 0 }}
                    />
                  </td>
                  <td>
                    <Tag minimal>{item.processor}</Tag>
                  </td>
                  <td style={{ fontWeight: 600, overflowWrap: 'anywhere' }}>
                    {item.id}
                  </td>
                  <td>
                    <FilterDisplay filter={item.filter} />
                    {invalidFilter && (
                      <div
                        style={{
                          fontSize: '0.85em',
                          color: 'var(--danger-text)',
                        }}
                      >
                        Invalid: collection would fail
                      </div>
                    )}
                  </td>
                  <td>
                    <ConfigDisplay
                      config={item.config}
                      aux={auxByProcessor[item.processor]}
                    />
                  </td>
                  <td>{item.requested_by}</td>
                  <td>
                    <DateTime value={item.timestamp} />
                  </td>
                  <td style={{ whiteSpace: 'nowrap', textAlign: 'right' }}>
                    <ButtonGroup>
                      <Button
                        size="small"
                        intent={Intent.SUCCESS}
                        icon="tick"
                        disabled={isBusy || invalidFilter}
                        title={
                          invalidFilter
                            ? 'Fix the filter first: reject and ask for a new request'
                            : undefined
                        }
                        onClick={() => approve([item])}
                      >
                        Approve
                      </Button>
                      <Button
                        size="small"
                        intent={Intent.DANGER}
                        icon="cross"
                        disabled={isBusy}
                        onClick={() => setRejecting([item])}
                      >
                        Reject…
                      </Button>
                    </ButtonGroup>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </HTMLTable>
      </ScrollTableContainer>
    );
  }

  return (
    <>
      <Helmet>
        <title>
          {pending.length ? `Approvals (${pending.length})` : 'Approvals'}
        </title>
      </Helmet>
      <FillPage>
        <PageHeader
          icon="confirm"
          title="Pending approvals"
          description="Artifacts requested for processors that require approval. Approving starts collection."
          actions={
            selectedItems.length > 0 && (
              <>
                <span className={Classes.TEXT_MUTED}>
                  {selectedItems.length} selected
                </span>
                <Button
                  intent={Intent.SUCCESS}
                  icon="tick"
                  disabled={selectedItems.some(
                    i => compileFilter(i.filter).kind === 'invalid',
                  )}
                  onClick={() => approve(selectedItems)}
                >
                  Approve selected
                </Button>
                <Button
                  intent={Intent.DANGER}
                  icon="cross"
                  onClick={() => setRejecting(selectedItems)}
                >
                  Reject selected…
                </Button>
              </>
            )
          }
        />
        {body}
      </FillPage>

      <Dialog
        isOpen={rejecting !== null}
        onClose={() => setRejecting(null)}
        title={rejecting ? `Reject ${describe(rejecting)}?` : ''}
        icon="cross"
      >
        <form
          onSubmit={e => {
            e.preventDefault();
            if (rejecting) {
              runBatch(rejecting, 'reject', reason.trim());
            }
            setRejecting(null);
            setReason('');
          }}
        >
          <div className={Classes.DIALOG_BODY}>
            <p>The request is removed and nothing is collected.</p>
            <FormGroup
              label="Reason"
              labelFor="reject-reason"
              labelInfo="(optional)"
              helperText="Recorded in System Events so the requester can see why."
            >
              <TextArea
                id="reject-reason"
                fill
                value={reason}
                onChange={e => setReason(e.target.value)}
                placeholder="e.g. Use the official package instead"
              />
            </FormGroup>
          </div>
          <div className={Classes.DIALOG_FOOTER}>
            <div className={Classes.DIALOG_FOOTER_ACTIONS}>
              <Button onClick={() => setRejecting(null)}>Cancel</Button>
              <Button type="submit" intent={Intent.DANGER} icon="cross">
                {rejecting && rejecting.length > 1
                  ? `Reject ${rejecting.length}`
                  : 'Reject'}
              </Button>
            </div>
          </div>
        </form>
      </Dialog>
    </>
  );
});
