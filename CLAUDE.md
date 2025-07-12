# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a PixeLAW frontend client - a React-based application for interacting with blockchain-based pixel gaming worlds. The project supports multiple blockchain engines (Dojo and MUD) and can connect to various PixeLAW world instances.

## Development Commands

### Core Development
- `pnpm dev` - Start development server with hot reloading
- `pnpm build` - Build production bundle
- `pnpm build-prod` - Build with TypeScript compilation first
- `pnpm preview` - Preview production build locally

### Code Quality
- `pnpm lint` - Lint code with Biome
- `pnpm format` - Format code with Biome
- `pnpm check` - Run Biome check with auto-fixes
- `pnpm test` - Run tests with Vitest
- `pnpm coverage` - Run tests with coverage report

### Workspace Management
- `pnpm use-workspace` - Switch to workspace dependencies (for local pixelaw.js development)
- `pnpm use-regular` - Switch to regular npm dependencies
- `pnpm upgrade_pixelaw` - Update all @pixelaw packages

## Architecture

### Core Dependencies
- **@pixelaw/core**: Core PixeLAW functionality
- **@pixelaw/core-dojo**: Dojo blockchain engine integration
- **@pixelaw/core-mud**: MUD blockchain engine integration  
- **@pixelaw/react**: React components and hooks
- **@pixelaw/react-dojo**: Dojo-specific React components

### Key Files
- `src/index.tsx` - Application entry point with engine initialization
- `src/Main.tsx` - Main routing component
- `src/config/worlds.json` - World configuration registry
- `vite.config.ts` - Vite configuration with workspace/regular dependency switching
- `biome.json` - Code formatting and linting configuration

### Project Structure
- `src/components/` - Reusable UI components
- `src/pages/` - Route-level page components
- `src/config/` - Configuration files
- `src/lib/` - Utility libraries

### Workspace Configuration
The project can operate in two modes controlled by `pnpm-workspace.yaml` presence:
- **Workspace mode**: Uses local pixelaw.js packages via path aliases
- **Regular mode**: Uses npm-published @pixelaw packages

### World Configuration
Multiple blockchain worlds are supported via `src/config/worlds.json`:
- Local development (Dojo/MUD engines)
- Sepolia testnet
- Demo environment  
- Mainnet

## Development Setup

1. Initialize submodules: `git submodule init && git submodule update`
2. Install dependencies: `pnpm install`
3. Start development: `pnpm dev`

## Code Style

- Uses Biome for formatting and linting
- 4-space indentation
- Double quotes for strings
- Trailing commas required
- Line width: 120 characters
- TypeScript strict mode enabled