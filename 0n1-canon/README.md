# 0n1-canon

Git-native lore repository. Seeded from lore-crafter `lib/lore/canon` as **`worldbible-2026-02`** (crafter-first, not Harper-first).

```bash
node scripts/validate.mjs
node scripts/codegen-crafter.mjs   # sync mechanics → ../lib/lore/canon
```

See [CANON.md](./CANON.md).

Static distribution targets:

- `packages/lore-data/mechanics/meta.json` — `canonVersion` + `soulsVersion`
- GitHub Release tags + CDN `/v1/snapshot/<version>.json` (publish later)
- `openapi/v1.yaml`
