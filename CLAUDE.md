# Claude Agent Documentation

This document provides important context and instructions for Claude (or other AI agents) working on this repository.

## PR Preview System

This repository has an automated PR preview system that **automatically discovers and deploys all apps** in every pull request to preview URLs on GitHub Pages.

### How It Works

1. When a PR is created or updated, the `.github/workflows/pr-preview.yml` workflow triggers
2. The workflow:
   - **Automatically discovers** all directories containing a `package.json` file at the root level
   - Excludes special directories like `node_modules/`, `.github/`, and the root `package.json`
   - Builds each discovered app with a PR-specific base path
   - Deploys all apps to the `gh-pages` branch under `_pr/<number>/<app-name>/`
   - Adds a `.nojekyll` file to disable Jekyll processing (which would ignore `_pr/` due to underscore prefix)
   - Posts a comment on the PR with preview URLs for **all discovered apps**
3. The previews remain live until the PR is closed or merged, then get cleaned up by `.github/workflows/pr-cleanup.yml`

### Preview URL Pattern

PR previews are available at:
```
https://sirugh.github.io/claude-experiments/_pr/<PR_NUMBER>/<APP_NAME>/
```

For example, PR #10 with `simple-type` and `chess-teacher` apps would be at:
```
https://sirugh.github.io/claude-experiments/_pr/10/simple-type/
https://sirugh.github.io/claude-experiments/_pr/10/chess-teacher/
```

### Adding a New App

To add a new app that will be **automatically discovered and deployed**:

1. Create a new directory at the root level (e.g., `my-new-app/`)
2. Add a `package.json` with a `build` script
3. Ensure the build outputs to a `dist/` directory
4. Commit and create a PR - the workflow will automatically discover and deploy it!

**No workflow changes needed** - the system is fully generic and will discover any new app automatically.

### Important Instructions for Claude

**After creating or updating a pull request, you MUST inform the user about the preview URLs:**

1. Output clear messages with the preview URLs for all apps using the pattern above
2. Explain that previews are deployed automatically via GitHub Actions
3. Note that deployment is asynchronous and may take 1-2 minutes to complete

**Example output after creating PR #10 with multiple apps:**
```
Pull request created successfully!

PR Preview URLs:
- Simple Type: https://sirugh.github.io/claude-experiments/_pr/10/simple-type/
- Chess Teacher: https://sirugh.github.io/claude-experiments/_pr/10/chess-teacher/

Note: The previews are deployed automatically via GitHub Actions. They may take 1-2 minutes
for the deployment to complete. If you get a 404, wait a moment and refresh.
```

### Deployment Timing

- **Async Process**: The GitHub Actions workflow runs asynchronously after the PR is created
- **Duration**: Typically takes 1-2 minutes from PR creation to preview availability
- **Agent Limitations**: Claude/agents cannot wait for the deployment to complete, as it happens server-side
- **Validation**: Agents cannot reliably validate that the preview is live due to the async nature

### Troubleshooting

If a preview shows 404:
1. Check that `.nojekyll` exists in the root of the `gh-pages` branch
2. Verify GitHub Pages is enabled in repository settings (should use `gh-pages` branch, `/` root)
3. Check the workflow logs in the GitHub Actions tab for deployment errors
4. Ensure the `_pr/<number>/simple-type/` directory exists on the `gh-pages` branch

## Repository Structure

- `/simple-type/` - React app for first graders (math and reading exercises)
- `/chess-teacher/` - Interactive chess tutorial system
- `/.github/workflows/` - GitHub Actions workflows
  - `pr-preview.yml` - **Automatically discovers and deploys all apps** to PR previews
  - `pr-cleanup.yml` - Removes previews when PR closes
  - `deploy.yml` - Deploys production to GitHub Pages
- `/index.html` - Landing page for the experiments site
- `/plan.md` - Implementation plans and architecture documentation

### App Structure Requirements

Each app in the root directory should follow this structure:
```
app-name/
├── package.json       # Must include a "build" script
├── dist/              # Build output directory
└── src/               # Source code
```

## Development Notes

- The main branch is `main`
- Feature branches should follow the pattern: `claude/<description>-<session-id>`
- All PRs should target the `main` branch
- GitHub Pages serves from the `gh-pages` branch
