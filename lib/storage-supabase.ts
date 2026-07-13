/**
 * @deprecated DELETE in Phase 2 — incompatible with storage-hybrid rewrite.
 * Do not import. Kept only so historical greps find the landmine.
 * See docs/DEVELOPER_HANDOFF.md Phase 2 and lib/storage-hybrid.ts.
 */
export function deprecatedStorageSupabase(): never {
  throw new Error("lib/storage-supabase.ts is retired — use storage-hybrid via storage-wrapper")
}
