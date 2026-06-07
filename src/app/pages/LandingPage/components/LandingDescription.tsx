import React from 'react';
import { H2, Divider } from '@blueprintjs/core';

export const LandingDescription = () => {
  return (
    <div>
      <H2 style={{ marginBottom: '5px' }}>Backpack 🎒</H2>
      <div
        style={{
          color: '#5c7080',
          fontSize: '1rem',
          fontWeight: 600,
          marginBottom: '20px',
        }}
      >
        Collecting the Internet, one <code>node_modules</code> folder at a
        time.
      </div>
      <Divider />
      <div
        style={{ marginTop: '20px', color: '#5c7080', lineHeight: '1.6' }}
      >
        <p>
          Welcome to <b>Backpack</b>, the over-engineered shopping cart for
          your artifacts. We spend our days stalking registries like NPM and
          NuGet so you don't have to.
        </p>
        <p>
          Our strategy is simple: <b>Greed is Good™</b>. If a package has a
          dependency, we want it. If that dependency has a dependency, we
          want that too. We won't stop until your local Nexus is so full
          of... well, whatever those 15,000 sub-dependencies actually do. Do
          we really need all of them? Probably not. Are we going to stop?
          Absolutely not.
        </p>
        <p>
          Perfect for airgapped sites, high-security bunkers, or people who
          just really, really distrust the internet.
        </p>
      </div>
    </div>
  );
};
