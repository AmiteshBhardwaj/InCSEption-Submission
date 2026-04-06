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
- `requirements.txt`: environment prerequisites summary

## Start Here

Open [`zebra-synapse/README.md`](./zebra-synapse/README.md) for the full project overview, setup steps, and submission details.

## Deployment

This repository is deployable from the repository root on Vercel.

- Root deploy config: [`vercel.json`](./vercel.json)
- Application source: [`zebra-synapse`](./zebra-synapse)
- Production build output: `zebra-synapse/dist`

Required environment variables for the deployed frontend:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_SITE_URL`

`VITE_SITE_URL` must match the final public origin of the deployed app so Supabase email confirmation and magic-link redirects resolve correctly.
