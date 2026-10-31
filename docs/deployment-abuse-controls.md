# Deployment and abuse-control runbook

## Current observed state

- FurFinder is linked to the Vercel Hobby team.
- The project lookup did not return an active Firewall configuration.
- Recent preview checks for the feature branch are blocked by Vercel's deployment-rate quota. This is a platform quota status, not an application build result.
- No Firewall rule, environment variable, deployment setting, or production deployment was changed during this development pass.

## Submission endpoint protection

The public listing submission endpoint is:

- Method: POST
- Path: /api/v1/submissions
- Existing controls: same-origin validation, strict JSON media type, bounded request body, payload validation, honeypot field, and Cloudflare Turnstile verification.

A Vercel WAF rule is a possible additional edge control. Use a staged rollout:

1. Scope the rule narrowly to POST requests for /api/v1/submissions. Do not apply a restrictive rule to all site traffic.
2. Begin with an observation/logging phase. Review legitimate traffic patterns, shared-network effects, and false positives before choosing a threshold.
3. If the observed traffic supports it, configure a fixed-window limit and a client-facing 429 response. Select the window and request count from observed use rather than guessing.
4. Review Vercel's current rate-limiting usage/pricing dialog before publishing. Rate-limiting actions may have usage-based charges.
5. Publish only after an authorized project owner reviews the exact rule. Record the rule version and rollback path.
6. Monitor after publication and roll back promptly if legitimate submissions are blocked.

Do not trust arbitrary client-supplied forwarding headers as the source of client identity. Prefer the platform's trusted WAF source-IP keying.

## Preview and release gates

- Keep pull request #15 as Draft until the latest head has green GitHub Actions checks and a fresh preview has been reviewed.
- A Vercel quota failure must not be reported as a successful preview build.
- Do not merge to main, deploy production, or publish Firewall changes without explicit authorization.
- Keep service-role/secret credentials server-side. Public clients use only publishable credentials and RLS-protected public data.

## References

- Vercel WAF rate limiting: https://vercel.com/docs/vercel-firewall/vercel-waf/rate-limiting
- Vercel WAF custom rules: https://vercel.com/docs/vercel-firewall/vercel-waf/custom-rules
- Vercel WAF usage and pricing: https://vercel.com/docs/vercel-firewall/vercel-waf/usage-and-pricing
