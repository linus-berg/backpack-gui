// src/components/ThemeToggle.js

import React, { useState, useEffect } from 'react';
import { Switch } from '@blueprintjs/core';

// Define the class and the local storage key
const DARK_MODE_CLASS = 'bp4-dark';
const LOCAL_STORAGE_KEY = 'blueprintjs-dark-mode';

export const ThemeToggle = () => {
  // 1. Initialize state from localStorage or default to false (light mode)
  const [isDarkMode, setIsDarkMode] = useState(() => {
    try {
      const savedMode = localStorage.getItem(LOCAL_STORAGE_KEY);
      // Use the saved value, or default to false
      return savedMode ? JSON.parse(savedMode) : true;
    } catch (error) {
      console.error('Could not parse dark mode from localStorage', error);
      return false;
    }
  });

  // 2. Use useEffect to apply the class to <body> and save to localStorage
  useEffect(() => {
    // Add or remove the class from the <body> tag
    document.body.classList.toggle(DARK_MODE_CLASS, isDarkMode);
    document.body.classList.toggle('dark-bg', isDarkMode);
    document.body.classList.toggle('light-bg', !isDarkMode);

    // Save the user's preference to localStorage
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(isDarkMode));
    } catch (error) {
      console.error('Could not save dark mode to localStorage', error);
    }

    // This effect runs every time 'isDarkMode' changes
  }, [isDarkMode]);

  // 3. Handler to toggle the state
  const handleThemeChange = () => {
    setIsDarkMode(prevMode => !prevMode);
  };

  return (
    <div style={{ padding: '20px' }}>
      <Switch
        className="theme-toggle"
        checked={isDarkMode}
        label={isDarkMode ? 'Dark Mode' : 'Light Mode'}
        onChange={handleThemeChange}
      />
    </div>
  );
};
