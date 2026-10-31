# FurFinder — Jira & Confluence Workspace Bootstrap

**Status:** provisioning blocked; no FurFinder Jira project or Confluence space has been created.

## Connected site inspection

- Atlassian site: `https://hypergaruda.atlassian.net`
- Jira project visible to the connected account: `HB` — HyperGaruda Base.
- No existing Jira project named FurFinder was returned.
- The proposed Jira key `FUR` has not been created or reserved.
- Confluence space listing and the create-space operation returned HTTP 404. The connected site appears not to have an active Confluence product, despite the resource discovery response advertising Confluence access.

## Important product distinction

The connected Atlassian tool surface exposes `createProject` for the separate Atlassian Projects product. That operation does not create a Jira Software project and must not be used as a substitute. A Jira project must be created through Jira's project administration capability or by an authorized site administrator.

## Intended Jira setup

| Setting | Proposed value |
|---|---|
| Project name | FurFinder |
| Project key | `FUR` (not reserved) |
| Project type | Jira Software, team-managed or company-managed to be decided |
| Purpose | Track engineering, product, accessibility, privacy, moderation, source verification and release work |
| Default workflow | Backlog → Selected → In Progress → In Review → Done |
| Issue types | Epic, Story, Task, Bug |
| Components | API, Web, Mobile, Data, Moderation, Accessibility, Sources, Infrastructure |

### Initial epic map

1. Public directory API and pagination.
2. Listing detail and event metadata.
3. Source provenance and review queue.
4. Privacy-first reporting and moderation.
5. Accessibility and responsive UX.
6. Flutter companion planning and read-only client.
7. Security, RLS and operational readiness.
8. Release, observability and Vercel preview validation.

### Project rules

- No issue should describe scraping private member rosters, attendee lists, private contacts or precise personal locations.
- No public profiles for minors.
- Adult individual profiles remain voluntary, adults-only and unpublished by default.
- Production database migrations require review and explicit release approval.
- PRs remain draft until CI, security and product checks pass.
- Production deployment is a separate approval from code merge.

## Intended Confluence space setup

| Setting | Proposed value |
|---|---|
| Space name | FurFinder Engineering |
| Space key | `FURF` (not created) |
| Purpose | Canonical architecture, API, product, source-governance, security, accessibility and release documentation |

### Initial page tree

- Home — project status, owners and release gates
- Product — PRD, user journeys and scope
- Architecture — system context, API contracts and data model
- API — endpoint specifications and error contracts
- Data & Security — RLS, key management, privacy and threat model
- Moderation — report workflow, review states and escalation
- Source Governance — source register, provenance and pilot evidence
- Accessibility — acceptance checklist and audit findings
- Mobile — Flutter companion PRD and parity checklist
- Operations — Vercel, Supabase, CI and incident runbooks
- Decisions — dated architecture decision records

## Unblock steps

1. An Atlassian site administrator enables or provisions Confluence for the connected site, or supplies a different Confluence-enabled site.
2. An administrator or project creator enables Jira project creation for the connected account, or creates the Jira Software project with key `FUR`.
3. Confirm actual project key, project type, space key and access roles before importing any backlog or publishing pages.
4. Re-run resource discovery and read-only list operations to verify the resources exist.
5. Create initial epics/pages only after successful provisioning and confirmation of access scope.

No credentials, tokens or account secrets should be pasted into chat.
