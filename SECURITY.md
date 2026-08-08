# Security Policy

MotivaMate is a small, community-maintained study-companion PWA. There is no
dedicated security team and no bug bounty program, but security reports are
taken seriously and are welcome.

## Reporting a Vulnerability

**Please do not report security issues through public GitHub issues, discussions,
or pull requests.**

Instead, open a private security advisory on this repository:

1. Go to the repository's **Security** tab.
2. Choose **Report a vulnerability** (GitHub Private Vulnerability Reporting).
3. Fill in the details described below.

The advisory is visible only to you and the repository maintainers until a fix is
published. If Private Vulnerability Reporting is not enabled on the repository,
please open a public issue that says only "security report, please enable private
reporting" and contains **no** technical detail, and wait to be contacted.

Please include as much of the following as you can:

- The type of issue (for example XSS, auth bypass, exposed credentials, a Row
  Level Security policy that lets one user reach another's rows).
- The affected file(s) and the branch or commit you tested.
- Step-by-step instructions to reproduce, and a proof of concept if you have one.
- What an attacker could actually achieve, and any preconditions required.

## Response Expectations

This is a volunteer-maintained project, so timelines are best-effort:

- **Acknowledgement:** within 7 days.
- **Initial assessment (confirmed / not reproducible / out of scope):** within 14 days.
- **Fix or documented mitigation for confirmed issues:** target 30 days, sooner for
  anything allowing account takeover or access to another user's data.

You will be credited in the advisory unless you ask not to be.

## Scope

In scope:

- The application source in this repository (`src/`, `public/sw.js`, `index.html`).
- The Supabase schema, migrations, and Row Level Security policies
  (`supabase/migrations/`), which are what actually enforce data isolation.
- Build and deployment configuration in this repository (`wrangler.toml`,
  `vite.config.ts`, `public/_headers`, and `public/_redirects`). The build runs
  on Cloudflare Pages from a Git connection; there is no CI workflow in this
  repository.
- Authentication and data-isolation flaws, such as one user being able to read or
  modify another user's study data.
- Secrets or credentials committed to the repository.
- Cross-site scripting, CSP bypasses, and service-worker abuse in the deployed app.

Out of scope:

- Vulnerabilities in third-party services the app depends on (Supabase,
  Cloudflare Pages). Report those to the relevant vendor.
- Findings that require a compromised device, a malicious browser extension, or
  physical access to an unlocked device.
- Missing hardening headers or automated-scanner output with no demonstrated
  impact. A concrete exploitation path is what makes a report actionable.
- Denial of service, rate-limiting, and volumetric attacks.
- Social engineering of users or maintainers.
- Self-XSS that a victim can only trigger by pasting attacker-supplied code into
  their own console.

## Supported Versions

Only the latest deployed version, built from the default branch, receives security
fixes. There are no long-term support branches.

## Data Handling Note

The app stores study sessions, tasks, and profile data in Supabase on behalf of the
signed-in user. If a report involves real user data, please stop as soon as you have
confirmed the issue, do not download or retain any data that is not your own, and say
so in the advisory.
