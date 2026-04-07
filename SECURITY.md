# Security Policy

## Supported Scope

This repository contains the Zebra Synapse frontend, Supabase schema migrations, and deployment configuration. Security-sensitive areas include:

- Supabase Auth, row-level security, and SQL migrations
- Clinical data stored in Postgres and Supabase Storage
- Vercel deployment configuration and browser security headers
- CI workflows and dependency supply chain

## Reporting

Do not open public issues for vulnerabilities that could expose patient or clinician data.

Report findings privately to the maintainers through your normal secure team channel before any disclosure. Include:

- affected file or feature
- impact and attack preconditions
- proof of concept or reproduction steps
- suggested remediation if available

## Production Baseline

Before production use, verify all of the following:

1. Apply every migration in `zebra-synapse/supabase/migrations/`, including `009_security_hardening.sql` and `010_security_invariants.sql`.
2. Enable Supabase leaked-password protection, bot protection, email rate limits, and MFA requirements for privileged users.
3. Restrict Supabase dashboard access with least privilege and remove unused service-role keys.
4. Keep the Vercel security headers enabled and serve the app only over HTTPS.
5. Review GitHub code scanning and dependency-review alerts on every PR.
6. Rotate credentials immediately after any suspected compromise.

## Data Handling

- Do not place secrets in browser-exposed `VITE_*` variables other than the Supabase URL and anon key.
- Treat uploaded lab reports and structured biomarkers as sensitive health information.
- Prefer immutable clinical records and audited mutations over silent overwrites.
