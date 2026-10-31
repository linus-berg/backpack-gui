/**
 *
 * ProcessorEditor
 *
 */
import React, { memo, useEffect } from 'react';
import { Intent } from '@blueprintjs/core';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { PathValue, useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useBackpackApi } from 'api/backpack';
import { queryKeys } from 'api/queries';
import { useConfirm } from 'app/context/ConfirmContext';
import { Processor } from 'types/Processor';
import { validateAuxConfigJson } from 'utils/processorConfig';
import { notify } from 'utils/toaster';
import { ProcessorEditorHeader } from './components/ProcessorEditorHeader';
import { ProcessorEditorSettings } from './components/ProcessorEditorSettings';
import { ProcessorEditorFields } from './components/ProcessorEditorFields';
import { ProcessorFlag } from './processorFlags';

interface Props {
  processor: Processor;
  /** Reports unsaved changes so the page can warn before switching processor. */
  onDirtyChange?: (dirty: boolean) => void;
}

interface FormData {
  description: string;
  config: string;
  direct_collect: boolean;
  requires_approval: boolean;
  multi_add: boolean;
  is_external: boolean;
  preview_enabled: boolean;
}

const Div = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
`;

const formatJson = (jsonStr: string) => {
  try {
    return JSON.stringify(JSON.parse(jsonStr), null, 2);
  } catch {
    return jsonStr;
  }
};

const toForm = (processor: Processor): FormData => ({
  description: processor.description ?? '',
  config: formatJson(processor.config),
  direct_collect: processor.direct_collect,
  requires_approval: processor.requires_approval,
  multi_add: processor.multi_add,
  is_external: processor.is_external,
  preview_enabled: processor.preview_enabled,
});

export const ProcessorEditor = memo(({ processor, onDirtyChange }: Props) => {
  const backpack = useBackpackApi();
  const queryClient = useQueryClient();
  const confirm = useConfirm();
  const navigate = useNavigate();

  const {
    watch,
    setValue,
    handleSubmit,
    reset,
    formState: { isDirty },
  } = useForm<FormData>({ defaultValues: toForm(processor) });
  const values = watch();
  const configError = validateAuxConfigJson(values.config);

  useEffect(() => onDirtyChange?.(isDirty), [isDirty, onDirtyChange]);

  // Warn before closing or reloading the tab with unsaved edits.
  useEffect(() => {
    if (!isDirty) {
      return;
    }
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', onBeforeUnload);
    return () => window.removeEventListener('beforeunload', onBeforeUnload);
  }, [isDirty]);

  const mutation = useMutation({
    mutationFn: backpack.UpdateProcessor,
    meta: { errorTitle: `Could not save ${processor.id}` },
    onSuccess: (_res, saved) => {
      notify.success(`Saved ${processor.id}.`);
      reset(toForm(saved));
      queryClient.invalidateQueries({ queryKey: queryKeys.processors });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: backpack.DeleteProcessor,
    meta: { errorTitle: `Could not delete ${processor.id}` },
    onSuccess: () => {
      notify.success(`Deleted processor ${processor.id}.`);
      onDirtyChange?.(false);
      queryClient.invalidateQueries({ queryKey: queryKeys.processors });
      navigate('/config', { replace: true });
    },
  });

  const save = handleSubmit(data => {
    if (validateAuxConfigJson(data.config)) {
      return;
    }
    mutation.mutate({ id: processor.id, ...data });
  });

  const onDelete = async () => {
    const ok = await confirm({
      title: `Delete processor ${processor.id}?`,
      message: (
        <p>
          The processor and its configuration are removed. Users can no longer
          browse or add <b>{processor.id}</b> artifacts. This can’t be undone.
        </p>
      ),
      confirmText: 'Delete processor',
      icon: 'trash',
      intent: Intent.DANGER,
    });
    if (ok) {
      deleteMutation.mutate(processor.id);
    }
  };

  const setField = <K extends keyof FormData>(key: K, value: FormData[K]) =>
    // react-hook-form can't narrow PathValue for a generic key; the
    // signature above already guarantees the value matches the key.
    setValue(key, value as PathValue<FormData, K>, { shouldDirty: true });

  return (
    <Div>
      <ProcessorEditorHeader
        processorId={processor.id}
        isDirty={isDirty}
        canSave={!configError}
        onSave={save}
        onDiscard={() => reset()}
        onDelete={onDelete}
        isSaving={mutation.isPending}
        isDeleting={deleteMutation.isPending}
      />

      <ProcessorEditorSettings
        values={values}
        onChange={(flag: ProcessorFlag, value) => setField(flag, value)}
      />

      <ProcessorEditorFields
        description={values.description}
        onDescriptionChange={val => setField('description', val)}
        config={values.config}
        onConfigChange={val => setField('config', val)}
        configError={configError}
      />
    </Div>
  );
});
