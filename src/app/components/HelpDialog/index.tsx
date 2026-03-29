import React from 'react';
import {
  Dialog,
  Classes,
  Button,
  Intent,
  H5,
  H6,
  Icon,
  Callout,
  Divider,
} from '@blueprintjs/core';
import styled from 'styled-components';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const HelpSection = styled.div`
  margin-bottom: 24px;
`;

const ActionHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 8px;
`;

const AdminBadge = styled.span`
  background: rgba(219, 61, 61, 0.15);
  color: #ff7373;
  font-size: 0.65rem;
  padding: 2px 6px;
  border-radius: 3px;
  text-transform: uppercase;
  font-weight: 700;
  letter-spacing: 0.5px;
  border: 1px solid rgba(219, 61, 61, 0.3);
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 40px;
`;

export const HelpDialog = ({ isOpen, onClose }: Props) => {
  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title="Backpack User Guide"
      icon="help"
      style={{ width: '1100px' }}
    >
      <div className={Classes.DIALOG_BODY}>
        <Grid>
          <div>
            <H5>User Actions</H5>
            <Divider />

            <HelpSection style={{ marginTop: '16px' }}>
              <ActionHeader>
                <Icon icon="eye-open" intent={Intent.PRIMARY} />
                <H6 style={{ margin: 0 }}>Artifact Preview</H6>
              </ActionHeader>
              <p>
                Before adding an artifact, use the <b>Preview</b> button. This
                queries the upstream registry in real-time to show you which
                versions exist, their file contents, and their direct
                dependencies. This is useful for verifying if a package name is
                correct or if your regex filter will match the desired versions.
              </p>
            </HelpSection>

            <HelpSection>
              <ActionHeader>
                <Icon icon="cube-add" intent={Intent.SUCCESS} />
                <H6 style={{ margin: 0 }}>Add Artifact</H6>
              </ActionHeader>
              <p>
                Registers a new "Root" artifact in Backpack. Once added, the
                system will begin recursive discovery of all its versions and
                dependencies.
              </p>
              <Callout
                intent={Intent.WARNING}
                icon="shield"
                style={{ marginTop: '8px' }}
              >
                If a processor is configured with <b>Approval Required</b>, the
                artifact will stay in a pending state until an{' '}
                <AdminBadge>Administrator</AdminBadge> approves it.
              </Callout>
            </HelpSection>

            <HelpSection>
              <ActionHeader>
                <Icon icon="refresh" intent={Intent.PRIMARY} />
                <H6 style={{ margin: 0 }}>Request Update (Re-track)</H6>
              </ActionHeader>
              <p>
                Forces the system to re-scan the upstream registry for an
                existing artifact. This is used when you know a new version has
                been released upstream but Backpack hasn't picked it up yet.
              </p>
            </HelpSection>

            <HelpSection>
              <ActionHeader>
                <Icon icon="confirm" intent={Intent.PRIMARY} />
                <H6 style={{ margin: 0 }}>Validate Artifact</H6>
              </ActionHeader>
              <p>
                Verifies the integrity of mirrored files. This action checks
                that every file registered in the Backpack metadata actually
                exists in S3 storage and matches the recorded metadata. Useful
                for auditing the health of your local mirror.
              </p>
            </HelpSection>

            <HelpSection>
              <ActionHeader>
                <Icon icon="manual" intent={Intent.SUCCESS} />
                <H6 style={{ margin: 0 }}>Manual Collection</H6>
              </ActionHeader>
              <p>
                Triggers an immediate download attempt for specific versions
                that may have failed or are stuck in a pending state.
              </p>
            </HelpSection>
          </div>

          <div>
            <H5>Administrative Actions</H5>
            <Divider />

            <HelpSection style={{ marginTop: '16px' }}>
              <ActionHeader>
                <Icon icon="shield" intent={Intent.DANGER} />
                <H6 style={{ margin: 0 }}>Approvals Portal</H6>
                <AdminBadge>Admin Only</AdminBadge>
              </ActionHeader>
              <p>
                Review and vet artifact requests from users. Admins can inspect
                the metadata and regex filters before allowing the ingestion to
                start.
              </p>
            </HelpSection>

            <HelpSection>
              <ActionHeader>
                <Icon icon="key" intent={Intent.DANGER} />
                <H6 style={{ margin: 0 }}>API Key Management</H6>
                <AdminBadge>Admin Only</AdminBadge>
              </ActionHeader>
              <p>
                Generate and revoke API keys for automation. Keys can be scoped
                as <b>User</b> (read-only/add) or <b>Administrator</b>{' '}
                (destructive actions).
              </p>
            </HelpSection>

            <HelpSection>
              <ActionHeader>
                <Icon icon="settings" intent={Intent.DANGER} />
                <H6 style={{ margin: 0 }}>Processor Configuration</H6>
                <AdminBadge>Admin Only</AdminBadge>
              </ActionHeader>
              <p>
                Modify ecosystem-wide settings, such as enabling{' '}
                <b>External Management</b> (metadata-only tracking) or{' '}
                <b>Direct Collection</b>.
              </p>
            </HelpSection>

            <HelpSection>
              <ActionHeader>
                <Icon icon="trash" intent={Intent.DANGER} />
                <H6 style={{ margin: 0 }}>Delete Artifact</H6>
                <AdminBadge>Admin Only</AdminBadge>
              </ActionHeader>
              <p>
                Permanently removes an artifact and all its tracked
                metadata/files from the mirror.
              </p>
            </HelpSection>
          </div>
        </Grid>
      </div>
      <div className={Classes.DIALOG_FOOTER}>
        <div className={Classes.DIALOG_FOOTER_ACTIONS}>
          <Button onClick={onClose} intent={Intent.PRIMARY}>
            Got it!
          </Button>
        </div>
      </div>
    </Dialog>
  );
};
