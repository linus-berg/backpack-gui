import React from 'react';
import {
  Button,
  Callout,
  Classes,
  Dialog,
  Divider,
  H5,
  H6,
  Icon,
  IconName,
  Intent,
  Tag,
} from '@blueprintjs/core';
import styled from 'styled-components';
import { ARTIFACT_ACTIONS } from 'app/components/ArtifactActions/actions';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const HelpSection = styled.div`
  margin-top: 16px;

  p {
    margin: 6px 0 0;
  }
`;

const ActionHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;

  h6 {
    margin: 0;
  }
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 40px;
`;

const AdminTag = () => (
  <Tag minimal intent={Intent.DANGER}>
    Admin only
  </Tag>
);

const Item = ({
  icon,
  title,
  admin,
  children,
}: {
  icon: IconName;
  title: string;
  admin?: boolean;
  children: React.ReactNode;
}) => (
  <HelpSection>
    <ActionHeader>
      <Icon icon={icon} />
      <H6>{title}</H6>
      {admin && <AdminTag />}
    </ActionHeader>
    {children}
  </HelpSection>
);

const userActions = [
  ARTIFACT_ACTIONS.preview,
  ARTIFACT_ACTIONS.add,
  ARTIFACT_ACTIONS.inspect,
  ARTIFACT_ACTIONS.track,
  ARTIFACT_ACTIONS.validate,
  ARTIFACT_ACTIONS.forceCollect,
];

export const HelpDialog = ({ isOpen, onClose }: Props) => (
  <Dialog
    isOpen={isOpen}
    onClose={onClose}
    title="Backpack user guide"
    icon="help"
    style={{ width: 'min(1100px, 95vw)' }}
  >
    <div className={Classes.DIALOG_BODY}>
      <Grid>
        <div>
          <H5>Working with artifacts</H5>
          <Divider />
          {userActions.map(action => (
            <Item key={action.label} icon={action.icon} title={action.label}>
              <p>{action.description}</p>
            </Item>
          ))}
          <HelpSection>
            <Callout
              intent={Intent.PRIMARY}
              icon="filter"
              title="Version filters"
            >
              A filter is a regular expression matched against each version,
              e.g. <code>^4\.</code> for 4.x only. Leave it empty to mirror
              every version. <code>*</code> on its own is not valid; use{' '}
              <code>.*</code> or leave the field empty.
            </Callout>
          </HelpSection>
          <HelpSection>
            <Callout intent={Intent.WARNING} icon="shield">
              On processors that require approval, new artifacts wait until an
              administrator approves them. You’ll see a notice when you add one.
            </Callout>
          </HelpSection>
        </div>

        <div>
          <H5>Administration</H5>
          <Divider />
          <Item icon="confirm" title="Approvals" admin>
            <p>
              Review requested artifacts, their filters and configuration, then
              approve or reject them (optionally with a reason). The navigation
              bar shows how many are waiting.
            </p>
          </Item>
          <Item icon="key" title="API keys" admin>
            <p>
              Generate and revoke keys for automation. <b>User</b> keys can read
              and add artifacts; <b>Administrator</b> keys can also delete and
              reconfigure.
            </p>
          </Item>
          <Item icon="cog" title="Processor configuration" admin>
            <p>
              Change processor behaviour (approval, preview, bulk add, external
              or direct collection), its description and its configuration
              fields.
            </p>
          </Item>
          <Item icon="calendar" title="Tracking schedules" admin>
            <p>
              Check processors for new versions automatically on a cron
              schedule, or trigger a sync now. Find them on the Status page.
            </p>
          </Item>
          <Item
            icon={ARTIFACT_ACTIONS.delete.icon}
            title={ARTIFACT_ACTIONS.delete.label}
            admin
          >
            <p>{ARTIFACT_ACTIONS.delete.description}</p>
          </Item>
        </div>
      </Grid>
    </div>
    <div className={Classes.DIALOG_FOOTER}>
      <div className={Classes.DIALOG_FOOTER_ACTIONS}>
        <Button onClick={onClose} intent={Intent.PRIMARY}>
          Close
        </Button>
      </div>
    </div>
  </Dialog>
);
