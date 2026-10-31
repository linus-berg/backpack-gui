import {
  Button,
  Callout,
  Card,
  FormGroup,
  H5,
  H6,
  InputGroup,
  Intent,
} from '@blueprintjs/core';
import { useMutation } from '@tanstack/react-query';
import React, { memo, useMemo, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import styled from 'styled-components';
import { ArtifactInput, useBackpackApi } from 'api/backpack';
import { useInvalidateArtifacts } from 'api/queries';
import { Processor } from 'types/Processor';
import { AuxField } from 'types/AuxField';
import { classifyAddResponse } from 'utils/addArtifact';
import { auxDefaults, parseAuxConfig } from 'utils/processorConfig';
import { notify } from 'utils/toaster';
import { validateFilterInput } from 'utils/versionFilter';
import {
  exampleLocation,
  validateCollectLocation,
} from 'utils/collectLocation';
import { HelpTip } from 'app/components/common/HelpTip';
import { RichMarkdownView } from 'app/components/common/RichMarkdownView';
import { ARTIFACT_ACTIONS } from 'app/components/ArtifactActions/actions';
import { useBrowserParams } from 'app/pages/ProcessorBrowser/useBrowserParams';
import { AuxInput } from './AuxInput';
import { PreviewArtifactDialog } from './PreviewArtifactDialog';

interface Props {
  processor: Processor;
}

interface FormData {
  name: string;
  filter: string;
  config: Record<string, string>;
}

export const AddArtifactForm = memo(({ processor }: Props) => {
  const backpack = useBackpackApi();
  const invalidate = useInvalidateArtifacts();
  const { inspect } = useBrowserParams();
  const aux = useMemo(() => parseAuxConfig(processor.config), [processor]);
  const defaults = useMemo(() => auxDefaults(aux), [aux]);
  /** Direct-collect artifacts are added by their URL, see utils/collectLocation. */
  const isDirect = processor.direct_collect;
  const idPrefix = `add-${processor.id}`;

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    mode: 'onChange',
    defaultValues: { name: '', filter: '', config: defaults },
  });

  const name = watch('name');
  const filter = watch('filter');
  const config = watch('config');
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const mutation = useMutation({
    mutationFn: backpack.AddArtifact,
    meta: { errorTitle: 'Could not add the artifact' },
    onSuccess: (response, input) => {
      const outcome = classifyAddResponse(response.data);
      const label = `${processor.id}/${input.id}`;
      if (outcome === 'pending') {
        notify.warning(
          `${label} was submitted for approval. Collection starts once an administrator approves it.`,
        );
      } else if (outcome === 'exists') {
        notify.info(`${label} is already tracked.`, {
          action: { text: 'Show', onClick: () => inspect(input.id) },
        });
      } else {
        notify.success(
          processor.is_external
            ? `Added ${label}. It's tracked here and collected by an external system.`
            : `Added ${label}. Backpack is now discovering its versions and dependencies.`,
          { action: { text: 'Show', onClick: () => inspect(input.id) } },
        );
      }
      invalidate(processor.id);
      reset({ name: '', filter: '', config: defaults });
    },
  });

  const updateField = (field: AuxField, value: string) => {
    setValue(
      'config',
      { ...config, [field.key]: value },
      { shouldDirty: true },
    );
  };

  const toInput = (data: FormData): ArtifactInput => ({
    id: data.name.trim(),
    processor: processor.id,
    filter: data.filter.trim(),
    config: data.config,
  });

  const onAdd = handleSubmit(data => mutation.mutate(toInput(data)));

  const canPreview =
    !processor.is_external &&
    !processor.direct_collect &&
    processor.preview_enabled;
  const hasErrors = !!errors.name || !!errors.filter;
  const auxFieldCount = Object.keys(aux).length;

  return (
    <Form onSubmit={onAdd} aria-label={`Add ${processor.id} artifact`}>
      <H5 style={{ margin: 0 }}>Add artifact</H5>

      {processor.is_external && (
        <Callout
          intent={Intent.WARNING}
          title="Managed externally"
          icon="share"
        >
          Backpack acts as a <b>metadata registry</b> for this processor. An
          external system collects, synchronizes and stores these artifacts.
        </Callout>
      )}
      {processor.requires_approval && (
        <Callout
          intent={Intent.WARNING}
          title="Approval required"
          icon="shield"
        >
          New artifacts are reviewed by an administrator before collection
          starts.
        </Callout>
      )}
      {processor.description?.trim() && (
        <Card style={{ padding: 12 }}>
          <RichMarkdownView>{processor.description}</RichMarkdownView>
        </Card>
      )}

      <Controller
        name="name"
        control={control}
        rules={{
          validate: value => {
            if (value.trim() === '') {
              return isDirect ? 'Enter a location.' : 'Enter an artifact name.';
            }
            return (
              (isDirect && validateCollectLocation(value, processor.id)) || true
            );
          },
        }}
        render={({ field, fieldState }) => {
          // Show problems as soon as something is typed, not only on blur,
          // so a missing protocol is caught before submitting.
          const showError =
            !!fieldState.error && (fieldState.isTouched || fieldState.isDirty);
          return (
            <FormGroup
              label={
                <>
                  {isDirect ? 'Location' : 'Artifact name'}
                  <HelpTip
                    content={
                      isDirect
                        ? 'The URL to collect from, including the protocol. The protocol picks the collector, e.g. git:// for the Git collector.'
                        : "The package's identifier in its registry, e.g. 'lodash' or 'ubuntu'."
                    }
                  />
                </>
              }
              labelFor={`${idPrefix}-name`}
              labelInfo="(required)"
              intent={showError ? Intent.DANGER : Intent.NONE}
              helperText={showError ? fieldState.error?.message : undefined}
              style={{ marginBottom: 0 }}
            >
              <InputGroup
                {...field}
                id={`${idPrefix}-name`}
                fill
                placeholder={
                  isDirect
                    ? `e.g. ${exampleLocation(processor.id)}`
                    : 'e.g. react'
                }
                leftIcon={isDirect ? 'link' : 'cube'}
                autoComplete="off"
                intent={showError ? Intent.DANGER : Intent.NONE}
              />
            </FormGroup>
          );
        }}
      />

      <Controller
        name="filter"
        control={control}
        rules={{ validate: value => validateFilterInput(value) ?? true }}
        render={({ field, fieldState }) => (
          <FormGroup
            label={
              <>
                Version filter
                <HelpTip content="A regular expression matched against each version. Only matching versions are mirrored, e.g. '^18\.' for React 18." />
              </>
            }
            labelFor={`${idPrefix}-filter`}
            labelInfo="(optional)"
            intent={fieldState.error ? Intent.DANGER : Intent.NONE}
            helperText={
              fieldState.error?.message ??
              'Leave empty to mirror every version.'
            }
            style={{ marginBottom: 0 }}
          >
            <InputGroup
              {...field}
              id={`${idPrefix}-filter`}
              fill
              placeholder="e.g. ^4\."
              leftIcon="filter"
              autoComplete="off"
              intent={fieldState.error ? Intent.DANGER : Intent.NONE}
              style={{ fontFamily: 'monospace' }}
            />
          </FormGroup>
        )}
      />

      {auxFieldCount > 0 && (
        <div>
          <H6>Configuration</H6>
          <AuxInput
            onChange={updateField}
            config={aux}
            values={config}
            idPrefix={idPrefix}
          />
        </div>
      )}

      <div style={{ display: 'flex', gap: 8 }}>
        {canPreview && (
          <Button
            icon={ARTIFACT_ACTIONS.preview.icon}
            onClick={() => setIsPreviewOpen(true)}
            disabled={name.trim() === ''}
            style={{ flex: 1 }}
          >
            {ARTIFACT_ACTIONS.preview.label}
          </Button>
        )}
        <Button
          type="submit"
          icon={ARTIFACT_ACTIONS.add.icon}
          intent={Intent.PRIMARY}
          loading={mutation.isPending}
          disabled={name.trim() === '' || hasErrors}
          style={{ flex: 2 }}
        >
          {processor.requires_approval ? 'Request artifact' : 'Add artifact'}
        </Button>
      </div>

      {canPreview && (
        <PreviewArtifactDialog
          isOpen={isPreviewOpen}
          onClose={() => setIsPreviewOpen(false)}
          artifactId={name.trim()}
          processor={processor.id}
          config={config}
          filter={filter.trim()}
          addLabel={
            processor.requires_approval ? 'Request artifact' : 'Add artifact'
          }
          canAdd={!hasErrors}
          isAdding={mutation.isPending}
          onAdd={() => {
            setIsPreviewOpen(false);
            onAdd();
          }}
        />
      )}
    </Form>
  );
});

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;
