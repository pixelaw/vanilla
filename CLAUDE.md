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

### Docker & Task Runner (justfile)
- `just dev` - **Interactive dev command**: Shows logs in terminal AND saves to `dev.log` (using `tee`)
- `just dev_bg` - **Background dev command**: Runs dev server in background, logs to `dev.log`
- `just dev_stop` - Stop background dev server gracefully
- `just dev_logs` - Follow `dev.log` file in real-time
- `just docker_run` - Start Docker containers with `docker-compose up -d`
- `just docker_logs` - View all container logs
- `just docker_logs_follow` - Follow container logs in real-time

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
- **local**: Local Dojo development world (default: http://127.0.0.1:3000)
- **tunnel**: Tunneled development world  
- **mud-empty**: Local MUD development world
- **sepolia**: Sepolia testnet deployment
- **demo**: Demo environment (https://demo.pixelaw.xyz)
- **mainnet**: Production deployment

**Important**: The `world` address in `local` config must match the Docker container's world address. Check `just docker_logs` if connection issues occur.

## Development Setup

1. Initialize submodules: `git submodule init && git submodule update`
2. Install dependencies: `pnpm install`
3. Start development: `just dev_bg` (recommended) or `pnpm dev`

### Recommended Development Workflow

1. **Start services**: `just dev_bg` - Ensures Docker containers are running and starts Vite dev server in background
2. **Monitor logs**: `just dev_logs` - Follow development server logs in real-time (optional)
3. **Develop**: Edit files with HMR automatically updating the browser at http://127.0.0.1:5173/
4. **Stop services**: `just dev_stop` - Clean shutdown of dev server

### Development Environment Details

**Docker Integration**: 
- The `pixelaw-core` container runs the Dojo blockchain backend on port 3000
- World address is auto-detected from Docker logs and should match `src/config/worlds.json`

**Log Monitoring**:
- Vite dev server logs are saved to `dev.log` for Claude Code to monitor
- Both user and Claude can see HMR updates, build errors, and TypeScript issues
- Use `Read dev.log` to check recent development server activity

**Port Configuration**:
- Frontend: http://127.0.0.1:5173/ (Vite dev server)
- Backend: http://127.0.0.1:3000 (PixeLAW core)
- RPC: http://127.0.0.1:5050 (Dojo blockchain)
- Torii: http://127.0.0.1:8080 (Dojo indexer)

## Code Style

- Uses Biome for formatting and linting
- 4-space indentation
- Double quotes for strings
- Trailing commas required
- Line width: 120 characters
- TypeScript strict mode enabled

## Troubleshooting

### Common Issues

**Port 5173 already in use**: Use `just dev_stop` to stop background dev server, then restart with `just dev_bg`

**Docker container not running**: Run `just docker_run` to start the PixeLAW core container

**World address mismatch errors**: 
1. Check Docker container logs: `just docker_logs`
2. Update world address in `src/config/worlds.json` to match container output
3. The app will auto-reload via HMR when config is updated

**JavaScript console errors**: Some WASM/Dojo integration warnings are normal and don't affect functionality. Check browser at http://127.0.0.1:5173/ - if UI loads and displays properly, the app is working correctly.

### Development Server States
- **Vite connecting/connected**: Normal HMR initialization
- **Loading loadWorld**: PixeLAW core initialization
- **core.setStatus readyWithoutWallet**: Ready for development (normal state)
- **Connected to Ably**: Real-time service connected