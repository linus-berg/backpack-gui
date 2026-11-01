import React from 'react';
import { Classes, H2, Intent } from '@blueprintjs/core';
import styled from 'styled-components';
import { useProcessors, useRootArtifactCounts } from 'api/queries';
import { useUser } from 'app/context/UserContext';
import { LinkButton } from 'app/components/common/LinkButton';
import LogoMark from '../../../logo.svg?react';

const Hero = styled.header`
  /* Faint isometric lattice, as on the landing page, fading out to the left
     so it never sits behind the text. */
  --lattice: color-mix(in srgb, currentColor 11%, transparent);
  position: relative;
  overflow: hidden;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 20px 24px;
  padding: 24px 28px;
  background: var(--card-bg);
  border: 1px solid var(--table-border);
  border-radius: 8px;

  &::before {
    content: '';
    position: absolute;
    inset: 0;
    pointer-events: none;
    background-image: repeating-linear-gradient(
        30deg,
        var(--lattice) 0 1px,
        transparent 1px 30px
      ),
      repeating-linear-gradient(
        150deg,
        var(--lattice) 0 1px,
        transparent 1px 30px
      );
    -webkit-mask-image: linear-gradient(to left, #000 15%, transparent 75%);
    mask-image: linear-gradient(to left, #000 15%, transparent 75%);
  }
  > * {
    position: relative;
  }
`;

const Mark = styled(LogoMark)`
  width: 64px;
  height: 64px;
  flex-shrink: 0;
`;

const Text = styled.div`
  flex: 1;
  min-width: 240px;

  h2 {
    margin: 0 0 6px;
    letter-spacing: -0.01em;
  }
  p {
    margin: 0;
    font-size: 1rem;
  }
`;

const Actions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`;

const greeting = (hour: number) =>
  hour >= 5 && hour < 12
    ? 'Good morning'
    : hour >= 12 && hour < 18
    ? 'Good afternoon'
    : 'Good evening';

/** One sentence about the mirror, once the numbers are in. */
const useSummary = () => {
  const processors = useProcessors();
  const counts = useRootArtifactCounts(processors.data);
  const values = Object.values(counts);
  if (!processors.data || values.some(v => v === undefined)) {
    return 'Backpack mirrors packages, images and repositories, with every version of every dependency, for networks without internet access.';
  }
  const artifacts = values.reduce<number>((sum, v) => sum + (v ?? 0), 0);
  const ecosystems = processors.data.length;
  return `Tracking ${artifacts.toLocaleString()} artifact${
    artifacts === 1 ? '' : 's'
  } across ${ecosystems} processor${
    ecosystems === 1 ? '' : 's'
  }, together with every version of everything they depend on.`;
};

/** Top of the home page: logo, greeting and the main actions. */
export const WelcomeHeader = () => {
  const { user } = useUser();
  const summary = useSummary();
  const hello = greeting(new Date().getHours());
  const name = user?.name?.split(/\s+/)[0];

  return (
    <Hero>
      <Mark aria-hidden="true" focusable="false" />
      <Text>
        <H2>{name ? `${hello}, ${name}` : 'Welcome to Backpack'}</H2>
        <p className={Classes.TEXT_MUTED}>{summary}</p>
      </Text>
      <Actions>
        <LinkButton
          to="/processor"
          icon="add"
          intent={Intent.PRIMARY}
          text="Add artifact"
        />
        <LinkButton to="/processor" icon="cube" text="Browse artifacts" />
      </Actions>
    </Hero>
  );
};
