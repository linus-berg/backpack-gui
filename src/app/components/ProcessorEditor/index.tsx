/**
 *
 * ProcessorEditor
 *
 */
import React, { memo } from 'react';
import styled from 'styled-components';
import { Processor } from 'types/Processor';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useBackpackApi } from 'api/backpack';
import { useUser } from '../../context/UserContext';
import { ProcessorEditorHeader } from './components/ProcessorEditorHeader';
import { ProcessorEditorSettings } from './components/ProcessorEditorSettings';
import { ProcessorEditorFields } from './components/ProcessorEditorFields';
import { useForm } from 'react-hook-form';

interface Props {
  processor: Processor;
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
  height: 100%;
`;

export const ProcessorEditor = memo((props: Props) => {
  const backpack = useBackpackApi();
  const queryClient = useQueryClient();
  const { hasRole } = useUser();
  const isAdmin = hasRole('Administrator');

  const mutation = useMutation({
    mutationFn: backpack.UpdateProcessor,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['processor_list'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: backpack.DeleteProcessor,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['processor_list'] });
    },
  });

  const processor = props.processor;

  const formatJson = (jsonStr: string) => {
    try {
      return JSON.stringify(JSON.parse(jsonStr), null, 2);
    } catch (e) {
      return jsonStr;
    }
  };

  const { watch, setValue, handleSubmit } = useForm<FormData>({
    defaultValues: {
      description: processor.description,
      config: formatJson(processor.config),
      direct_collect: processor.direct_collect,
      requires_approval: processor.requires_approval,
      multi_add: processor.multi_add,
      is_external: processor.is_external,
      preview_enabled: processor.preview_enabled,
    },
  });

  const values = watch();

  const Save = (data: FormData) => {
    mutation.mutate({
      id: processor.id,
      ...data,
    });
  };

  return (
    <Div>
      <ProcessorEditorHeader
        processorId={processor.id}
        onSave={handleSubmit(Save)}
        onDelete={() => deleteMutation.mutate(processor.id)}
        isSaving={mutation.isPending}
        isDeleting={deleteMutation.isPending}
        isAdmin={isAdmin}
      />

      <ProcessorEditorSettings
        directCollect={values.direct_collect}
        onDirectCollectChange={val => setValue('direct_collect', val)}
        requiresApproval={values.requires_approval}
        onRequiresApprovalChange={val => setValue('requires_approval', val)}
        multiAdd={values.multi_add}
        onMultiAddChange={val => setValue('multi_add', val)}
        isExternal={values.is_external}
        onIsExternalChange={val => setValue('is_external', val)}
        previewEnabled={values.preview_enabled}
        onPreviewEnabledChange={val => setValue('preview_enabled', val)}
      />

      <ProcessorEditorFields
        description={values.description}
        onDescriptionChange={val => setValue('description', val)}
        config={values.config}
        onConfigChange={val => setValue('config', val)}
      />
    </Div>
  );
});
