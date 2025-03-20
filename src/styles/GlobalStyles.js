// src/styles/GlobalStyles.js
import { createGlobalStyle } from 'styled-components';

export const GlobalStyles = createGlobalStyle`
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }
  
  body {
    font-family: 'Helvetica Neue', Arial, sans-serif;
    background-color: #121212;
    color: #ffffff;
  }
  
  a {
    text-decoration: none;
    color: inherit;
  }
`;