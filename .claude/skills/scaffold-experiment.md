# Scaffold New Experiment

You are helping scaffold a new experiment in the claude-experiments repository.

## Overview

This skill creates a new experiment project within the claude-experiments folder and configures GitHub Pages deployment for it.

## Instructions

Follow these steps to scaffold a new experiment:

### 1. Gather Information

Ask the user for:
- **Experiment name**: The name of the experiment (use kebab-case, e.g., "my-experiment")
- **Project type**: What type of project (default: Vite + React + TypeScript)
- **Description**: Brief description of what the experiment does

### 2. Validate Experiment Name

- Ensure the name uses kebab-case (lowercase with hyphens)
- Check that a folder with this name doesn't already exist
- Warn if the name is too long or contains invalid characters

### 3. Create Project Structure

Based on the project type selected:

**For Vite + React + TypeScript (default):**
```bash
cd /home/user/claude-experiments
npm create vite@latest <experiment-name> -- --template react-ts
```

**For other types:** Guide the user through the appropriate setup commands.

### 4. Configure Vite Base Path

Edit the `vite.config.ts` file in the new experiment folder to set the correct base path:

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/claude-experiments/<experiment-name>/',
})
```

### 5. Update GitHub Actions Workflow

Edit `.github/workflows/deploy.yml` to include the new experiment:

**Add to the `paths` trigger section:**
```yaml
paths:
  - 'simple-type/**'
  - '<experiment-name>/**'
  - '.github/workflows/deploy.yml'
```

**Add build steps for the new experiment (after existing build steps):**
```yaml
- name: Install dependencies (<experiment-name>)
  run: npm ci
  working-directory: ./<experiment-name>

- name: Build (<experiment-name>)
  run: npm run build
  working-directory: ./<experiment-name>
```

**Add to the deployment structure preparation:**
```yaml
- name: Prepare deployment structure
  run: |
    mkdir -p _site/simple-type
    cp -r simple-type/dist/* _site/simple-type/
    mkdir -p _site/<experiment-name>
    cp -r <experiment-name>/dist/* _site/<experiment-name>/
```

### 6. Update Repository README

Add the new experiment to the main README.md:

```markdown
## Experiments

- [simple-type](https://sirugh.github.io/claude-experiments/simple-type/) - Simple typing speed test
- [<experiment-name>](https://sirugh.github.io/claude-experiments/<experiment-name>/) - <description>
```

### 7. Create Experiment README

Create a README.md in the experiment folder with:
- Title and description
- Development instructions (`npm install`, `npm run dev`)
- Build instructions (`npm run build`)
- Live demo link (once deployed)

### 8. Summary

Provide the user with:
- Confirmation of created files and directories
- The URL where the experiment will be accessible: `https://sirugh.github.io/claude-experiments/<experiment-name>/`
- Next steps:
  1. `cd <experiment-name> && npm install`
  2. `npm run dev` to test locally
  3. Commit and push changes
  4. Merge to main to trigger deployment

## Important Notes

- Always use the pattern `/claude-experiments/<experiment-name>/` for the Vite base path
- The deployment workflow expects a `dist` folder after building
- Each experiment should be self-contained in its own directory
- Don't forget to update the workflow trigger paths to include the new experiment folder

## Error Handling

If any step fails:
- Provide clear error messages
- Suggest remediation steps
- Don't proceed to the next step until the current one succeeds
