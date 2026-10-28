# Expertiza Frontend

This repository contains the React and TypeScript frontend for Expertiza. The application uses
[Vite](https://vite.dev/) for local development and production builds, [Vitest](https://vitest.dev/)
for testing, and Node.js for the development and CI environments.

## Prerequisites

- [Node Version Manager (nvm)](https://github.com/nvm-sh/nvm)
- Docker, if you want to build or run the production container locally
- The Expertiza backend running on `http://localhost:3002` for features that make API requests

The required Node.js version is declared in `.nvmrc` and `package.json`.

## Initial setup

From the repository root, install and select the required Node.js version:

```bash
nvm install
nvm use
```

Install the exact dependency versions recorded in `package-lock.json`:

```bash
npm ci
```

Use `npm ci` instead of `npm install` for a clean, reproducible installation. It is also the
installation command used by the Docker image and GitHub Actions workflow.

## Run the application locally

Start the Vite development server:

```bash
npm run dev
```

Vite prints the local application URL in the terminal. Its default URL is
`http://localhost:5173`.

## Available commands

| Command                | Purpose                                                                         |
| ---------------------- | ------------------------------------------------------------------------------- |
| `npm run dev`          | Start the Vite development server with live reloading.                          |
| `npm run build`        | Create an optimized production build in `dist/`.                                |
| `npm run preview`      | Serve the existing `dist/` build locally for inspection.                        |
| `npm test`             | Run Vitest in interactive watch mode.                                           |
| `npm run test:ci`      | Run the test suite once, collect coverage, and create `coverage/`.              |
| `npm run lint`         | Check JavaScript and TypeScript files with ESLint.                              |
| `npm run format:check` | Check whether files follow the configured Prettier style without changing them. |
| `npm run format`       | Rewrite supported files using the configured Prettier style.                    |
| `npm run typecheck`    | Check TypeScript types without generating JavaScript files.                     |

Most validation commands only report problems. `npm run format` is the command in this table that
rewrites source files. The build and coverage commands create generated output in `dist/` and
`coverage/`; both directories are excluded from Git.

## Run the same validation used by CI

Before submitting a pull request, run:

```bash
npm ci
npm run test:ci
npm run lint
npm run format:check
npm run typecheck
npm run build
```

These checks are intentionally separate. A formatting, lint, or type-checking failure does not
necessarily mean that the tests or production build will also fail.

The relevant configuration files are:

- ESLint rules: `eslint.config.mjs`
- Prettier rules: `.prettierrc.yml`
- TypeScript compiler options: `tsconfig.json`
- Vitest configuration: `vitest.config.mts`
- Vite configuration: `vite.config.ts`
- GitHub Actions workflow: `.github/workflows/ci.yml`

## Test coverage

Generate the coverage report with:

```bash
npm run test:ci
```

Open `coverage/index.html` in a browser to view coverage by directory, file, and source line. The
`coverage/` directory is generated locally and is not committed.

GitHub Actions uploads the same directory as an artifact named `frontend-coverage`. The artifact is
available from the workflow run for seven days, including when the test job fails after producing a
report.

## Production build

Create an optimized build:

```bash
npm run build
```

The generated files are written to `dist/`. To inspect that build locally:

```bash
npm run preview
```

## Docker

The Dockerfile uses a multi-stage build. Node.js and `npm ci` create the Vite production assets,
and Nginx serves those assets with single-page-application routing support.

Build the image:

```bash
docker build --tag expertiza-frontend:local .
```

Run it on port 8080:

```bash
docker run --detach --rm \
  --name expertiza-frontend-local \
  --publish 8080:80 \
  expertiza-frontend:local
```

Open `http://localhost:8080`, or verify the server from the terminal:

```bash
curl -I http://localhost:8080
```

Stop the container:

```bash
docker stop expertiza-frontend-local
```

If port 8080 is already in use, publish another local port, such as `--publish 8081:80`, and open
`http://localhost:8081` instead.

You can also build and run the service defined in `docker-compose.yml`:

```bash
docker compose up --build
```

### Published container image

The `Publish frontend container image` GitHub Actions workflow builds the existing `Dockerfile` and
publishes the resulting image to GitHub Container Registry after a push to `main`. Versioned releases
are prepared on short-lived `release/<version>` branches, and `package.json` is the source of truth
for the release version.

The published image name is:

```text
ghcr.io/expertiza/reimplementation-front-end
```

#### Images published from `main`

Whenever a commit reaches `main`, including through a merged pull request, the workflow builds and
publishes the frontend image. The image receives both the moving `latest` tag and a `sha-` tag made
from the short Git commit SHA (the merge or squash-merge commit when applicable). Both tags identify
the image produced by that workflow run. For example:

```text
ghcr.io/expertiza/reimplementation-front-end:latest
ghcr.io/expertiza/reimplementation-front-end:sha-1a2b3c4
```

The next successful `main` build moves `latest` to the newly built image, while the earlier
commit-SHA tag remains available so that a specific build can be pulled again. Pull requests only
validate that the Docker image builds; they do not publish it.

#### Creating a versioned release

Only a maintainer with permission to prepare a release should perform these steps. A short-lived
release branch may collect approved feature changes before the release, or it may be created after
those features have already reached `main`. The release branch name is an organizational convention;
the workflow treats the version change in `package.json` as the release signal.

Begin with the latest `main` and create the release branch. After all intended feature changes are
present and validated on that branch, update the version in both `package.json` and
`package-lock.json` without creating a local Git tag:

```bash
git switch main
git pull --ff-only origin main
git switch -c release/0.2.0
npm version 0.2.0 --no-git-tag-version
git add package.json package-lock.json
git commit -m "chore: prepare frontend release 0.2.0"
git push --set-upstream origin release/0.2.0
```

If the official repository is configured as a remote other than `origin`, use that remote name in
the pull command. Open a pull request from `release/0.2.0` into `main` and complete the normal review
and validation process. The release branch itself does not publish an image.

When the release branch is merged, the push to `main` triggers the publishing workflow. If the
version in `package.json` differs from the version before the merge, the workflow validates it,
publishes the usual `latest` and commit-SHA tags, and also publishes a version tag derived from
`package.json`:

```text
ghcr.io/expertiza/reimplementation-front-end:v0.2.0
```

Stable versions such as `0.2.0` create regular GitHub Releases. Prerelease versions such as
`0.2.0-rc.1` create GitHub prereleases. SemVer build metadata suffixes such as `+build.1` are not
supported because container registries normalize those characters and can produce ambiguous image
tags.

The workflow also creates the matching `v0.2.0` Git tag and GitHub Release with generated release
notes. It fails rather than moving a version tag that already points to a different commit. After a
successful release, delete the short-lived release branch. Normal `main` merges that do not change
the package version continue to publish only `latest` and the commit-SHA tag. Both squash merges and
regular merge commits are supported, provided the resulting `main` commit contains the new package
version.

Pull and run the latest image with:

```bash
docker pull ghcr.io/expertiza/reimplementation-front-end:latest
docker run --detach --rm \
  --name expertiza-frontend \
  --publish 8080:80 \
  ghcr.io/expertiza/reimplementation-front-end:latest
```

Package visibility is managed in the GitHub Container Registry settings. Authentication with an
account that can read the package is required when the image is private.

## GitHub Actions

The frontend workflow runs for pull requests and pushes to `main`. It contains six independent
jobs:

1. Frontend tests with coverage
2. ESLint
3. Prettier formatting check
4. TypeScript type check
5. Vite production build
6. Docker image build

Each job uses a clean Ubuntu runner and has its own timeout. The jobs run independently so that a
failure in one check does not prevent the remaining checks from reporting their results.

Container publishing is handled separately by `.github/workflows/publish-image.yml`. It uses the
temporary `GITHUB_TOKEN` supplied by GitHub Actions with `packages: write` permission to publish the
image and `contents: write` permission to create version tags and GitHub Releases. No long-lived
registry password is stored in the repository. Pull requests continue to build the Docker image for
validation but do not publish it.
