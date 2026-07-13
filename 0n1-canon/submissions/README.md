# Soul submission write loop

1. Exporter downloads signed `0n1.soul-canon-submission` JSON from lore-crafter.
2. Contributor opens PR adding the file under `submissions/inbox/`.
3. CI runs `node scripts/verify-submissions.mjs` (+ future ethers verify).
4. Canon czar reviews; on accept:
   - Move to `souls/<tokenId>/current.json`
   - Bump **`soulsVersion` only** in `packages/lore-data/mechanics/meta.json`
   - Never bump `canonVersion` for a soul acceptance
5. Apps poll `/v1/meta` with ETag / watch GitHub Releases.

Review status is **not** stored inside the signed envelope.
