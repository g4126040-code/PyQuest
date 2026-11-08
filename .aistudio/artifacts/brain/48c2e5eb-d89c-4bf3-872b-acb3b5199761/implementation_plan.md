# Remove Developer Test Mode from Settings — Plan

## Overview
Remove the **Developer** group item and the **Developer Test Mode** card (including its nested controls) from `src/components/SettingsScreen.tsx` while keeping all existing user progress and all other application screens, features, and components completely untouched.

## Planned Changes

### 1. Settings Screen (`src/components/SettingsScreen.tsx`)
- Remove the `'Developer'` group entry (`{ id: 'devtest', label: 'Developer Test Mode' }`) from `settingsGroups`.
- Remove the **Developer Test Mode** card section at the bottom of `SettingsScreen.tsx`.
- Do **not** alter `localStorage` or user progress (`ProgressContext.tsx` stays intact so existing progress remains exactly as it is).
- Do **not** touch any other components, screens, styles, or functionality.

## Verification
- Run `lint_applet` and `compile_applet` to verify a clean TypeScript and production build.
