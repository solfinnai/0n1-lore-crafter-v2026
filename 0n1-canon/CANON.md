# 0N1 Canon — Governance

**Authority:** Sole canon czar is the repository owner. Mechanical changes require CODEOWNERS approval.

## Conflict hierarchy

1. **Mechanics:** Published `canonVersion` snapshots win. Seed `worldbible-2026-02` is the crafter-shipped ontology (classifyTraits semantics). Harper values fold in as **canonVersion #2** after golden tests + per-divergence adjudication.
2. **Narrative:** Universe Report / `world.ts` Enclave canon wins over retired Neo-Tokyo packs.
3. **Consumers:** Resolve output wins over app hardcodes.
4. **Drafts:** `draft/` never served until promote PR.

## Two pipes (never mixed)

| Pipe | Contents | Version bump |
|------|----------|--------------|
| Mechanics | Traits, powers, paths, type gates | `canonVersion` (rare; games pin this) |
| Souls UGC | Signed `0n1.soul-canon-submission` envelopes | `soulsVersion` (per accepted character) |

Review status lives **outside** the signed envelope (`submissions/inbox/` → `souls/<tokenId>/current.json`).

## Invariants

- Resolve-before-generate.
- Classification ontology (bare-faced Void, background≠lineage, gemstone cosmetics) must not be discarded when Harper folds in.
- IDs never reused; deprecations use `supersedes` / `deprecatedBy`.
- Offline consumers embed snapshots; HTTP `/v1/meta` + `/v1/snapshot/<version>.json` for online.

## Seed order (locked)

1. This snapshot: `worldbible-2026-02` from lore-crafter `lib/lore/canon/*`
2. Harper import as next `canonVersion` with machine-readable diff
