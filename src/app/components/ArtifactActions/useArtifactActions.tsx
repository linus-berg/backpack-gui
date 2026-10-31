import React, { useCallback } from 'react';
import { Intent } from '@blueprintjs/core';
import { useBackpackApi } from 'api/backpack';
import { useInvalidateArtifacts } from 'api/queries';
import { useConfirm } from 'app/context/ConfirmContext';
import { useUser } from 'app/context/UserContext';
import { Processor } from 'types/Processor';
import { mapWithConcurrency } from 'utils/async';
import { getErrorMessage } from 'utils/errors';
import { notify } from 'utils/toaster';
import { ARTIFACT_ACTIONS } from './actions';

type BulkAction = 'track' | 'validate' | 'forceCollect' | 'delete';

const PAST_TENSE: Record<BulkAction, (n: string) => string> = {
  track: n =>
    `Checking ${n} for updates. New versions appear once tracking finishes.`,
  validate: n =>
    `Validating files for ${n}. Problems are reported in System Events.`,
  forceCollect: n => `Collection started for ${n}.`,
  delete: n => `Deleted ${n}.`,
};

const plural = (count: number) => `${count} artifact${count === 1 ? '' : 's'}`;

/**
 * Runs artifact actions for one processor and reports the outcome with
 * toasts. Destructive actions ask for confirmation first.
 * @param processor The processor that owns the artifacts.
 */
export const useArtifactActions = (processor: Processor) => {
  const api = useBackpackApi();
  const confirm = useConfirm();
  const invalidate = useInvalidateArtifacts();
  const { hasRole } = useUser();

  const canDelete = hasRole('Administrator');
  /** External processors only track IDs, so there's nothing to collect. */
  const canCollect = !processor.is_external;
  /** Direct processors are force-collected instead of re-tracked. */
  const updateAction: 'track' | 'forceCollect' = processor.direct_collect
    ? 'forceCollect'
    : 'track';

  const callApi = useCallback(
    (action: BulkAction, id: string): Promise<unknown> => {
      const ref = { id, processor: processor.id };
      switch (action) {
        case 'track':
          return api.TrackArtifact(ref);
        case 'validate':
          return api.ValidateArtifact({ ...ref, force: false });
        case 'forceCollect':
          return api.ValidateArtifact({ ...ref, force: true });
        case 'delete':
          return api.DeleteArtifact(ref);
      }
    },
    [api, processor.id],
  );

  /**
   * Runs an action on one or more artifacts.
   * @param action Which action to run.
   * @param ids Artifact IDs within this processor.
   * @returns True when every call succeeded; false if cancelled or any failed.
   */
  const run = useCallback(
    async (action: BulkAction, ids: string[]): Promise<boolean> => {
      if (ids.length === 0) {
        return false;
      }
      const subject = ids.length === 1 ? ids[0] : plural(ids.length);

      if (action === 'delete') {
        const ok = await confirm({
          title: `Delete ${subject}?`,
          message: (
            <>
              <p>
                {ids.length === 1 ? (
                  <>
                    <b>
                      {processor.id}/{ids[0]}
                    </b>{' '}
                    and its tracking metadata will be removed from Backpack.
                  </>
                ) : (
                  <>
                    These artifacts and their tracking metadata will be removed
                    from Backpack:
                  </>
                )}
              </p>
              {ids.length > 1 && (
                <ul style={{ maxHeight: 160, overflowY: 'auto' }}>
                  {ids.slice(0, 50).map(id => (
                    <li key={id}>{id}</li>
                  ))}
                  {ids.length > 50 && <li>…and {ids.length - 50} more</li>}
                </ul>
              )}
              <p>This can’t be undone.</p>
            </>
          ),
          confirmText: ids.length === 1 ? 'Delete' : `Delete ${ids.length}`,
          icon: ARTIFACT_ACTIONS.delete.icon,
          intent: Intent.DANGER,
        });
        if (!ok) {
          return false;
        }
      }

      const results = await mapWithConcurrency(ids, 4, id =>
        callApi(action, id),
      );
      const failed = results
        .map((r, i) => ({ r, id: ids[i] }))
        .filter(({ r }) => r.status === 'rejected');

      if (action === 'delete') {
        invalidate(processor.id);
      }

      if (failed.length === 0) {
        notify.success(PAST_TENSE[action](subject));
        return true;
      }
      const label = ARTIFACT_ACTIONS[action].label;
      if (ids.length === 1) {
        notify.error(
          `${label} failed for ${ids[0]}: ${getErrorMessage(
            (failed[0].r as PromiseRejectedResult).reason,
          )}`,
        );
      } else {
        const succeeded = ids.length - failed.length;
        notify.warning(
          `${label}: ${succeeded} of ${ids.length} succeeded. Failed: ${failed
            .slice(0, 5)
            .map(f => f.id)
            .join(', ')}${failed.length > 5 ? '…' : ''}`,
        );
      }
      return false;
    },
    [callApi, confirm, invalidate, processor.id],
  );

  return { run, canDelete, canCollect, updateAction };
};
