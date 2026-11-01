import React, { ReactNode } from 'react';
import { Classes, H5, Icon, IconName } from '@blueprintjs/core';
import styled from 'styled-components';

/* A Blueprint card rendered as a <section>. */
const Frame = styled.section`
  && {
    padding: 0;
  }
  display: flex;
  flex-direction: column;
  min-width: 0;
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 12px 16px;
  border-bottom: 1px solid var(--table-border);

  h5 {
    display: flex;
    align-items: center;
    gap: 10px;
    margin: 0;
  }
`;

const Body = styled.div`
  padding: 4px 16px 12px;
`;

interface Props {
  icon: IconName;
  title: string;
  /** Usually a small link, e.g. to the page with everything. */
  action?: ReactNode;
  /** Ties the card to its title for screen readers. */
  titleId: string;
  children: ReactNode;
}

/** A home page section: titled card with an optional action on the right. */
export const HomeCard = ({ icon, title, action, titleId, children }: Props) => (
  <Frame className={Classes.CARD} aria-labelledby={titleId}>
    <Header>
      <H5 id={titleId}>
        <Icon icon={icon} className={Classes.TEXT_MUTED} />
        {title}
      </H5>
      {action}
    </Header>
    <Body>{children}</Body>
  </Frame>
);
