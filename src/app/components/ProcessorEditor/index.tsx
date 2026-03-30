/**
 *
 * ProcessorEditor
 *
 */
import React, { memo, useState } from 'react';
import styled from 'styled-components';
import { Processor } from 'types/Processor';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useBackpackApi } from 'api/backpack';
import { useUser } from '../../context/UserContext';
import { ProcessorEditorHeader } from './components/ProcessorEditorHeader';
import { ProcessorEditorSettings } from './components/ProcessorEditorSettings';
import { ProcessorEditorFields } from './components/ProcessorEditorFields';

interface Props {
  processor: Processor;
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

  const mutation = useMutation(backpack.UpdateProcessor, {
    onSuccess: () => {
      queryClient.invalidateQueries(['processor_list']);
    },
  });

  const deleteMutation = useMutation(backpack.DeleteProcessor, {
    onSuccess: () => {
      queryClient.invalidateQueries(['processor_list']);
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

  const [description, SetDescription] = useState(processor.description);
  const [config, SetConfig] = useState(formatJson(processor.config));
  const [direct_collect, SetDirectCollect] = useState(processor.direct_collect);
  const [requires_approval, SetRequiresApproval] = useState(processor.requires_approval);
  const [multi_add, SetMultiAdd] = useState(processor.multi_add);
  const [is_external, SetIsExternal] = useState(processor.is_external);
  const [preview_enabled, SetPreviewEnabled] = useState(processor.preview_enabled);

  const Save = () => {
    mutation.mutate({
      id: processor.id,
      description,
      config,
      direct_collect,
      requires_approval,
      multi_add,
      is_external,
      preview_enabled,
    });
  };

  return (
    <Div>
      <ProcessorEditorHeader
        processorId={processor.id}
        onSave={Save}
        onDelete={() => deleteMutation.mutate(processor.id)}
        isSaving={mutation.isLoading}
        isDeleting={deleteMutation.isLoading}
        isAdmin={isAdmin}
      />
      
      <ProcessorEditorSettings
        directCollect={direct_collect}
        onDirectCollectChange={SetDirectCollect}
        requiresApproval={requires_approval}
        onRequiresApprovalChange={SetRequiresApproval}
        multiAdd={multi_add}
        onMultiAddChange={SetMultiAdd}
        isExternal={is_external}
        onIsExternalChange={SetIsExternal}
        previewEnabled={preview_enabled}
        onPreviewEnabledChange={SetPreviewEnabled}
      />

      <ProcessorEditorFields
        description={description}
        onDescriptionChange={SetDescription}
        config={config}
        onConfigChange={SetConfig}
      />
    </Div>
  );
});
