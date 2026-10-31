import React from 'react';
import { Classes, H2 } from '@blueprintjs/core';

/** Short introduction at the top of the home page. */
export const LandingDescription = () => (
  <header>
    <H2 style={{ marginBottom: 4 }}>Backpack 🎒</H2>
    <div
      className={Classes.TEXT_MUTED}
      style={{ fontSize: '1rem', fontWeight: 600 }}
    >
      Collecting the Internet, one <code>node_modules</code> folder at a time.
    </div>
    <p className={Classes.TEXT_MUTED} style={{ marginTop: 8, maxWidth: 760 }}>
      Backpack mirrors packages together with every version of every dependency,
      so air-gapped sites never go without. Our strategy is simple:{' '}
      <b>Greed is Good™</b>.
    </p>
  </header>
);
