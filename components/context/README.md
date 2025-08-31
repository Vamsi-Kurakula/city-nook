# Theme System

This folder contains the theme system for the City Crawler app.

## Files

- **`ThemeContext.tsx`** - React context provider for theme data
- **`theme.js`** - JavaScript configuration file containing all theme colors
- **`generate_theme_preview.py`** - Python script to generate a visual preview of the theme
- **`themeUtils.ts`** - Utility functions for working with themes
- **`requirements.txt`** - Python dependencies for the theme preview generator
- **`theme_preview.png`** - Generated preview image (do not edit manually)

## How It Works

1. **Theme Definition**: Colors are defined in `theme.js`
2. **React Integration**: `ThemeContext.tsx` imports the theme directly from JavaScript
3. **Preview Generation**: Python script reads JavaScript and creates a visual preview
4. **App Usage**: Components use `useTheme()` hook to access theme colors

## Adding New Colors

1. Add the color to `theme.js`
2. Run `python generate_theme_preview.py` to regenerate the preview
3. The new color will automatically be available in your React components

## Theme Structure

The theme follows this structure:
- `background` - Background colors
- `text` - Text colors  
- `button` - Button colors
- `status` - Status colors (success, warning, error, info)
- `border` - Border colors
- `shadow` - Shadow colors
- `special` - Special colors including gradient

## Benefits of This Approach

- ✅ **No build-time dependencies** - Theme loads instantly
- ✅ **Type safety** - Full TypeScript support
- ✅ **Single source of truth** - `theme.js` is the master file
- ✅ **Easy updates** - Just edit `theme.js` and regenerate preview
- ✅ **No network requests** - Theme is bundled with the app

## Requirements

```bash
pip install -r requirements.txt
```

## Usage

```bash
cd components/context
python generate_theme_preview.py
```

## Output

The script will generate `theme_preview.png` in the current directory, showing all theme colors organized by category.
