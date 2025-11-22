/*
  Theme Utility
  - Manage global theme state
  - Subscribe to theme changes
  - Persist theme to localStorage
*/

import createContext from './context.js';

const getInitialTheme = () => {
  let theme = document.documentElement.getAttribute('theme');
  if(!theme) theme = localStorage.getItem('theme');
  return theme || 'auto';
};

const themeContext = createContext('theme', getInitialTheme());

themeContext.subscribe(theme => {
  localStorage.setItem('theme', theme);
  document.documentElement.setAttribute('theme', theme);
});

export const setTheme = theme => themeContext.set(theme);

export const getTheme = () => themeContext.get();

export const subscribeToTheme = callback => themeContext.subscribe(callback);

export const getCalculatedTheme = () => {
  const theme = getTheme();
  if(theme === 'auto'){
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  return theme;
};

/*
  Auto Theme Detection
*/
const colorSchemeQuery = window.matchMedia('(prefers-color-scheme: dark)');
const colorSchemeChangeHandler = event => document.documentElement.setAttribute('auto-theme', event.matches ? 'dark' : 'light');
colorSchemeQuery.addEventListener('change', colorSchemeChangeHandler);
colorSchemeChangeHandler(colorSchemeQuery);

export default {
  get: getTheme,
  set: setTheme,
  subscribe: subscribeToTheme,
  getCalculated: getCalculatedTheme
};
