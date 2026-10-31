import React, { ReactNode } from 'react';
import { Classes, H3, H4, Icon, IconName } from '@blueprintjs/core';
import styled from 'styled-components';

const HeaderRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 1rem;
  flex-shrink: 0;
`;

const TitleBlock = styled.div`
  min-width: 0;

  h3,
  h4 {
    display: flex;
    align-items: center;
    gap: 10px;
    margin: 0;
  }
`;

const Description = styled.div`
  margin-top: 4px;
`;

const Actions = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
`;

interface Props {
  icon?: IconName;
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
}

/** Title row at the top of a page: icon, title, optional subtitle and actions. */
export const PageHeader = ({ icon, title, description, actions }: Props) => (
  <HeaderRow>
    <TitleBlock>
      <H3>
        {icon && <Icon icon={icon} size={18} />}
        {title}
      </H3>
      {description && (
        <Description className={Classes.TEXT_MUTED}>{description}</Description>
      )}
    </TitleBlock>
    {actions && <Actions>{actions}</Actions>}
  </HeaderRow>
);

/** Smaller title row for a section within a page. */
export const SectionHeader = ({ icon, title, description, actions }: Props) => (
  <HeaderRow style={{ marginBottom: '0.5rem' }}>
    <TitleBlock>
      <H4>
        {icon && <Icon icon={icon} />}
        {title}
      </H4>
      {description && (
        <Description className={Classes.TEXT_MUTED}>{description}</Description>
      )}
    </TitleBlock>
    {actions && <Actions>{actions}</Actions>}
  </HeaderRow>
);

/** Fills the main area below the navbar and lays children out vertically. */
export const Page = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100%;
  padding: 1rem 1.25rem;
  box-sizing: border-box;
`;

/** A page that takes exactly the available height so tables can scroll inside it. */
export const FillPage = styled(Page)`
  height: 100%;
  min-height: 0;
`;

/** Sidebar + content layout used by the artifact browser and processor config. */
export const SplitLayout = styled.div`
  display: flex;
  gap: 16px;
  flex: 1;
  min-height: 0;

  @media (max-width: 900px) {
    flex-direction: column;
  }
`;

export const SplitContent = styled.div`
  flex: 1;
  min-width: 0;
  min-height: 0;
  display: flex;
  flex-direction: column;
`;
