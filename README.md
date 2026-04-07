# Zebra Synapse Repository

This repository is structured for hackathon submission requirements.

## Submission Folder

The complete project is contained in [`zebra-synapse`](./zebra-synapse).

That folder includes:

- the runnable application source
- the hackathon submission `README.md`
- `architecture.md` with system design details
- `demo.md` with the walkthrough and judging flow

## Repository Layout

- `.github/`: CI workflow configuration
- `zebra-synapse/`: final submission package
- `tooling-requirements.md`: environment prerequisites summary

## Start Here

Open [`zebra-synapse/README.md`](./zebra-synapse/README.md) for the full project overview, setup steps, and submission details.

## Deployment

Deploy this project on Vercel with the project root set to [`zebra-synapse`](./zebra-synapse).

- Root Directory: `zebra-synapse`
- Framework Preset: `Vite`
- Install Command: `npm ci` or leave it blank
- Build Command: `npm run build` or leave it blank
- Output Directory: `dist`

Required environment variables for the deployed frontend:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

Optional environment variable:

- `VITE_SITE_URL`
- `VITE_AUTH_INACTIVITY_TIMEOUT_MS`

If `VITE_SITE_URL` is omitted, the app uses the browser origin for auth redirects.

## Security Baseline

Apply [`zebra-synapse/supabase/migrations/009_security_hardening.sql`](./zebra-synapse/supabase/migrations/009_security_hardening.sql) and [`zebra-synapse/supabase/migrations/010_security_invariants.sql`](./zebra-synapse/supabase/migrations/010_security_invariants.sql) after the existing Supabase migrations. They add forced RLS, immutable ownership checks, relationship validation, upload path controls, and write audit logging. Keep the Vercel security headers in the checked-in `vercel.json` files, and enable Supabase Auth rate limits, bot protection, leaked-password detection, and MFA in the Supabase dashboard for production. Repository-level scanning is defined in [`.github/workflows/security.yml`](./.github/workflows/security.yml).
