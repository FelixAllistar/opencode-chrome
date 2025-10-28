# Zenburn Theme Usage Summary

## Overview
The Zenburn theme is implemented in the OpenCode browser extension through a comprehensive color system that maps theme-specific colors to CSS variables. These variables are dynamically applied to UI elements throughout the application using Tailwind CSS classes and inline styles.

## Theme Color Definitions
The Zenburn theme defines the following color properties in `src/utils/themes.js`:

### Core Colors
- **Primary**: `#8cd0d3` (dark), `#5f7f8f` (light)
- **Secondary**: `#dc8cc3` (dark), `#8f5f8f` (light)
- **Accent**: `#93e0e3` (dark), `#5f8f8f` (light)
- **Background**: `#3f3f3f` (dark), `#ffffef` (light)
- **Background Panel**: `#4f4f4f` (dark), `#f5f5e5` (light)
- **Background Element**: `#5f5f5f` (dark), `#ebebdb` (light)
- **Text**: `#dcdccc` (dark), `#3f3f3f` (light)
- **Text Muted**: `#9f9f9f` (dark), `#6f6f6f` (light)
- **Border**: `#5f5f5f` (dark), `#d0d0c0` (light)
- **Border Active**: `#8cd0d3` (dark), `#5f7f8f` (light)

### Status Colors
- **Error**: `#cc9393` (dark), `#8f5f5f` (light)
- **Warning**: `#f0dfaf` (dark), `#8f8f5f` (light)
- **Success**: `#7f9f7f` (dark), `#5f8f5f` (light)
- **Info**: `#dfaf8f` (dark), `#8f7f5f` (light)

### Markdown & Syntax Highlighting
- **Markdown Text/Heading/Link**: Various shades for text styling
- **Syntax Keywords/Functions/Strings**: Color-coded for code syntax
- **Diff colors**: Added/removed/context highlighting

## CSS Variable Mapping
In `src/utils/themes.js`, theme colors are mapped to CSS variables via `THEME_VARIABLES`:

```javascript
export const THEME_VARIABLES = {
  '--background': 'background',
  '--background-panel': 'backgroundPanel',
  '--background-element': 'backgroundElement',
  '--foreground': 'text',
  '--muted-foreground': 'textMuted',
  '--border': 'border',
  '--ring': 'borderActive',
  '--primary': 'primary',
  '--secondary': 'secondary',
  '--accent': 'accent',
  '--destructive': 'error',
  // ... and more for sidebar, charts
};
```

## Application in UI Components

### Global Styles (`src/index.css`)
The CSS variables are defined using `var(--theme-variable)` with fallbacks:
```css
--color-background: var(--background, #0d1117);
--color-primary: var(--primary, #238636);
--color-sidebar: var(--background-panel, #0d1117);
```

### Component Usage

#### Sidebar (`src/components/app-sidebar.tsx`)
- **Chat items**: `bg-accent` (selected), `hover:bg-accent/50` (hover)
- **Text**: `text-muted-foreground` (timestamps, message counts)
- **Delete button**: `text-muted-foreground hover:text-destructive`

#### Messages (`src/components/ai-elements/message.tsx`)
- **User messages**: `bg-secondary text-foreground border-l-accent`
- **Assistant messages**: `bg-secondary text-foreground`
- **Text content**: `text-foreground`

#### Code Blocks (`src/components/ai-elements/code-block.tsx`)
- **Background**: `hsl(var(--background))`
- **Text**: `hsl(var(--foreground))`
- **Line numbers**: `hsl(var(--muted-foreground))`

#### UI Components (Various)
- **Cards**: `bg-card text-card-foreground`
- **Buttons**: `bg-background hover:bg-accent`
- **Inputs**: `border-input bg-transparent text-foreground`
- **Dialogs/Sheets**: `bg-background border`
- **Sidebar elements**: `bg-sidebar text-sidebar-foreground`

#### Inline Styles
Some components use `hsl(var(--variable))` for dynamic styling:
- Code block backgrounds and text colors
- Shimmer effects in `shimmer.tsx`
- Connection elements in `connection.tsx`

## Theme Application Flow
1. **Theme Selection**: User selects Zenburn theme via `ThemeSwitcher`
2. **Variable Setting**: `ThemeProvider` applies Zenburn colors to CSS variables on `:root`
3. **Component Styling**: Components use Tailwind classes that reference these variables
4. **Dynamic Updates**: Real-time theme switching without page reload

## UI Element Color Mapping

| UI Element | Zenburn Color Used | CSS Variable | Example Usage |
|------------|-------------------|--------------|---------------|
| Main Background | background (#3f3f3f) | --background | `bg-background` |
| Sidebar | background-panel (#4f4f4f) | --background-panel | `bg-sidebar` |
| Cards/Panels | background-panel (#4f4f4f) | --background-panel | `bg-card` |
| Text | text (#dcdccc) | --foreground | `text-foreground` |
| Muted Text | text-muted (#9f9f9f) | --muted-foreground | `text-muted-foreground` |
| Borders | border (#5f5f5f) | --border | `border-border` |
| Primary Actions | primary (#8cd0d3) | --primary | `text-primary` |
| Secondary Elements | background-element (#5f5f5f) | --background-element | `bg-secondary` |
| Accents/Highlights | accent (#93e0e3) | --accent | `bg-accent` |
| Error States | error (#cc9393) | --destructive | `text-destructive` |

## Key Implementation Files
- `src/utils/themes.js`: Theme definitions and variable mapping
- `src/contexts/ThemeProvider.jsx`: Theme application logic
- `src/index.css`: CSS variable definitions and Tailwind integration
- `src/components/app-sidebar.tsx`: Sidebar theming
- `src/components/ai-elements/message.tsx`: Message theming
- `src/components/ai-elements/code-block.tsx`: Code syntax theming