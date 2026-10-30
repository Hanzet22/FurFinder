# XML directory import contract

Version 1 is a transport format for trusted import tooling. The XSD defines the
allowed fields, category and region values, slug format, summary length, and
HTTPS URL requirement.

Important boundaries:

- An imported listing must enter the moderation queue as `pending`; XML cannot
  set publication status, featured status, verification timestamps, or database IDs.
- The importer must validate against `listing-v1.xsd`, normalize text, reject
  duplicate slugs, and re-check URLs before writing.
- Never let browser clients import directly into `public.listings`.
- This is a schema contract only. The production importer and Node API are not
  implemented yet.
