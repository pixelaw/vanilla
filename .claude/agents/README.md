# PixeLAW Agent Configurations

This directory contains specialized agent configurations for efficient PixeLAW development with Claude Code.

## Why Use Specialized Agents?

- **Reduced token usage**: Each agent only loads relevant context
- **Faster responses**: Less context to process
- **Deeper analysis**: More tokens available for actual work
- **Better focus**: Agents are specialized for specific tasks

## Available Agents

### 1. pixelaw-sdk-agent
**When to use**: Working on the pixelaw.js SDK codebase
- Implementing new stores or engines
- Debugging blockchain integrations
- Optimizing core functionality

### 2. pixelaw-ui-agent  
**When to use**: Frontend UI/UX development
- Creating React components
- Styling with Tailwind
- Implementing user interactions

### 3. pixelaw-integration-agent
**When to use**: Connecting frontend to SDK
- Debugging connection issues
- Wiring SDK features to UI
- Handling wallet integrations

### 4. pixelaw-blockchain-agent
**When to use**: Blockchain and Docker debugging
- Transaction failures
- World address mismatches
- Container issues

### 5. pixelaw-devops-agent
**When to use**: Build and deployment
- Build errors
- Dependency issues
- Docker configuration

## Usage Examples

```bash
# SDK Development
"I need to implement a new InventoryStore in pixelaw.js"
→ Use pixelaw-sdk-agent

# UI Work
"Add filtering to the notification panel"
→ Use pixelaw-ui-agent

# Integration Issues
"Notifications aren't showing up in the UI"
→ Use pixelaw-integration-agent

# Blockchain Debugging
"Transactions failing with 'world address mismatch'"
→ Use pixelaw-blockchain-agent

# Build Problems
"Getting TypeScript errors during build"
→ Use pixelaw-devops-agent
```

## How to Use with Claude Code

1. Identify which agent matches your task
2. Launch a sub-agent with the Task tool
3. Provide the agent configuration and your specific request
4. The agent will have focused context for better results

Example:
```
Use the pixelaw-ui-agent to add a collapsible sidebar to the notification panel
```

## Benefits

- **80% less context usage** compared to loading everything
- **More accurate results** due to focused expertise
- **Faster iteration** on specific problems
- **Parallel execution** for multi-part tasks