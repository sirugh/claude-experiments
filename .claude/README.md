# Claude Code Configuration

This directory contains Claude Code configuration and extensions for the claude-experiments repository.

## Structure

- `skills/` - Custom skills for Claude to use
- `plugins/` - Plugin extensions
- `hooks/` - Event hooks for automation
- `commands/` - Custom slash commands

## Available Skills

### scaffold-experiment

Scaffolds a new experiment project with proper GitHub Pages deployment configuration.

**Usage:**
```
Use the scaffold-experiment skill
```

**What it does:**
- Creates a new Vite + React + TypeScript project
- Configures the correct base path for GitHub Pages
- Updates the deployment workflow to build and deploy the new experiment
- Updates repository documentation

**Result:**
Your new experiment will be accessible at `https://sirugh.github.io/claude-experiments/<experiment-name>/`

## Sub-projects

Each sub-project in this repository may have its own `.claude/` folder for project-specific configuration.
