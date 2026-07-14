---
name: branch-commit-verify-merge
description: Guides branching, verification, committing with conventional commits, merging, and pushing to main. Use when starting a feature or bug fix to isolate changes on a branch, verify correctness, commit clean history, merge safely, and publish.
---

# Branch, Commit, Verify, Merge, and Push Workflow

This skill outlines the disciplined git workflow to isolate changes on their own feature branch, verify that they compile and work correctly, commit using Conventional Commits guidelines, and finally merge and push them back to the `main` branch.

## Core Workflow

### 1. Isolate Work on a Branch
Never write code directly to `main` when working on a new feature or fix.
- Create and check out a descriptive branch named after the concern:
  ```bash
  git checkout -b feature/backend-and-ui-redesign
  ```
- Types of branch prefixes:
  - `feature/` or `feat/` for new functionality.
  - `fix/` for bug resolution.
  - `refactor/` for non-functional structure improvements.
  - `chore/` or `docs/` for maintenance or documentation.

### 2. Verify Your Changes
Before committing, always ensure that your code is functional, passes linting, and compiles:
- Run TypeScript compiler checks:
  ```bash
  npx tsc --noEmit
  ```
- Run tests:
  ```bash
  npm test
  ```
- Run linting:
  ```bash
  npm run lint
  ```

### 3. Stage and Commit (Conventional Commits)
Stage only the relevant files and commit them using conventional format:
```bash
git add src/
git commit -m "feat: integrate Supabase client and local API routes"
```

#### Conventional Commit Messages Format
```
<type>(<scope>): <subject>

<body>
```
Common Types:
- `feat`: A new feature for the user
- `fix`: A bug fix for the user
- `docs`: Changes to the documentation
- `style`: Formatting, missing semi colons, etc; no production code change
- `refactor`: Refactoring production code, eg. renaming a variable
- `test`: Adding missing tests, refactoring tests; no production code change
- `chore`: Updating grunt tasks etc; no production code change

### 4. Merge to Main
Once all changes are verified and committed on the feature branch:
1. Switch back to the main branch:
   ```bash
   git checkout main
   ```
2. Pull the latest remote updates:
   ```bash
   git pull origin main
   ```
3. Merge your feature branch:
   ```bash
   git merge feature/backend-and-ui-redesign
   ```

### 5. Push to Remote
Push the merged commits to your remote repository:
```bash
git push origin main
```
Clean up the local feature branch if it is no longer needed:
```bash
git branch -d feature/backend-and-ui-redesign
```
