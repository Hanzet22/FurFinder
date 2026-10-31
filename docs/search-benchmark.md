# FurFinder public directory search benchmark

Status: benchmark harness and workload design only. No benchmark has been run against Supabase or production.

## Safe fixture generation

Generate deterministic synthetic records locally:

```bash
node scripts/directory-benchmark-fixtures.mjs --count 10000 --seed 20261031 > /tmp/furfinder-benchmark.json
```

The generator is bounded to 1–100,000 records. It uses synthetic names, null country codes and `example.org` URLs. It does not connect to Supabase or write data. Never load fixtures into production.

## Workload matrix

Run only against a disposable local database or an explicitly approved isolated staging project after preparing the matching schema and fixture load separately.

| Workload | Query shape | Measure |
|---|---|---|
| Recent published page | `status = published ORDER BY created_at DESC, id ASC LIMIT 21` | p50/p95 latency, buffers |
| Category filter | published + one category + stable order | p50/p95, rows scanned |
| Region filter | published + one region + stable order | p50/p95, rows scanned |
| Text search | published + bounded normalized search term | p50/p95, plan stability |
| Cursor continuation | published + keyset predicate on created_at/id | p50/p95, duplicate/missing rows |
| Combined filters | published + category + region + search + cursor | p50/p95, buffers |

Use `EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON)` for each prepared query. Record database version, compute tier, dataset size, fixture seed, warm/cold-cache state and at least 30 repetitions. Report median and p95; do not compare measurements from different environments as if they were equivalent.

## Release and data boundary

- Synthetic fixtures only; no real people, attendees, private group membership or contact data.
- No production inserts, DDL, extensions, indexes or migration changes.
- Index changes are proposals until reviewed against actual workload and Supabase advisors.
- A benchmark result is not a production performance guarantee.
