import React from 'react';
import { Button, Position, Tooltip } from '@blueprintjs/core';
import { useTheme } from 'app/context/ThemeContext';

/** Switches between light and dark mode. */
export const ThemeToggle = () => {
  const { isDark, toggleTheme } = useTheme();
  const label = isDark ? 'Switch to light mode' : 'Switch to dark mode';
  return (
    <Tooltip content={label} position={Position.BOTTOM}>
      <Button
        variant="minimal"
        icon={isDark ? 'flash' : 'moon'}
        aria-label={label}
        onClick={toggleTheme}
      />
    </Tooltip>
  );
};
