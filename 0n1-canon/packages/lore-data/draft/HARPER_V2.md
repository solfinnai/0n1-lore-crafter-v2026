# Harper fold-in — canonVersion #2 (scaffolding)

**Status:** Not imported yet. Seed remains `worldbible-2026-02` from crafter.

## Process

1. Place Harper-locked xlsx export under `packages/lore-data/draft/harper/` (never auto-promote).
2. Run `node scripts/diff-harper.mjs` to emit machine-readable divergence vs worldbible-2026-02.
3. Owner adjudicates each row in `packages/lore-data/draft/harper/ADJUDICATION.md`.
4. Promote accepted rows with `incomplete: true` where Harper fill is partial.
5. Bump `canonVersion` to next tag; keep crafter **classification ontology** (bare-faced, background≠lineage, gemstone cosmetics).
6. Update #922 golden expectations; CI fails on silent off-Body rename mismatches via alias coverage.

## Ontology wins vs Harper values

| Concern | Winner |
|---------|--------|
| Trait semantics (Void, background, cosmetics) | Crafter / worldbible-2026-02 |
| Mechanical power fill / foundations | Harper (after goldens) |
| Unknown on-chain string | Fail CI — never silent cosmetic degrade |
