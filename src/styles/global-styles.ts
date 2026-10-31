import { createGlobalStyle } from 'styled-components';

// Fonts and colors live in app/app.scss; this only sets up the page box.
export const GlobalStyle = createGlobalStyle`
  html,
  body {
    height: 100%;
    width: 100%;
  }

  #root {
    min-height: 100%;
    min-width: 100%;
  }

  input, select, textarea {
    font-family: inherit;
    font-size: inherit;
  }
`;
