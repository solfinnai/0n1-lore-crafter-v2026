# 0N1 Lore Crafter — Developer Handoff

**Last updated:** 2026-07-12 · **Branch:** `v1.4-plus-security` · **Live:** https://0n1-lore-crafter-v2026-six.vercel.app

This document is the complete orientation for a developer taking over or joining this codebase: what the product is, how it's architected, why it's architected that way, exactly where the roadmap stands, and what to build next. Decisions recorded here were made deliberately (several through multi-reviewer design debates); read the *why* before reversing any of them.

---

## 1. What this app is

The **0N1 Lore Crafter** lets holders of [0N1 Force](https://opensea.io/collection/0n1-force) NFTs (7,777 cyberpunk-anime characters on Ethereum, contract `0x3bf2922f4520a8ba0c2efc3d2a1539678dad5e9d`) turn their NFT into a fully-realized character:

1. **Connect a wallet** (or use the walletless **sample mode** with pinned token #922) and pick an owned 0N1.
2. **Craft a "soul"** through a 13-step wizard — archetype, backstory, hopes/fears, personality, motivations, relationships, world position, voice, symbolism, powers — with AI-generated suggestions at every step, grounded in collection canon.
3. **Chat with the finished character** as a persistent AI agent with memory, personality settings, and chat archives.
4. **Export** the soul as a cryptographically **signed Canon Submission** (JSON) plus a readable Markdown character sheet — the ingestion format for a future community "canon engine."

The end-state product vision (owner's words): *sign in and create a profile, connect wallet, read NFTs, create souls, chat with and edit them, and submit them into an official canon engine.* Roughly 60% of that exists today (§6).

### The canon constraint (the product's soul)

Everything the AI writes must respect **collection canon**: each on-chain trait has defined meaning. Body type = power lineage (Citrine = elemental control, Azurite = emotion manipulation, …); the Type trait = power tier (Y0K-A1 masters fewer paths than B4K3M0-N0); `Face: Void` means *bare-faced, no mask*; the artwork's Background color grants a passive resonance and is **not** a bloodline; gemstone words in cosmetic traits ("Fedora (Obsidian)") are colors, not lineages. Getting this wrong is the #1 historical bug class (real tester complaints: an invented "Void mask", "citrine resonance" confusion) and the reason the canon layer (§3.4) is the most load-bearing code in the repo.

---

## 2. Operating context (read before touching anything)

- **Solo-dev, hobby-scale, phone-first testers.** Testers use iPhones. Every UI decision assumes ~390px viewports.
- **The backend has died before.** OpenAI and Supabase integrations are dead; the old OpenSea API key is expired. The app survived because **localStorage is the source of truth** — this is a design principle, not an accident.
- **Secrets are burned into local git history.** The local repo's full history contains a real (now dead) Supabase service key in `SUPABASE_ENV_TEMPLATE.md`. Therefore:
  - **NEVER push the local branch history anywhere public.**
  - Publishing is done by `./publish.sh "message"`, which snapshots the current tree onto the clean `v2026-release` branch and pushes it as `main` to `solfinnai/0n1-lore-crafter-v2026` → Vercel auto-deploys.
  - Any Supabase revival must be a **new project** with env-only secrets.
- **Package manager:** the repo has `pnpm-lock.yaml` and **Vercel installs with a frozen lockfile**, but pnpm is not installed globally on the dev machine. Add/remove dependencies with `npx -y pnpm@9 add …` — plain `npm install` will desync the lockfile and **break the deploy**.
- **TypeScript errors don't gate builds** (`next.config.mjs` sets `ignoreBuildErrors: true`). ~13 pre-existing errors live in shadcn scaffolding (`components/ui/chart.tsx`, `calendar.tsx`, `resizable.tsx`, `soul-editor.tsx`, `lib/memory-enhanced.ts`, `lib/auth.ts`). Don't add new ones; run `npx tsc --noEmit` and diff against this baseline.

---

## 3. Architecture

**Stack:** Next.js 15.5.20 (App Router) · React 19 · TypeScript · Tailwind + shadcn/radix · ethers v6 · deployed on Vercel. No database. No server-side user state that matters.

### 3.1 Data layer — localStorage-first

All user-created content lives in the browser:

| Key | Contents | Module |
|---|---|---|
| `oni-souls` | `StoredSoul[]` — the souls (full `CharacterData` verbatim) | `lib/storage.ts` |
| `ai_agent_memories`, `ai_agent_conversations` | chat memory per nftId | `lib/memory.ts` |
| `oni-memory-profiles` | `CharacterMemoryProfile` per character | `lib/memory-types.ts` |
| `oni-chat-archives`, `oni-user-metrics`, `oni-character-insights` | archived chat sessions + metrics | `lib/chat-archive.ts` |
| `chat-settings-*`, `memory-segments-*`, `privacy-settings-*` | per-character settings | agent pages |
| `oni-canon-exports` | last canon submissionId per token (supersedes chain) | `lib/canon-submission.ts` |
| `walletAddress` | session identity (deliberately excluded from backups) | wallet provider |

**The seam that matters:** 19 files import soul storage via `lib/storage-wrapper.ts`, which re-exports `lib/storage-hybrid.ts`. The hybrid layer currently degrades to pure localStorage (Supabase client is `null`). When cloud sync is built (Phase 2), the wrapper seam is where it plugs in — consumers never change.

**Landmines:** `lib/storage-hybrid.ts`'s dormant Supabase sync has four confirmed bugs (UUID/text id mismatch, device-dependent ids breaking merge, deleted-soul resurrection, sync queue lost on tab close) and a 2024-era column mapping that would **silently strip newer CharacterData fields**. It must be **rewritten, not revived** (design in §7 Phase 2). `lib/storage-supabase.ts` is a second, incompatible dormant implementation — delete it during Phase 2. The one thing to preserve: `isSupabaseAvailable()` refuses to sync the demo wallet (prevents thousands of sample visitors upserting under one shared address).

### 3.2 AI layer — split providers

| Concern | Provider / model | Entry route |
|---|---|---|
| Creation suggestions (wizard steps) | Anthropic `claude-opus-4-8` | `POST /api/ai-assistant` |
| Character chat (agent + creation chat) | OpenRouter `meta-llama/llama-3.3-70b-instruct` (personality-true) | `POST /api/ai-chat` |
| Character summary | Claude | `POST /api/generate-summary` |

Clients: `lib/ai/claude.ts`, `lib/ai/llama.ts` (null-client guards, typed error branches, graceful fallback to preset suggestions when keys are missing).

**Prompt assembly** (`lib/ai/prompt-engineering.ts` → `generateEnhancedSystemPrompt`): character context with **canon-classified traits** (`generateTraitContext` — power-bearing / meta / appearance-only with explicit guardrails: "Face: Void = bare-faced, never mention a mask"; "gemstone color words are colors, NOT lineages"), the exact canonical power kit (`generatePowerKitContext`, concise on non-power steps but always keeping the lineage-disambiguation canon notes), world/districts canon for backstory steps, and lore documents. `app/agent/[id]` chat uses `lib/context-aware-prompt.ts` (a partially parallel builder — dedup candidate).

**Anti-hallucination UX:** the AI suggestions card renders a deterministic attribution footer ("Grounded in: Citrine body (elemental control) · Y0K-A1 tier · Citrine backdrop (passive buff)") computed from the classifier — never by the model — linking to the trait panel.

**Rate limiting** (`lib/rate-limit.ts`): per-IP per-minute (60 chat/min), per-wallet daily caps (100 msgs / 20 summaries / 200k tokens), and a **per-IP daily allowance of 30 AI calls for sample sessions**. All counters are **in-memory Maps that reset on serverless cold starts** — soft protection, not a billing wall. The shared demo wallet is deliberately excluded from per-wallet caps (it would pool all sample users into one bucket).

### 3.3 Trait → canon layer (single source of truth)

`lib/lore/canon/` is the product's rulebook, written as data + pure functions:

- `body-types.ts`, `face-masks.ts`, `accessories.ts`, `meta-traits.ts`, `world.ts`, `selection-rules.ts` — canon data (10 body lineages with development paths, mask/accessory powers, tier rules, districts).
- `match.ts` — **`classifyTraits()`**: the one classifier every consumer uses (AI prompts, the trait panel UI, canon validation). Buckets every trait into power / meta / cosmetic with typed kinds (`bare-faced`, `unknown-body`, …). `getCharacterPowerKit()` and `generateTraitContext()` are built on it. **Never add a second trait-classification switch** — two of them drifted once already.
- `selection-rules.ts` — `getPathSelectionRules(bodyTypeString, tier)` and `validateChosenPaths(bodyTypeObject, tier, chosen)` (note the different first-arg types). Tier strings on-chain are `Y0K-A1`, `B4K3M0-N0`, `0N1`, `K4M-1`; missing tier defaults to strictest.
- UI: `components/nft-traits-sidebar.tsx` — the "what do my traits mean" panel (bottom sheet on mobile / side sheet on desktop), fed the same traits the AI sees (props, with fetch only as fallback — never let it show mock data under a "verify" banner).

**Data-shape gotcha:** `powersAbilities.powers` is `[corePowerName, ...chosenPathNames]` *today*, but legacy souls contain power names from older app eras ("Terramancer", "Energy Synchronization"). Any code consuming it must **filter to known kit names**, never subtract-and-assume.

### 3.4 Identity, ownership, sample mode

- **Wallet connect** (`components/wallet/wallet-provider.tsx`): plain `eth_requestAccounts`, address in localStorage. **No signature, self-asserted** — fine for the current threat model (worst case: someone views souls for NFTs they don't own).
- **Custom SIWE-lite auth** (`lib/auth.ts`, `lib/session.ts`, `app/api/auth/*`, `hooks/use-simple-auth.ts`): ~90% built server-side, **0% wired into the UI, and broken-by-architecture on Vercel** (challenges/sessions in module-level in-memory Maps that don't survive serverless instances). `withOptionalAuth` falls back to trusting the `?address=` query param. **Verdict from the architecture review: delete this stack in Phase 2**; keep only the challenge-message + `ethers.verifyMessage` pattern for wallet-link proofs.
- **Ownership** (`app/api/verify-ownership`, `app/api/opensea/owned`): checks OpenSea's current-owner API. The OpenSea key status is flaky/expired — trait fetches fall back to `lib/api.ts` mock data (fake traits; the sample token bypasses this via pinned data).
- **Sample mode** (production-safe, shipped): `NEXT_PUBLIC_ENABLE_SAMPLE_MODE=true` unlocks *only* the demo wallet (`0x1111…1111`) owning *only* token #922, whose real traits and image are **pinned in-repo** (`lib/sample-token.ts`, `public/sample/0n1-922.png`) so it never depends on OpenSea. Full app works walletless: wizard, AI, chat, export (unsigned). Dev mode (`NODE_ENV=development && AUTH_DEV_MODE=true`) is structurally impossible in production — that's intentional; don't "fix" it.

### 3.5 Canon Submission export (the future canon engine's API)

`lib/canon-submission.ts` + `components/canon-export-dialog.tsx` (used by the wizard's final step and the souls library):

- **Envelope** (`0n1.soul-canon-submission` v1.0.0): `subject` (chain/contract/tokenId/traitsHash) + `soul` (CharacterData verbatim) + advisory `canonValidation` report + `provenance` (EIP-191 signature) + `supersedes` (revision chain).
- **`contentHash`** = SHA-256 of a canonical serialization of `{subject, soul}` only, so annotations never invalidate signatures; `submissionId` = contentHash (deterministic dedup).
- **Canonical JSON rules** (`stableStringify`) are a format contract — sorted keys, string-concatenation serialization (a rebuilt-object canonicalizer is `__proto__`-forgeable), `undefined` dropped in objects / `null` in arrays, throws on non-finite numbers, native `JSON.stringify` escaping, **no unicode normalization anywhere**. The same function runs at export and verify.
- **Signed message** embeds schema, token, Content-Hash, Wallet, Signed-At, Supersedes, Validation status — and `verifySubmission()` *reconstructs* it from envelope fields (never regex-parses it). Smart-contract wallets (EIP-1271) are refused at signing with a clear message; EIP-7702-delegated EOAs (code prefix `0xef0100`) are allowed.
- **Validation policy:** hard-block only objective violations (missing name/archetype/background, malformed traits, path-count breaks when the tier is known). Legacy power names, prose heuristics (mask-on-bare-faced, foreign-lineage words) are **acknowledge-and-proceed warnings** recorded in the file. Never regex-block creative prose.
- **Markdown export** is a presentation companion generated from the same envelope (footer carries submissionId + provenance); the JSON is the official record.
- Transport is deliberately *file-based* for now (Discord/form submission); a future engine bulk-ingests and re-verifies every file ever exported. Never put transport state (review status, queue) inside the signed envelope.

### 3.6 Backup / restore

`lib/backup.ts` + `components/backup-controls.tsx` (souls page header): one-file export of every content key above; import is **additive and non-destructive** (souls merge per-NFT newest-`lastUpdated`-wins; everything else fills only empty keys; unknown keys in the file are rejected). This is device migration *and* the standing escape hatch for future sync bugs.

---

## 4. Environment & operations

**Env vars** (`.env.local` locally; Vercel dashboard for prod):

| Var | Status | Notes |
|---|---|---|
| `ANTHROPIC_API_KEY` | live | creation AI |
| `OPENROUTER_API_KEY` (or `LLAMA_API_KEY`, `LLAMA_BASE_URL`, `LLAMA_MODEL`) | live | character chat |
| `OPENSEA_API_KEY` | expired/flaky | ownership + trait fetches degrade to fallbacks |
| `NEXT_PUBLIC_ENABLE_SAMPLE_MODE` | `true` | production sample mode (build-time inlined — set in Vercel, redeploy) |
| `NEXT_PUBLIC_DEV_MODE`, `AUTH_DEV_MODE` | local only | never set in prod |
| `JWT_SECRET`, `JWT_REFRESH_SECRET`, etc. | dead stack | falls back to a hardcoded dev secret (`lib/auth.ts:29`) — goes away when the stack is deleted |
| `SUPABASE_*` | placeholders | client is null; Phase 2 uses a NEW project |

**Workflows:**

```bash
npx pnpm@9 install            # deps (never plain npm install)
npm run dev                   # dev server (or .claude/launch.json: "dev"/"prod")
npm run lint                  # eslint 9 flat config (0 errors, 8 legacy warnings)
npx tsc --noEmit              # ~13 pre-existing errors in shadcn scaffolding = baseline
NEXT_PUBLIC_DEV_MODE=false npm run build && npm run start   # true prod simulation
./publish.sh "what changed"   # snapshot -> GitHub main -> Vercel (commit first)
```

**Testing culture:** no formal test framework. Logic-heavy modules (`canon-submission`, `backup`) have standalone `tsx` test scripts exercised at build time (30 and 16 cases respectively — canonicalization edges, sign/verify round trips, tamper cases incl. `__proto__` injection, merge semantics). Recommend graduating these into `vitest` as a first hygiene task. UI changes are verified against a production build in a real browser before publishing — keep that bar.

---

## 5. Known issues / tech debt (ranked)

1. **In-memory rate limits** reset per serverless instance — adequate today; needs a KV/Upstash counter (or one Supabase table) when accounts arrive.
2. **`/api/ai-chat` has no auth or ownership check** — anyone can POST a memoryProfile and chat on your API keys; only IP rate limits stand between you and abuse. Fix lands naturally with Phase 2 auth.
3. **Dead code to delete in Phase 2:** custom auth stack (`lib/session.ts`, JWT parts of `lib/auth.ts`, `app/api/auth/*`, `hooks/use-simple-auth.ts`), `lib/storage-supabase.ts`.
4. **Souls page ownership filter** (`app/souls/page.tsx`) hides souls for un-owned NFTs — a user who sells (or a sample user who connects a real wallet) "loses" souls from the list though they remain in storage.
5. **Prompt-builder duplication:** `lib/ai/prompt-engineering.ts` vs `lib/context-aware-prompt.ts` overlap; consolidate onto the canon layer.
6. **`ignoreBuildErrors: true`** + shadcn scaffolding TS errors; 8 eslint legacy warnings (hook deps, `<img>`).
7. **OpenSea dependency** is the flakiest external edge — every consumer already has fallbacks, but ownership verification quality degrades with it.

---

## 6. Roadmap — where we are

Phases were decided through a four-role architecture debate (auth architect, data/sync architect, skeptic, canon-pipeline designer); key verdicts: **no Privy** (unanimous — $299/mo cliff, no first-class Supabase integration, embedded wallets useless for NFT ownership), **Supabase Auth when accounts ship**, **localStorage stays source of truth** (cloud is a mirror), **Supabase Pro (~$25/mo) required** because free-tier projects auto-pause after ~7 days of inactivity (disqualifying for user data).

| Phase | Scope | Status |
|---|---|---|
| Canon grounding | Trait classification in AI prompts (Void/lineage fixes); trait-meanings panel; grounded-in attribution | ✅ shipped |
| Sample mode | Walletless full experience with pinned #922; per-IP sample caps | ✅ shipped (`NEXT_PUBLIC_ENABLE_SAMPLE_MODE` set in Vercel) |
| **Phase 0** | Backup All / Import Backup (souls page) | ✅ shipped |
| **Phase 1** | Signed Canon Submission export (JSON) + .md character sheet | ✅ shipped |
| **Phase 2** | **Supabase accounts + cloud save** | ⬅️ **NEXT** (design final, not started) |
| Phase 3 | Chat-memory/archives sync, profile page, in-app submissions table | designed at sketch level |
| Canon engine | Separate service ingesting + re-verifying signed submission files | aspirational; the file format is its API |

### Phase 2 build spec (the agreed design — follow this)

**Prerequisites (owner):** create a **new** Supabase project (old one is deleted; old keys burned), decide Pro vs free+keep-alive, set env vars in Vercel.

1. **Auth: Supabase Auth only.** Email OTP + native Web3/SIWE wallet sign-in (`signInWithWeb3`, Ethereum). One `auth.uid()` per person.
2. **Wallet+email tie:** wallets are *proofs*, not logins — a `linked_wallets(user_id, address unique, verified_at)` table populated by a server route that verifies a one-time signature (reuse the challenge-message + `ethers.verifyMessage` pattern; nonce in Postgres, not memory). This sidesteps Supabase's known email-first→wallet identity-linking gap, supports vault wallets and multiple wallets per user. Wallet-first users add email via `updateUser({ email })` (supported today).
3. **Schema:** `souls(user_id, nft_id, local_id, data jsonb, created_at, updated_at, deleted_at, PK(user_id, nft_id))` — whole `CharacterData` as one JSONB (no column decomposition; that's what silently dropped fields last time), client-clock `updated_at` as the LWW key, `deleted_at` tombstones. Souls are **per-user creative work, not per-token** — an NFT sale must never delete the seller's writing. No profiles table until there's a second profile field.
4. **RLS:** one `FOR ALL USING (user_id = auth.uid()) WITH CHECK (same)` policy per table. No anon policies (logged-out users never touch the network).
5. **Sync: rewrite `storage-hybrid.ts` (~150 lines), keep the `storage-wrapper` seam.** Local-first: write localStorage → persisted dirty-set (localStorage, not memory) → debounced upsert `on conflict (user_id, nft_id)` where incoming `updated_at` newer. On login/load: fetch all, merge **by nft_id** (never by id), newest wins, tombstones beat live rows both directions. No interval timer — flush on write + `visibilitychange`. Per-soul last-write-wins; per-field merge is the over-engineering cliff.
6. **Migration:** on first sign-in, auto-upload local souls (excluding sample token / demo-wallet artifacts) + toast. No blocking prompts — first login is just a merge with an empty remote.
7. **Keep:** sample mode purely localStorage (no anonymous DB users for drive-by visitors); Backup/Import as the escape hatch; `ai-chat`/`ai-assistant` gain real user identity for rate limiting.
8. **Delete:** custom auth stack, `storage-supabase.ts`, the `?address=` trust fallback (`getRequestWalletAddress` should only trust Supabase sessions or explicit legacy read-only paths).

**Definition of done:** two browsers, one account — soul created in A appears in B; delete in A deletes in B (tombstone, not resurrection); offline edits sync on reconnect; sample mode unchanged; a Supabase outage degrades to today's app with a visible sync-status indicator (`components/sync-status.tsx` exists as a shell).

---

## 7. Design principles (the "constitution")

1. **localStorage is the source of truth; the cloud is a mirror.** The app must remain fully usable logged-out, offline, and through backend outages.
2. **Canon has one classifier.** All trait interpretation flows through `classifyTraits()`; UI and AI can never disagree because they read the same source.
3. **Warnings never block creative prose.** Hard errors are reserved for machine-certain violations.
4. **The sample must never touch shared server state.** Shared demo identity + per-visitor privacy = localStorage only.
5. **The export file is the API.** Signed, self-verifying artifacts outlive any backend (this app has already outlived one).
6. **Never trust a client-supplied address for anything that matters**; never let a "verify" surface display fallback/mock data.
7. **Additive imports, tombstoned deletes, newest-wins merges** — no operation a user can perform should ever destroy their other data.
8. **Verify in a production build before publishing.** `next dev` hides Vercel realities (dev-mode gates, serverless statelessness).
