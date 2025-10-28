// Theme definitions imported from individual theme files
// Each theme is maintained in its own file for better organization

import { zenburn } from './themes/zenburn.js';
import { vesper } from './themes/vesper.js';
import { dracula } from './themes/dracula.js';
import { nightOwl } from './themes/night-owl.js';
import { tokyoNight } from './themes/tokyoNight.js';
import { synthwave84 } from './themes/synthwave84.js';
import { solarized } from './themes/solarized.js';
import { rosePine } from './themes/roséPine.js';
import { palenight } from './themes/palenight.js';
import { opencode } from './themes/opencode.js';
import { oneDark } from './themes/one-dark.js';
import { nord } from './themes/nord.js';
import { cobalt2 } from './themes/cobalt2.js';
import { catppuccin } from './themes/catppuccin.js';
import { ayu } from './themes/ayu.js';
import { monokai } from './themes/monokai.js';
import { gruvbox } from './themes/gruvbox.js';
import { github } from './themes/github.js';
import { kanagawa } from './themes/kanagawa.js';
import { everforest } from './themes/everforest.js';
import { mellow } from './themes/mellow.js';
import { aura } from './themes/aura.js';
import { material } from './themes/material.js';

export const THEMES = {
  zenburn,
  vesper,
  dracula,
  "night-owl": nightOwl,
  tokyoNight,
  synthwave84,
  solarized,
  rosePine,
  palenight,
  opencode,
  "one-dark": oneDark,
  nord,
  cobalt2,
  catppuccin,
  ayu,
  monokai,
  gruvbox,
  github,
  kanagawa,
  everforest,
  mellow,
  aura,
  material
};

// Mapping from theme variables to shadcn CSS variables
export const THEME_VARIABLES = {
  // Background colors
  '--background': 'background',
  '--background-panel': 'backgroundPanel',
  '--background-element': 'backgroundElement',

  // Text colors
  '--foreground': 'text',
  '--muted-foreground': 'textMuted',

  // Border colors
  '--border': 'border',
  '--ring': 'borderActive',

  // Interactive colors
  '--primary': 'accent',
  '--primary-foreground': 'text',
  '--secondary': 'secondary',
  '--secondary-foreground': 'text',
  '--accent': 'primary',
  '--accent-foreground': 'text',

  // Status colors
  '--destructive': 'error',
  '--destructive-foreground': 'text',

  // Card colors
  '--card': 'backgroundElement',
  '--card-foreground': 'text',

  // Popover colors
  '--popover': 'backgroundElement',
  '--popover-foreground': 'text',

  // Muted colors
  '--muted': 'backgroundPanel',
  '--muted-foreground': 'textMuted',

  // Input colors
  '--input': 'backgroundElement',

  // Sidebar colors
  '--sidebar': 'background',
  '--sidebar-foreground': 'text',
  '--sidebar-primary': 'primary',
  '--sidebar-primary-foreground': 'text',
  '--sidebar-accent': 'backgroundPanel',
  '--sidebar-accent-foreground': 'text',
  '--sidebar-border': 'border',
  '--sidebar-ring': 'borderActive',

// Custom card text color
  '--card-text': '#1a1a1a',

  // Chart colors (using accent colors)
  '--chart-1': 'primary',
  '--chart-2': 'secondary',
  '--chart-3': 'accent',
  '--chart-4': 'success',
  '--chart-5': 'info'
};

// Default theme
export const DEFAULT_THEME = 'zenburn';