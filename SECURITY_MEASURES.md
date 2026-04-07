# Security Measures

This file inventories the security measures currently implemented in this repository and the operational controls expected for production use.

## 1. Authentication And Session Security

- Supabase Auth is used for user authentication with separate patient and doctor roles.
- Browser auth uses PKCE flow through the Supabase client configuration in `zebra-synapse/src/lib/supabase.ts`.
- Sessions are persisted with automatic token refresh.
- Browser sessions expire after inactivity; the timeout is configurable with `VITE_AUTH_INACTIVITY_TIMEOUT_MS`.
- Signup enforces stronger password rules:
  - minimum 12 characters
  - at least one lowercase letter
  - at least one uppercase letter
  - at least one number
  - at least one special character
- Auth redirect URLs are derived from the current origin or `VITE_SITE_URL`, reducing misrouted auth callbacks.

## 2. Authorization And Data Isolation

- Row Level Security is enabled on clinical tables in Supabase.
- Forced RLS is applied on sensitive tables so access policies cannot be bypassed accidentally:
  - `profiles`
  - `care_relationships`
  - `prescriptions`
  - `lab_report_uploads`
  - `lab_panels`
  - `care_actions`
- Access policies limit users to their own data or explicitly linked care-team data.
- Doctors can only access patient data when a valid `care_relationships` link exists.
- Patients can only access their own clinical records and uploads.

## 3. Database Integrity Controls

Implemented primarily in:

- `zebra-synapse/supabase/migrations/009_security_hardening.sql`
- `zebra-synapse/supabase/migrations/010_security_invariants.sql`

Current controls include:

- Profile normalization on insert and update:
  - trims `full_name`
  - normalizes `license_number`
  - bounds field length
- Immutable security-sensitive profile fields:
  - `id`
  - `role`
  - `created_at`
- Doctor license number changes are blocked for self-service updates and require admin review.
- Ownership and relationship invariants are validated with database triggers.
- `doctor_id` and `patient_id` are enforced as immutable where appropriate.
- `created_at` is enforced as immutable on critical records.
- Prescriptions can only be written by doctor profiles linked to the patient.
- Care actions can only be written by doctor profiles linked to the patient.
- Lab panels must belong to the same patient as the referenced upload.
- Lab uploads must reference patient profiles and remain inside the patient namespace.

## 4. Auditability

- A dedicated `security_audit_log` table records sensitive writes.
- Audit triggers capture insert, update, and delete activity on PHI-bearing tables.
- Audit records include:
  - actor id
  - operation
  - table name
  - row id
  - structured before/after payload details
- The audit log itself has RLS enabled and forced.

## 5. File Upload Security

- Lab report uploads use a private Supabase Storage bucket.
- Storage paths are constrained to the authenticated patient's namespace.
- File metadata is validated in the database before insert/update.
- Client-side upload validation blocks:
  - unsupported extensions
  - mismatched MIME types
  - empty files
  - files larger than 10 MB
- Allowed upload formats are:
  - PDF
  - JPG/JPEG
  - PNG

## 6. Frontend Data Handling

- No service-role key is used in the frontend.
- Only browser-safe variables are intended for `VITE_*` exposure:
  - `VITE_SUPABASE_URL`
  - `VITE_SUPABASE_ANON_KEY`
- Doctor license numbers are no longer editable in the profile UI.
- Clinical data writes are validated again at the database layer, so frontend tampering does not bypass the core rules.

## 7. HTTP And Browser Security Headers

Configured in:

- `vercel.json`
- `zebra-synapse/vercel.json`

Headers currently include:

- `Content-Security-Policy`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy`
- `Strict-Transport-Security`
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `Cross-Origin-Opener-Policy: same-origin`
- `Cross-Origin-Resource-Policy: same-origin`

These reduce exposure to script injection, framing, mixed-origin abuse, MIME confusion, and unnecessary browser capability access.

## 8. CI And Supply-Chain Security

Configured in:

- `.github/workflows/security.yml`

Current automated controls:

- CodeQL scanning for JavaScript/TypeScript
- Dependency Review on pull requests
- `npm audit` for production dependencies with high-severity failure threshold
- Scheduled weekly security workflow execution

## 9. Security Documentation And Process

- `SECURITY.md` defines the reporting process and production baseline.
- The repository README files document required hardening migrations and deployment expectations.
- Production guidance includes:
  - applying all migrations
  - enabling Supabase bot protection
  - enabling leaked-password detection
  - enforcing MFA for privileged users
  - restricting dashboard access with least privilege
  - rotating credentials after suspected compromise

## 10. Production Controls Expected Outside The Repo

The following are required operational controls but are not fully enforceable from source code alone:

- Supabase Auth rate limits
- Supabase CAPTCHA or bot protection
- Supabase leaked-password protection
- MFA requirements for privileged users
- strict access control to the Supabase dashboard
- secure secret storage and rotation
- HTTPS-only deployment and domain hygiene

## 11. Important Note

This file describes the measures currently implemented in the repository. The database-layer protections in `009_security_hardening.sql` and `010_security_invariants.sql` only take effect after those migrations are applied to the target Supabase project.
