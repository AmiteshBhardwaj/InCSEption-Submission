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
- `VITE_SITE_URL`

`VITE_SITE_URL` must match the final public origin of the deployed app so Supabase email confirmation and magic-link redirects resolve correctly.
