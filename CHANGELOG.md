# Changelog

All notable changes to this project will be documented in this file.

## [0.0.3] - 2026-02-11

### Changed

- **Bug Fixes**: Fixed an issue where the extension was not working properly.

## [0.0.2] - 2026-02-01

### Changed

- **Name**: Changed the name of the extension to "Vanta.js".
- **Icon**: Changed the icon of the extension to a more modern design.

## [0.0.1] - 2026-02-01

### Released

- **Vanta**: Initial release of the "Vanta" extension.
- a simple TypeScript playground inside your editor.

### Features

- **Realtime Execution**: Runs TypeScript code on-the-fly as you type.
- **Inline Logs**: Displays console output directly next to your code.
- **Commands**:
  - `Vanta: Absorb (Run in Current File)`: Absorbs the current file into the Vanta runtime.
  - `Vanta: Singularity (Create New File)`: Opens a new event horizon (`playground.ts`) for testing.
- **Configuration**:
  - `vanta.debounce`: Control execution delay.
  - `vanta.tsconfigPath`: Explicitly set tsconfig location.
