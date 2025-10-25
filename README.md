# Claude Experiments

A collection of experimental applications and projects developed with Claude Code, each running in isolated environments.

## Repository Structure

This repository contains multiple independent applications, each with its own isolated environment and Claude Code configuration.

### Applications

- **simple-type/** - Educational web app for first graders featuring adaptive math and reading exercises
  - [Live Demo](https://sirugh.github.io/claude-experiments/) (GitHub Pages)
  - [Documentation](./simple-type/README.md)

### Claude Code Configuration

Each application has its own `.claude/` folder for project-specific configuration:

- Main `.claude/` - Repository-level configuration
- `simple-type/.claude/` - Simple Type app configuration
- Future apps will have their own `.claude/` folders

## Local Development

Each application can be developed independently. Navigate to the app directory and follow its README for setup instructions.

Example for simple-type:
```bash
cd simple-type
npm install
npm run dev
```

## Deployment

Applications are automatically deployed to GitHub Pages when changes are pushed to the main branch.

- The GitHub Actions workflow builds and deploys apps automatically
- Each app is accessible via the repository's GitHub Pages URL

## Adding New Applications

1. Create a new directory in the root
2. Initialize the application with its own `.claude/` folder
3. Add appropriate build and deployment configuration
4. Update this README with the new app information
