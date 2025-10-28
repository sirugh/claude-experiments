# Claude Agent Documentation

This document provides important context and instructions for Claude (or other AI agents) working on this repository.

## PR Preview System

This repository has an automated PR preview system that deploys every pull request to a preview URL on GitHub Pages.

### How It Works

1. When a PR is created or updated, the `.github/workflows/pr-preview.yml` workflow triggers
2. The workflow:
   - Detects which app directory has changes (simple-type, housing-market-data, etc.)
   - Only builds the changed app (efficient, no wasted builds)
   - Deploys the build to the `gh-pages` branch under `_pr/<number>/`
   - Adds a `.nojekyll` file to disable Jekyll processing (which would ignore `_pr/` due to underscore prefix)
   - Posts a comment on the PR with the preview URL
3. The preview remains live until the PR is closed or merged, then gets cleaned up by `.github/workflows/pr-cleanup.yml`

### Preview URL Pattern

PR previews are available at:
```
https://sirugh.github.io/claude-experiments/_pr/<PR_NUMBER>/
```

For example, PR #10 would be at:
```
https://sirugh.github.io/claude-experiments/_pr/10/
```

Note: Each PR should only modify one app at a time. The workflow automatically detects which app changed and deploys only that app to the PR preview URL.

### Important Instructions for Claude

**After creating or updating a pull request, you MUST inform the user about the preview URL:**

1. Output a clear message with the preview URL using the pattern above
2. Explain that the preview is deployed automatically via GitHub Actions
3. Note that deployment is asynchronous and may take 1-2 minutes to complete
4. Mention which app will be deployed (based on what was changed)

**Example output after creating PR #10 for housing-market-data:**
```
Pull request created successfully!

PR Preview URL: https://sirugh.github.io/claude-experiments/_pr/10/

Note: The housing-market-data app will be deployed automatically via GitHub Actions.
It may take 1-2 minutes for the deployment to complete. If you get a 404, wait a moment and refresh.
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
4. Ensure the `_pr/<number>/` directory exists on the `gh-pages` branch
5. Verify that the workflow detected the correct app (check workflow logs for "Detected app" message)

## Repository Structure

- `/simple-type/` - React app for first graders (math and reading exercises)
- `/housing-market-data/` - Real estate property browser with maps and filtering
- `/.github/workflows/` - GitHub Actions workflows
  - `pr-preview.yml` - Detects changed app, builds and deploys PR previews
  - `pr-cleanup.yml` - Removes preview when PR closes
  - `deploy.yml` - Deploys production to GitHub Pages
- `/index.html` - Landing page for the experiments site

## Development Notes

- The main branch is `main`
- Feature branches should follow the pattern: `claude/<description>-<session-id>`
- All PRs should target the `main` branch
- GitHub Pages serves from the `gh-pages` branch
