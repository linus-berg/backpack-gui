import React from 'react';
import {
  Button,
  ButtonGroup,
  Menu,
  MenuDivider,
  MenuItem,
  PopoverNext,
  Tooltip,
} from '@blueprintjs/core';
import { ArtifactSummary } from 'types';
import { Processor } from 'types/Processor';
import { ARTIFACT_ACTIONS } from 'app/components/ArtifactActions/actions';
import { useArtifactActions } from 'app/components/ArtifactActions/useArtifactActions';

interface Props {
  artifact: ArtifactSummary;
  processor: Processor;
  onInspect: (id: string) => void;
}

/**
 * Inspect stays one click away; everything else lives in a labelled menu so
 * rows aren't a wall of colored icons and Delete is never next to a
 * look-alike button.
 */
export const ArtifactRowActions = ({
  artifact,
  processor,
  onInspect,
}: Props) => {
  const { run, canDelete, canCollect, updateAction } =
    useArtifactActions(processor);
  const update = ARTIFACT_ACTIONS[updateAction];
  const hasMenu = canCollect || canDelete;

  const menu = (
    <Menu>
      {canCollect && (
        <>
          <MenuItem
            icon={update.icon}
            text={update.label}
            onClick={() => run(updateAction, [artifact.id])}
          />
          <MenuItem
            icon={ARTIFACT_ACTIONS.validate.icon}
            text={ARTIFACT_ACTIONS.validate.label}
            onClick={() => run('validate', [artifact.id])}
          />
        </>
      )}
      {canCollect && canDelete && <MenuDivider />}
      {canDelete && (
        <MenuItem
          icon={ARTIFACT_ACTIONS.delete.icon}
          text={`${ARTIFACT_ACTIONS.delete.label}…`}
          intent={ARTIFACT_ACTIONS.delete.intent}
          onClick={() => run('delete', [artifact.id])}
        />
      )}
    </Menu>
  );

  return (
    <ButtonGroup variant="minimal">
      <Tooltip content={`Inspect ${artifact.id}`} lazy>
        <Button
          size="small"
          icon={ARTIFACT_ACTIONS.inspect.icon}
          intent={ARTIFACT_ACTIONS.inspect.intent}
          aria-label={`Inspect ${artifact.id}`}
          onClick={() => onInspect(artifact.id)}
        />
      </Tooltip>
      {hasMenu && (
        <PopoverNext content={menu} placement="bottom-end">
          <Button
            size="small"
            icon="more"
            aria-label={`More actions for ${artifact.id}`}
          />
        </PopoverNext>
      )}
    </ButtonGroup>
  );
};
