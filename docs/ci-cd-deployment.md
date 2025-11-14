## GLOWNOVA CI/CD & Deployment Runbook

This document describes the recommended CI pipelines (GitHub Actions) and deployment processes for Hostinger VPS and optional Vercel hosting.

---

## 1. CI Pipelines (GitHub Actions)

Use separate workflows for:
- Continuous integration (lint, type-check, unit/integration tests, build).
- E2E tests (optional, may run on demand or after merge).
- Deployment to Hostinger (manual or on tagged releases).

### 1.1 `ci.yml` – Main CI Workflow

**Triggers**:
- `on: [push, pull_request]` for `main` and feature branches.

**Jobs**:

1. **`setup` job**
   - Uses `actions/checkout`.
   - Uses `actions/setup-node` with LTS version.
   - Caches `node_modules` using `actions/cache` with `package-lock.json` hash.

2. **`lint-and-typecheck` job**
   - Needs: `setup`.
   - Runs:
     - `npm ci` (or `pnpm install` / `yarn install` depending on chosen tool).
     - `npm run lint` – ESLint.
     - `npm run typecheck` – TypeScript type-check (e.g., `tsc --noEmit`).

3. **`test` job**
   - Needs: `setup`.
   - Runs:
     - `npm run test:unit` – Jest unit + integration tests with MSW.
     - Optionally enforce coverage via `--coverage` and thresholds in `jest.config`.

4. **`build` job**
   - Needs: `lint-and-typecheck`, `test`.
   - Runs:
     - `npm run build` – Next.js production build.
   - Artifacts:
     - Upload `.next` build or a tarball of the project for use in deployment workflows.

### 1.2 `e2e.yml` – E2E Workflow (Optional)

**Triggers**:
- `workflow_dispatch` (manual).
- Optionally `push` to `main` or on tags.

**Jobs**:

- `e2e`:
  - Set up Node and install dependencies.
  - Build app: `npm run build`.
  - Start server:
    - `npm run start -- -p 3000` (or use `next start` with `wait-on`).
    - Use `npx wait-on http://localhost:3000`.
  - Run Playwright:
    - `npx playwright install --with-deps`.
    - `npm run test:e2e`.
  - Tear down server after tests.

### 1.3 `deploy.yml` – Hostinger Deployment Workflow

**Triggers**:
- `workflow_dispatch` with inputs (environment).
- Or `push` on tags like `v*.*.*` to deploy releases.

**Environment variables & secrets**:
- `HOSTINGER_SSH_HOST`
- `HOSTINGER_SSH_USER`
- `HOSTINGER_SSH_KEY` (private key).
- `HOSTINGER_APP_DIR` (deployment path on VPS).
- Optional: Docker registry credentials if using Docker.

**High-level steps**:

1. **Prepare build artifact**
   - Reuse `build` job or rebuild:
     - `npm ci`.
     - `npm run build`.
   - Tar project including:
     - `.next`, `package.json`, `next.config`, `public/`, `node_modules` (or re-install on server).

2. **Upload artifact**
   - Use `scp` via `appleboy/scp-action` or similar to copy artifact to VPS.

3. **SSH into Hostinger**
   - Use `appleboy/ssh-action` to:
     - Extract artifact into `$HOSTINGER_APP_DIR`.
     - Install production dependencies if not included:
       - `npm ci --only=production` or `npm ci --omit=dev`.
     - Run migrations (if any; backend-specific).
     - Restart process manager (e.g., `pm2 restart glownova-frontend` or `systemctl`).

4. **Smoke tests**
   - From CI:
     - Call `/health` endpoint on deployed host.
     - If non-200 or timeout, mark deployment as failed.

---

## 2. Hostinger VPS Deployment Runbook

### 2.1 System Requirements

- Node.js LTS installed on VPS.
- Nginx installed as reverse proxy.
- Process manager (PM2 or systemd).
- Firewall configured to allow HTTP/HTTPS.

### 2.2 Directory Layout on VPS

Recommended:

- `/var/www/glownova-frontend` – app root.
- `/var/www/glownova-frontend/current` – current release.
- `/var/www/glownova-frontend/releases` – previous releases (optional).

### 2.3 Nginx Reverse Proxy Configuration (Concept)

Example virtual host (pseudo-config, not exact file):

- Listen on `80` and `443`.
- Proxy incoming requests to Node server:
  - `proxy_pass http://127.0.0.1:3000;`
  - Set headers `X-Forwarded-For`, `X-Forwarded-Proto`.
- Configure host-based tenant support for `[salonSlug].example.com` by:
  - Using wildcard server_name: `*.glownova.example.com glownova.example.com`.
  - Forwarding `Host` header to the app.

Use Hostinger’s SSL/HTTPS tooling or Let’s Encrypt to provision certificates:
- For example, use `certbot` or Hostinger’s GUI to generate and renew certs.

### 2.4 Starting the App

Options:

1. **Direct Next.js server**
   - Start with:
     - `npm run start` (Next.js serves on configured port).
   - Manage with PM2:
     - `pm2 start npm --name "glownova-frontend" -- start`.

2. **Docker-based**
   - Build Docker image in CI or on VPS.
   - `docker-compose.yml` example (conceptual):
     - Service `frontend` using built image.
     - Expose port 3000 to Nginx reverse proxy.

### 2.5 `deploy-frontend.sh` Script (Concept)

Stored in repo (for docs) or on server:

- Steps:
  - `cd /var/www/glownova-frontend/current`
  - `git pull` or extract new artifact.
  - `npm ci --omit=dev`
  - `npm run build`
  - `pm2 restart glownova-frontend` or `systemctl restart glownova-frontend`

Ensure no secrets are committed:
- Use `.env` managed directly on server (e.g., `.env.production`).

---

## 3. Environment Variables (Frontend)

Define in `.env.example` (documentation only):

- `NEXT_PUBLIC_API_BASE_URL` – base URL of backend API; absent/empty in dev with MSW.
- `NEXT_PUBLIC_USE_MOCKS` – `"true"` to force MSW even when base URL present.
- `NEXT_PUBLIC_APP_URL` – front-end base URL (useful in E2E and deep links).

On VPS:
- Place real values in `.env.production` and ensure process manager loads them.

---

## 4. Optional Vercel Deployment

Vercel is a recommended alternative for hosting the Next.js frontend, simplifying build and deploy:

### 4.1 Setup Steps

1. Connect GitHub repository to Vercel.
2. Configure project:
   - Framework: Next.js.
   - Build command: `npm run build`.
   - Output: `.next`.
3. Environment variables:
   - Add `NEXT_PUBLIC_API_BASE_URL` (staging/production).
   - Add `NEXT_PUBLIC_USE_MOCKS` for preview environments (e.g., `"true"`).

### 4.2 Preview Deployments

- Every pull request to `main` creates a preview URL.
- E2E tests can target preview URL:
  - Configure Playwright base URL to that preview.

### 4.3 Production Promotion

- Merge to `main` → automatic deploy to production.
- Optionally:
  - Use Vercel’s “Git Integration protection” to require CI pass before deployment.

---

## 5. Deployment Checklist

Before deploying to production:

- [ ] All CI checks green (lint, typecheck, unit tests, build).
- [ ] E2E tests pass on staging or preview environment.
- [ ] Environment variables set correctly on VPS/Vercel.
- [ ] Nginx reverse proxy tests successfully forward `/` and `/admin` routes.
- [ ] Dark mode and tenant-based routing verified with sample salons.
- [ ] Monitoring and logging configured for Node process (e.g., PM2 logs, uptime checks).


