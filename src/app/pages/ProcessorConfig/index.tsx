/**
 *
 * Admin → Processors: processor definitions (administrators only)
 *
 */
import React, { memo, useCallback, useRef, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Button,
  Classes,
  Dialog,
  FormGroup,
  InputGroup,
  Intent,
} from '@blueprintjs/core';
import { useBackpackApi } from 'api/backpack';
import { queryKeys, useProcessors } from 'api/queries';
import { useConfirm } from 'app/context/ConfirmContext';
import {
  FillPage,
  PageHeader,
  SplitContent,
  SplitLayout,
} from 'app/components/common/PageHeader';
import {
  EmptyState,
  LoadingState,
  QueryErrorState,
} from 'app/components/common/States';
import { LinkButton } from 'app/components/common/LinkButton';
import { ProcessorSidebar } from 'app/components/ProcessorSidebar';
import { ProcessorEditor } from 'app/components/ProcessorEditor/Loadable';
import { ProcessorEditorSettings } from 'app/components/ProcessorEditor/components/ProcessorEditorSettings';
import { ProcessorFlags } from 'app/components/ProcessorEditor/processorFlags';
import { notify } from 'utils/toaster';

/** Admin → Processors; each processor at `${BASE_PATH}/<id>`. */
const BASE_PATH = '/admin/processors';

const NEW_FLAGS: ProcessorFlags = {
  requires_approval: false,
  multi_add: false,
  is_external: false,
  preview_enabled: true,
  direct_collect: false,
};

const AddProcessorDialog = ({
  isOpen,
  onClose,
  existingIds,
}: {
  isOpen: boolean;
  onClose: () => void;
  existingIds: string[];
}) => {
  const backpack = useBackpackApi();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [id, setId] = useState('');
  const [flags, setFlags] = useState<ProcessorFlags>(NEW_FLAGS);

  const trimmed = id.trim();
  const error = !trimmed
    ? null
    : /\s/.test(trimmed)
    ? 'Processor IDs cannot contain spaces.'
    : existingIds.some(e => e.toLowerCase() === trimmed.toLowerCase())
    ? `A processor called "${trimmed}" already exists.`
    : null;

  const mutation = useMutation({
    mutationFn: backpack.AddProcessor,
    meta: { errorTitle: 'Could not add the processor' },
    onSuccess: () => {
      notify.success(`Added processor ${trimmed}.`);
      queryClient.invalidateQueries({ queryKey: queryKeys.processors });
      onClose();
      setId('');
      setFlags(NEW_FLAGS);
      navigate(`${BASE_PATH}/${encodeURIComponent(trimmed)}`);
    },
  });

  const submit = (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!trimmed || error) {
      return;
    }
    mutation.mutate({ processor_id: trimmed, ...flags });
  };

  return (
    <Dialog isOpen={isOpen} onClose={onClose} title="Add processor" icon="plus">
      <form onSubmit={submit}>
        <div className={Classes.DIALOG_BODY}>
          <FormGroup
            label="Processor ID"
            labelFor="processor-id"
            labelInfo="(required)"
            intent={error ? Intent.DANGER : Intent.NONE}
            helperText={
              error ??
              'Must match the processor service, e.g. "npm". Used in URLs and message routing.'
            }
          >
            <InputGroup
              id="processor-id"
              placeholder="e.g. npm"
              value={id}
              autoFocus
              intent={error ? Intent.DANGER : Intent.NONE}
              onChange={e => setId(e.currentTarget.value)}
            />
          </FormGroup>
          <ProcessorEditorSettings
            values={flags}
            createOnly
            layout="column"
            onChange={(flag, value) =>
              setFlags(prev => ({ ...prev, [flag]: value }))
            }
          />
        </div>
        <div className={Classes.DIALOG_FOOTER}>
          <div className={Classes.DIALOG_FOOTER_ACTIONS}>
            <Button onClick={onClose}>Cancel</Button>
            <Button
              type="submit"
              intent={Intent.PRIMARY}
              loading={mutation.isPending}
              disabled={!trimmed || !!error}
            >
              Add processor
            </Button>
          </div>
        </div>
      </form>
    </Dialog>
  );
};

export const ProcessorConfig = memo(() => {
  const processors = useProcessors();
  const { processor: selectedId } = useParams();
  const confirm = useConfirm();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const dirty = useRef(false);

  const onDirtyChange = useCallback((value: boolean) => {
    dirty.current = value;
  }, []);

  const confirmLeave = useCallback(async () => {
    if (!dirty.current) {
      return true;
    }
    const ok = await confirm({
      title: 'Discard unsaved changes?',
      message: 'Your edits to this processor haven’t been saved.',
      confirmText: 'Discard changes',
      intent: Intent.WARNING,
      icon: 'edit',
    });
    if (ok) {
      dirty.current = false;
    }
    return ok;
  }, [confirm]);

  if (processors.isLoading) {
    return <LoadingState label="Loading processors…" />;
  }
  if (processors.isError) {
    return (
      <QueryErrorState
        title="Couldn't load processors"
        error={processors.error}
        onRetry={() => processors.refetch()}
      />
    );
  }

  const list = processors.data ?? [];
  if (list.length > 0 && !selectedId) {
    return (
      <Navigate to={`${BASE_PATH}/${encodeURIComponent(list[0].id)}`} replace />
    );
  }
  const selected = list.find(p => p.id === selectedId);

  return (
    <>
      <Helmet>
        <title>{selected ? `Configure ${selected.id}` : 'Processors'}</title>
        <meta name="description" content="Configure Backpack processors" />
      </Helmet>
      <FillPage>
        <PageHeader
          icon="cog"
          title="Processors"
          description="The ecosystems Backpack mirrors. Each processor service needs a definition here with the same ID."
          actions={
            <Button
              icon="plus"
              intent={Intent.PRIMARY}
              onClick={() => setIsDialogOpen(true)}
            >
              Add processor
            </Button>
          }
        />
        {list.length === 0 ? (
          <EmptyState
            icon="cog"
            title="No processors yet"
            description="Add a processor to start mirroring an ecosystem."
          />
        ) : (
          <SplitLayout>
            <ProcessorSidebar
              processors={list}
              basePath={BASE_PATH}
              onBeforeNavigate={confirmLeave}
              label="Processors"
            />
            <SplitContent style={{ overflowY: 'auto' }}>
              {selected ? (
                <ProcessorEditor
                  key={selected.id}
                  processor={selected}
                  onDirtyChange={onDirtyChange}
                />
              ) : (
                <EmptyState
                  icon="search"
                  title="Unknown processor"
                  description={`There's no processor called “${selectedId}”. It may have been deleted.`}
                  action={
                    <LinkButton
                      to={`${BASE_PATH}/${encodeURIComponent(list[0].id)}`}
                      text={`Go to ${list[0].id}`}
                    />
                  }
                />
              )}
            </SplitContent>
          </SplitLayout>
        )}
      </FillPage>

      <AddProcessorDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        existingIds={list.map(p => p.id)}
      />
    </>
  );
});
