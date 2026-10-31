import React, { useEffect, useState } from 'react';
import {
  Button,
  Callout,
  Classes,
  Dialog,
  FormGroup,
  HTMLSelect,
  InputGroup,
  Intent,
  Menu,
  MenuItem,
  Popover,
  Position,
} from '@blueprintjs/core';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useBackpackApi } from 'api/backpack';
import { queryKeys, useProcessors } from 'api/queries';
import { Schedule } from 'types/Schedule';
import { formatDateTime, formatDuration } from 'utils/dates';
import { getErrorMessage } from 'utils/errors';
import { notify } from 'utils/toaster';
import { CRON_PRESETS, cronFieldHint, describeCron } from './cron';

interface Props {
  isOpen: boolean;
  /** Schedule being edited; null to create a new one. */
  schedule: Schedule | null;
  existing: Schedule[];
  onClose: () => void;
}

type Validation =
  | { status: 'idle' }
  | { status: 'checking'; cron: string }
  | { status: 'valid'; cron: string; next: string[] }
  | { status: 'invalid'; cron: string; error: string };

const DEFAULT_CRON = CRON_PRESETS[2].cron;

export const ScheduleEditorDialog = ({
  isOpen,
  schedule,
  existing,
  onClose,
}: Props) => {
  const api = useBackpackApi();
  const queryClient = useQueryClient();
  const processors = useProcessors();
  const [processor, setProcessor] = useState('');
  const [cron, setCron] = useState(DEFAULT_CRON);
  const [validation, setValidation] = useState<Validation>({ status: 'idle' });

  useEffect(() => {
    if (isOpen) {
      setProcessor(schedule?.processor ?? '');
      setCron(schedule?.cron ?? DEFAULT_CRON);
    }
  }, [isOpen, schedule]);

  // Validate every change after a short pause. The previous result is cleared
  // immediately so a stale "valid" preview is never shown for new input.
  useEffect(() => {
    if (!isOpen) {
      return;
    }
    const value = cron.trim();
    if (!value) {
      setValidation({ status: 'idle' });
      return;
    }
    setValidation({ status: 'checking', cron: value });
    let cancelled = false;
    const timer = setTimeout(() => {
      api
        .ValidateSchedule({ cron: value, processor })
        .then(res => {
          if (cancelled) return;
          setValidation(
            res.data.valid
              ? {
                  status: 'valid',
                  cron: value,
                  next: res.data.nextOccurrences ?? [],
                }
              : {
                  status: 'invalid',
                  cron: value,
                  error: res.data.error ?? 'Invalid cron expression',
                },
          );
        })
        .catch(err => {
          if (cancelled) return;
          setValidation({
            status: 'invalid',
            cron: value,
            error: getErrorMessage(err, 'Invalid cron expression'),
          });
        });
    }, 400);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cron, isOpen]);

  const onSaved = (message: string) => {
    notify.success(message);
    queryClient.invalidateQueries({ queryKey: queryKeys.schedules });
    onClose();
  };
  const addMutation = useMutation({
    mutationFn: api.AddSchedule,
    meta: { errorTitle: 'Could not add the schedule' },
    onSuccess: () => onSaved(`Added a schedule for ${processor}.`),
  });
  const updateMutation = useMutation({
    mutationFn: api.UpdateSchedule,
    meta: { errorTitle: 'Could not update the schedule' },
    onSuccess: () => onSaved(`Updated the schedule for ${processor}.`),
  });

  const trimmed = cron.trim();
  const isValid = validation.status === 'valid' && validation.cron === trimmed;
  const canSave = !!processor && isValid;
  const duplicate = existing.find(
    s => s.processor === processor && s.id !== schedule?.id,
  );
  const hint = cronFieldHint(cron);
  const description = describeCron(trimmed);

  const save = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSave) return;
    if (schedule) {
      updateMutation.mutate({ ...schedule, processor, cron: trimmed });
    } else {
      addMutation.mutate({ processor, cron: trimmed });
    }
  };

  const next = validation.status === 'valid' ? validation.next : [];
  const interval =
    next.length > 1
      ? formatDuration(
          new Date(next[1]).getTime() - new Date(next[0]).getTime(),
        )
      : null;

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title={schedule ? `Edit schedule: ${schedule.processor}` : 'Add schedule'}
      icon="calendar"
      style={{ width: 'min(640px, 95vw)' }}
    >
      <form onSubmit={save}>
        <div className={Classes.DIALOG_BODY}>
          <FormGroup label="Processor" labelFor="schedule-processor">
            <HTMLSelect
              id="schedule-processor"
              fill
              value={processor}
              onChange={e => setProcessor(e.currentTarget.value)}
            >
              <option value="">Select a processor…</option>
              {(processors.data ?? []).map(p => (
                <option key={p.id} value={p.id}>
                  {p.id}
                </option>
              ))}
            </HTMLSelect>
          </FormGroup>
          {duplicate && (
            <Callout intent={Intent.WARNING} style={{ marginBottom: 15 }}>
              {processor} already has a schedule (<code>{duplicate.cron}</code>
              ). Both will run.
            </Callout>
          )}
          <FormGroup
            label="When to run"
            labelFor="schedule-cron"
            intent={
              validation.status === 'invalid' ? Intent.DANGER : Intent.NONE
            }
            helperText={
              hint ??
              (description
                ? description
                : 'Six fields: second minute hour day-of-month month day-of-week.')
            }
          >
            <InputGroup
              id="schedule-cron"
              value={cron}
              onChange={e => setCron(e.currentTarget.value)}
              placeholder="0 0 2 * * ?"
              style={{ fontFamily: 'monospace' }}
              intent={
                validation.status === 'invalid' ? Intent.DANGER : Intent.NONE
              }
              rightElement={
                <Popover
                  position={Position.BOTTOM_RIGHT}
                  content={
                    <Menu>
                      {CRON_PRESETS.map(p => (
                        <MenuItem
                          key={p.cron}
                          text={p.label}
                          label={p.cron}
                          onClick={() => setCron(p.cron)}
                        />
                      ))}
                    </Menu>
                  }
                >
                  <Button minimal rightIcon="caret-down" text="Presets" />
                </Popover>
              }
            />
          </FormGroup>

          <div aria-live="polite">
            {validation.status === 'checking' && (
              <Callout icon="time">Checking expression…</Callout>
            )}
            {validation.status === 'invalid' && (
              <Callout intent={Intent.DANGER} title="Invalid cron expression">
                {validation.error}
              </Callout>
            )}
            {validation.status === 'valid' && next.length > 0 && (
              <Callout intent={Intent.SUCCESS} title="Next runs">
                <ul style={{ margin: 0, paddingLeft: 20 }}>
                  {next.map((occ, i) => (
                    <li key={occ}>
                      {formatDateTime(occ)}
                      {i === 0 && <b style={{ marginLeft: 10 }}>(next)</b>}
                    </li>
                  ))}
                </ul>
                {interval && (
                  <div style={{ marginTop: 5 }}>
                    Runs about every {interval}.
                  </div>
                )}
              </Callout>
            )}
          </div>
        </div>
        <div className={Classes.DIALOG_FOOTER}>
          <div className={Classes.DIALOG_FOOTER_ACTIONS}>
            <Button onClick={onClose}>Cancel</Button>
            <Button
              type="submit"
              intent={Intent.PRIMARY}
              disabled={!canSave}
              loading={addMutation.isPending || updateMutation.isPending}
            >
              {schedule ? 'Save changes' : 'Add schedule'}
            </Button>
          </div>
        </div>
      </form>
    </Dialog>
  );
};
