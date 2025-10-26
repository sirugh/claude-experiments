# Claude Experiments

A collection of experimental applications and projects developed with Claude Code. Each experiment runs independently with its own environment and configuration.

**Live Site**: [https://sirugh.github.io/claude-experiments/](https://sirugh.github.io/claude-experiments/)

## What's Inside

This repository includes:

- **Landing Page** (`index.html`) - A responsive showcase page displaying all available experiments with descriptions and links
- **Experiments** - Independent web applications, each in its own directory

## Current Experiments

### Simple Type
Educational web app for first graders featuring adaptive math and reading exercises.

- **Live**: [https://sirugh.github.io/claude-experiments/simple-type/](https://sirugh.github.io/claude-experiments/simple-type/)
- **Tech Stack**: React 18, TypeScript, Vite
- **Features**:
  - Adaptive math problems with progressive difficulty (6 levels)
  - Dynamic difficulty adjustment based on performance
  - Visual feedback and score tracking
  - Reading mode (coming soon)
- **Documentation**: [simple-type/README.md](./simple-type/README.md)

## Repository Structure

```
claude-experiments/
├── index.html              # Landing page showcasing all experiments
├── .claude/                # Repository-level Claude Code configuration
│   └── skills/
│       └── scaffold-experiment.md  # Skill for creating new experiments
├── .github/workflows/      # GitHub Actions for automated deployment
├── simple-type/            # First experiment
│   ├── .claude/            # Experiment-specific configuration
│   ├── src/                # React source code
│   └── package.json
└── README.md              # This file
```

## Local Development

### Landing Page
The landing page is a static HTML file. Simply open `index.html` in a browser or use a local server:

```bash
python -m http.server 8000
# or
npx serve .
```

### Experiments
Each experiment can be developed independently. Navigate to the experiment directory and follow its README.

Example for simple-type:
```bash
cd simple-type
npm install
npm run dev
```

## Deployment

The repository uses GitHub Actions to automatically build and deploy to GitHub Pages when changes are pushed to the main branch.

- **Workflow**: `.github/workflows/deploy.yml`
- **Deployment**: Triggered on push to main when relevant files change
- **Structure**: Landing page at root, experiments in subdirectories

## Adding New Experiments

Use the `scaffold-experiment` skill to quickly create a new experiment with proper configuration:

1. Run the scaffold skill in Claude Code
2. Provide experiment name, type, and description
3. The skill will:
   - Create the project structure
   - Configure Vite base paths
   - Update GitHub Actions workflow
   - Update documentation
   - Set up proper routing

Alternatively, manually create:
1. New directory in repository root
2. Configure build output and base paths
3. Update `.github/workflows/deploy.yml` with build steps
4. Add experiment card to `index.html`
5. Update this README

## Claude Code Configuration

Each level has its own `.claude/` configuration:

- **Root `.claude/`**: Repository-level tools, skills, and settings
  - `scaffold-experiment` skill for creating new experiments
- **Experiment `.claude/`**: Experiment-specific configuration and tools

This allows each experiment to have custom Claude Code configurations while maintaining shared repository-level utilities.

## Technology

- **Landing Page**: Vanilla HTML/CSS with responsive design and dark mode
- **Experiments**: Various stacks (currently React + TypeScript + Vite)
- **Deployment**: GitHub Actions + GitHub Pages
- **Development**: Claude Code with custom skills and configurations
