/**
 * Phase 2 sync engine tests — lib/storage-hybrid.ts
 * Spec: docs/DEVELOPER_HANDOFF.md §6 (steps 3, 5, 6) + Definition of done.
 *
 * Runs in the default node environment (jsdom is not installed): localStorage,
 * window and document are stubbed with tiny in-memory shims in beforeEach,
 * BEFORE the module under test is (re-)imported, because storage-hybrid.ts
 * registers visibilitychange/online/offline listeners at import time and keeps
 * module-level state (currentUserId, syncStatus, flushTimer).
 *
 * The supabase client is mocked via vi.mock + a vi.hoisted holder whose value
 * can be swapped per-test (including to null, to simulate unset env). The mock
 * module exposes `supabase` as a getter so the engine's live-binding reads
 * always see the current holder value.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import type { CharacterData } from "@/lib/types"
import type { StoredSoul } from "@/lib/storage"
import { DEMO_WALLET_ADDRESS } from "@/lib/dev-mode"
import { SAMPLE_TOKEN_ID } from "@/lib/sample-token"

// ---------------------------------------------------------------------------
// supabase mock (controllable per test; getter = live rebinding)
// ---------------------------------------------------------------------------

const supabaseHolder = vi.hoisted(() => ({ client: null as unknown }))

vi.mock("@/lib/supabase", () => ({
  get supabase() {
    return supabaseHolder.client
  },
  supabaseAdmin: null,
}))

interface UpsertCall {
  table: string
  values: Record<string, unknown>
  options: Record<string, unknown> | undefined
}

interface SelectCall {
  table: string
  column: string
  value: unknown
}

function createFakeSupabase() {
  const upsertCalls: UpsertCall[] = []
  const selectCalls: SelectCall[] = []
  const state = {
    /** When set, every upsert resolves with this error. */
    upsertError: null as null | { message: string },
    /** Rows returned by from('souls').select('*').eq('user_id', ...) */
    rows: [] as Array<Record<string, unknown>>,
    selectError: null as null | { message: string },
  }
  const client = {
    from(table: string) {
      return {
        upsert(values: Record<string, unknown>, options?: Record<string, unknown>) {
          upsertCalls.push({ table, values, options })
          return Promise.resolve({ error: state.upsertError })
        },
        select(_columns: string) {
          return {
            eq(column: string, value: unknown) {
              selectCalls.push({ table, column, value })
              return Promise.resolve(
                state.selectError
                  ? { data: null, error: state.selectError }
                  : { data: state.rows, error: null },
              )
            },
          }
        },
      }
    },
    auth: {
      getUser: async () => ({ data: { user: null } }),
    },
  }
  return { client, upsertCalls, selectCalls, state }
}

type FakeSupabase = ReturnType<typeof createFakeSupabase>

// ---------------------------------------------------------------------------
// browser-global shims (no jsdom dependency)
// ---------------------------------------------------------------------------

class MemoryStorage {
  private map = new Map<string, string>()
  getItem(key: string): string | null {
    return this.map.has(key) ? this.map.get(key)! : null
  }
  setItem(key: string, value: string): void {
    this.map.set(key, String(value))
  }
  removeItem(key: string): void {
    this.map.delete(key)
  }
  clear(): void {
    this.map.clear()
  }
  key(index: number): string | null {
    return [...this.map.keys()][index] ?? null
  }
  get length(): number {
    return this.map.size
  }
}

function makeEventTarget() {
  const listeners: Record<string, Array<(evt: Event) => void>> = {}
  return {
    addEventListener(type: string, fn: (evt: Event) => void) {
      ;(listeners[type] ||= []).push(fn)
    },
    removeEventListener(type: string, fn: (evt: Event) => void) {
      listeners[type] = (listeners[type] || []).filter((l) => l !== fn)
    },
    dispatchEvent(evt: Event): boolean {
      for (const fn of listeners[evt.type] || []) fn(evt)
      return true
    },
  }
}

/** Drain the microtask queue so fire-and-forget flushDirty() chains settle. */
async function drainMicrotasks(rounds = 64) {
  for (let i = 0; i < rounds; i++) await Promise.resolve()
}

// ---------------------------------------------------------------------------
// fixtures
// ---------------------------------------------------------------------------

const USER_ID = "user-1"
const REAL_WALLET = "0x00000000000000000000000000000000000000aa"
const NOW_ISO = "2026-07-12T12:00:00.000Z"
const T_OLD = "2026-07-12T10:00:00.000Z"
const T_NEW = "2026-07-12T11:00:00.000Z"

function makeCharacter(pfpId: string, soulName: string, extra?: Record<string, unknown>): CharacterData {
  return {
    pfpId,
    soulName,
    traits: [{ trait_type: "Body", value: "Citrine" }],
    archetype: "Ronin",
    background: "Raised in The Vents",
    hopesFears: { hopes: "h", fears: "f" },
    personalityProfile: { description: "p" },
    motivations: { drives: "d", goals: "g", values: "v" },
    relationships: { friends: "", rivals: "", family: "" },
    worldPosition: { societalRole: "", classStatus: "", perception: "" },
    voice: { speechStyle: "", innerDialogue: "", uniquePhrases: "" },
    symbolism: { colors: "", items: "", motifs: "" },
    powersAbilities: { powers: ["p1"], description: "pd" },
    ...extra,
  } as unknown as CharacterData
}

function remoteRow(
  nftId: string,
  data: unknown,
  updatedAt: string,
  deletedAt: string | null = null,
  localId = `remote-device-${nftId}`,
): Record<string, unknown> {
  return {
    user_id: USER_ID,
    nft_id: nftId,
    local_id: localId,
    data,
    created_at: updatedAt,
    updated_at: updatedAt,
    deleted_at: deletedAt,
  }
}

// ---------------------------------------------------------------------------
// harness
// ---------------------------------------------------------------------------

let storage: MemoryStorage
let doc: ReturnType<typeof makeEventTarget> & { visibilityState: string }
let fake: FakeSupabase
let hybrid: typeof import("@/lib/storage-hybrid")

function plantSoul(soul: StoredSoul) {
  const souls: StoredSoul[] = JSON.parse(storage.getItem("oni-souls") || "[]")
  souls.push(soul)
  storage.setItem("oni-souls", JSON.stringify(souls))
}

function storedSouls(): StoredSoul[] {
  return JSON.parse(storage.getItem("oni-souls") || "[]")
}

function dirtySet(): string[] {
  return JSON.parse(storage.getItem("oni-souls-dirty") || "[]")
}

function tombstones(): Record<string, string> {
  return JSON.parse(storage.getItem("oni-souls-tombstones") || "{}")
}

function contentOwner(): string | null {
  return storage.getItem("oni-content-owner")
}

function enableCloud() {
  hybrid.setCurrentWalletAddress(REAL_WALLET)
  hybrid.setCurrentUserId(USER_ID)
}

/** Re-import the module fresh (simulates a page reload / new session). */
async function reloadModule() {
  vi.resetModules()
  hybrid = await import("@/lib/storage-hybrid")
}

beforeEach(async () => {
  storage = new MemoryStorage()
  const win = Object.assign(makeEventTarget(), { localStorage: storage })
  doc = Object.assign(makeEventTarget(), { visibilityState: "visible" })
  vi.stubGlobal("localStorage", storage)
  vi.stubGlobal("window", win)
  vi.stubGlobal("document", doc)
  vi.spyOn(console, "log").mockImplementation(() => {})
  vi.spyOn(console, "error").mockImplementation(() => {})

  fake = createFakeSupabase()
  supabaseHolder.client = fake.client

  vi.useFakeTimers()
  vi.setSystemTime(new Date(NOW_ISO))

  await reloadModule()
})

afterEach(() => {
  vi.useRealTimers()
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
})

// ---------------------------------------------------------------------------
// 1. cloud disabled
// ---------------------------------------------------------------------------

describe("cloud disabled", () => {
  it("writes go to localStorage only with no network calls when there is no userId", async () => {
    hybrid.setCurrentWalletAddress(REAL_WALLET) // wallet but no auth session

    const id = hybrid.storeSoul(makeCharacter("111", "Local Hero"))
    await vi.runAllTimersAsync()
    await hybrid.flushDirty()

    expect(hybrid.getSoulById(id)?.data.soulName).toBe("Local Hero")
    expect(storedSouls()).toHaveLength(1)
    expect(fake.upsertCalls).toHaveLength(0)
    expect(fake.selectCalls).toHaveLength(0)
    expect(hybrid.getSyncStatus()).toBe("local-only")
  })

  it("degrades to pure localStorage when supabase is null (env unset), even with a userId", async () => {
    supabaseHolder.client = null
    enableCloud()

    const id = hybrid.storeSoul(makeCharacter("112", "Envless"))
    await vi.runAllTimersAsync()
    await hybrid.flushDirty()

    expect(hybrid.getSoulById(id)?.data.pfpId).toBe("112")
    expect(hybrid.getSyncStatus()).toBe("local-only")
    // No client exists, so no calls could have been recorded anywhere.
    expect(fake.upsertCalls).toHaveLength(0)
  })
})

// ---------------------------------------------------------------------------
// 2. demo wallet / sample token never sync
// ---------------------------------------------------------------------------

describe("demo wallet and sample token", () => {
  it("never upserts to supabase for the demo wallet, even with a userId set", async () => {
    hybrid.setCurrentUserId(USER_ID)
    hybrid.setCurrentWalletAddress(DEMO_WALLET_ADDRESS)

    hybrid.storeSoul(makeCharacter("1631", "Demo Soul")) // real demo token, not the sample
    await vi.runAllTimersAsync()
    await hybrid.flushDirty()
    await drainMicrotasks()

    expect(storedSouls()).toHaveLength(1) // still saved locally
    expect(fake.upsertCalls).toHaveLength(0)
    expect(fake.selectCalls).toHaveLength(0)
    expect(hybrid.getSyncStatus()).toBe("local-only")
  })

  it("never upserts the sample token #922, even on a real wallet with cloud enabled", async () => {
    enableCloud()

    hybrid.storeSoul(makeCharacter(SAMPLE_TOKEN_ID, "Sample 922"))
    await vi.runAllTimersAsync()
    await hybrid.flushDirty()

    expect(storedSouls()).toHaveLength(1)
    expect(fake.upsertCalls).toHaveLength(0)
    expect(dirtySet()).toHaveLength(0) // never even marked dirty
  })
})

// ---------------------------------------------------------------------------
// 3. dirty-set persistence
// ---------------------------------------------------------------------------

describe("dirty-set persistence ('oni-souls-dirty')", () => {
  it("keeps the nft_id dirty in localStorage after a failed upsert and clears it after a successful flush", async () => {
    enableCloud()
    fake.state.upsertError = { message: "network down" }

    hybrid.storeSoul(makeCharacter("300", "Dirty Soul"))
    expect(dirtySet()).toContain("300") // persisted immediately, before any flush

    await hybrid.flushDirty()
    expect(dirtySet()).toContain("300") // survives the failed flush
    expect(hybrid.getSyncStatus()).toBe("error")

    // Simulate reconnect: upserts succeed now.
    fake.state.upsertError = null
    await hybrid.flushDirty()

    expect(dirtySet()).toHaveLength(0)
    expect(hybrid.getSyncStatus()).toBe("idle")
    const live = fake.upsertCalls.filter((c) => c.values.nft_id === "300")
    expect(live.length).toBeGreaterThanOrEqual(2) // failed attempt + successful retry
    expect(live[live.length - 1].values.deleted_at).toBeNull()
  })

  it("dirty set survives a page reload (module re-import) and flushes on the next session", async () => {
    enableCloud()
    fake.state.upsertError = { message: "offline" }
    hybrid.storeSoul(makeCharacter("301", "Offline Edit"))
    await hybrid.flushDirty()
    expect(dirtySet()).toContain("301")

    // "Reload": fresh module, same localStorage, cloud comes back.
    fake.state.upsertError = null
    await reloadModule()
    enableCloud()
    await hybrid.flushDirty()

    expect(dirtySet()).toHaveLength(0)
    expect(fake.upsertCalls.some((c) => c.values.nft_id === "301" && c.values.deleted_at === null)).toBe(true)
  })
})

// ---------------------------------------------------------------------------
// 4. LWW merge by nft_id
// ---------------------------------------------------------------------------

describe("LWW merge by nft_id", () => {
  it("newer remote row overwrites the older local soul without creating a duplicate (merge keys on nft_id, not id/local_id)", async () => {
    enableCloud()
    plantSoul({
      id: "local-abc",
      createdAt: T_OLD,
      lastUpdated: T_OLD,
      data: makeCharacter("400", "Old Name"),
    })
    // Different id and local_id on purpose — must still merge onto the same soul.
    fake.state.rows = [remoteRow("400", makeCharacter("400", "New Name"), T_NEW, null, "device-b-xyz")]

    await hybrid.mergeFromRemote()

    const matching = storedSouls().filter((s) => s.data.pfpId === "400")
    expect(matching).toHaveLength(1)
    expect(matching[0].data.soulName).toBe("New Name")
    expect(matching[0].id).toBe("local-abc") // updated in place, no id churn
    // Nothing was newer locally, so nothing gets pushed back.
    expect(fake.upsertCalls).toHaveLength(0)
    expect(dirtySet()).toHaveLength(0)
  })

  it("newer local soul is kept and pushed to the cloud when the remote row is older", async () => {
    enableCloud()
    plantSoul({
      id: "local-def",
      createdAt: T_OLD,
      lastUpdated: T_NEW,
      data: makeCharacter("410", "Local Newer"),
    })
    fake.state.rows = [remoteRow("410", makeCharacter("410", "Remote Stale"), T_OLD)]

    await hybrid.mergeFromRemote()

    const soul = hybrid.getSoulByNftId("410")
    expect(soul?.data.soulName).toBe("Local Newer")
    expect(soul?.lastUpdated).toBe(T_NEW)

    const pushes = fake.upsertCalls.filter((c) => c.values.nft_id === "410")
    expect(pushes).toHaveLength(1)
    expect((pushes[0].values.data as CharacterData).soulName).toBe("Local Newer")
    expect(pushes[0].values.updated_at).toBe(T_NEW)
    expect(dirtySet()).toHaveLength(0) // flushed at the end of the merge
  })

  // BUG (see final report): mergeFromRemote applies a newer remote row via
  // local.updateSoul()/storeSoul(), which re-stamp lastUpdated with the LOCAL
  // clock "now" instead of preserving the remote updated_at. The pulled copy
  // then looks newer than the cloud row, so the next merge marks it dirty and
  // re-uploads unchanged data with an inflated updated_at — which can beat a
  // genuinely newer edit from another device (stale content wins LWW).
  // Correct-per-spec behavior (§6 step 5: client-clock updated_at is the LWW
  // key): a pull must preserve the remote updated_at. Marked .fails so the
  // suite stays green until the source is fixed; flip to it() with the fix.
  it("pulling a newer remote row preserves its updated_at as the local lastUpdated (no echo re-uploads)", async () => {
    enableCloud()
    plantSoul({
      id: "local-ghi",
      createdAt: T_OLD,
      lastUpdated: T_OLD,
      data: makeCharacter("420", "Old"),
    })
    fake.state.rows = [remoteRow("420", makeCharacter("420", "New"), T_NEW)]

    await hybrid.mergeFromRemote()

    const soul = hybrid.getSoulByNftId("420")
    expect(soul?.data.soulName).toBe("New")
    // Currently this is the fake "now" (NOW_ISO) instead of T_NEW.
    expect(soul?.lastUpdated).toBe(T_NEW)
  })
})

// ---------------------------------------------------------------------------
// 5. tombstones beat live rows in both directions
// ---------------------------------------------------------------------------

describe("tombstones", () => {
  it("remote tombstone removes the local soul and it is not re-uploaded", async () => {
    enableCloud()
    plantSoul({
      id: "local-500",
      createdAt: T_OLD,
      lastUpdated: T_OLD,
      data: makeCharacter("500", "Doomed"),
    })
    fake.state.rows = [remoteRow("500", {}, T_NEW, T_NEW, "tombstone-500")]

    await hybrid.mergeFromRemote()

    expect(hybrid.getSoulByNftId("500")).toBeNull()
    expect(storedSouls().filter((s) => s.data.pfpId === "500")).toHaveLength(0)
    // Remote tombstones are honored but NOT copied into the local map — it
    // holds only unpushed LOCAL deletes (the remote already has this one).
    expect(tombstones()["500"]).toBeUndefined()
    // No live (deleted_at: null) upsert may resurrect it remotely.
    const liveUpserts = fake.upsertCalls.filter(
      (c) => c.values.nft_id === "500" && c.values.deleted_at === null,
    )
    expect(liveUpserts).toHaveLength(0)
  })

  it("local delete tombstones the remote row, and a later pull of a live row does not resurrect it", async () => {
    enableCloud()
    plantSoul({
      id: "local-600",
      createdAt: T_OLD,
      lastUpdated: T_OLD,
      data: makeCharacter("600", "Deleted Locally"),
    })

    expect(hybrid.deleteSoul("local-600")).toBe(true)
    expect(tombstones()["600"]).toBe(NOW_ISO)
    await hybrid.flushDirty()

    const tombPush = fake.upsertCalls.filter((c) => c.values.nft_id === "600")
    expect(tombPush).toHaveLength(1)
    expect(tombPush[0].table).toBe("souls")
    expect(tombPush[0].values).toStrictEqual({
      user_id: USER_ID,
      nft_id: "600",
      local_id: "tombstone-600",
      data: {},
      updated_at: NOW_ISO,
      deleted_at: NOW_ISO,
    })
    expect(tombPush[0].options).toStrictEqual({ onConflict: "user_id,nft_id" })

    // Pushed tombstones leave the local map (no eternal re-push chatter) —
    // the server row + souls_lww_guard trigger carry the delete from here.
    expect(tombstones()["600"]).toBeUndefined()
    await hybrid.flushDirty()
    expect(fake.upsertCalls.filter((c) => c.values.nft_id === "600")).toHaveLength(1)

    // A stale device's older live upsert is rejected server-side by the
    // souls_lww_guard trigger, so a pull still returns the tombstone row —
    // and it must NOT resurrect locally.
    fake.state.rows = [remoteRow("600", {}, NOW_ISO, NOW_ISO, "tombstone-600")]
    await hybrid.mergeFromRemote()

    expect(hybrid.getSoulByNftId("600")).toBeNull()
    expect(storedSouls().filter((s) => s.data.pfpId === "600")).toHaveLength(0)
  })
})

// ---------------------------------------------------------------------------
// 6. deleted-soul non-resurrection round trip
// ---------------------------------------------------------------------------

describe("delete round trip (Definition of done: tombstone, not resurrection)", () => {
  it("delete -> flush -> fresh login pull containing the tombstoned row keeps the soul deleted", async () => {
    enableCloud()
    plantSoul({
      id: "local-700",
      createdAt: T_OLD,
      lastUpdated: T_OLD,
      data: makeCharacter("700", "Round Trip"),
    })

    hybrid.deleteSoul("local-700")
    await hybrid.flushDirty()
    expect(fake.upsertCalls.some((c) => c.values.nft_id === "700" && c.values.deleted_at === NOW_ISO)).toBe(true)

    // Fresh login: new module instance (same localStorage), server returns the
    // tombstoned row it now stores.
    fake.state.rows = [remoteRow("700", {}, NOW_ISO, NOW_ISO, "tombstone-700")]
    await reloadModule()
    await hybrid.initializeHybridStorage(REAL_WALLET, USER_ID)

    expect(hybrid.getSoulByNftId("700")).toBeNull()
    expect(storedSouls().filter((s) => s.data.pfpId === "700")).toHaveLength(0)
    // The pushed tombstone was pruned locally and the remote row is not
    // re-adopted — the map tracks only unpushed local deletes.
    expect(tombstones()["700"]).toBeUndefined()
    // And still no live re-upload of the deleted soul.
    expect(
      fake.upsertCalls.filter((c) => c.values.nft_id === "700" && c.values.deleted_at === null),
    ).toHaveLength(0)
  })
})

// ---------------------------------------------------------------------------
// 7. first login with empty remote = plain merge, locals uploaded
// ---------------------------------------------------------------------------

describe("first login (§6 step 6)", () => {
  it("with an empty remote, keeps all local souls and uploads them (excluding the sample token)", async () => {
    plantSoul({ id: "l-801", createdAt: T_OLD, lastUpdated: T_OLD, data: makeCharacter("801", "First") })
    plantSoul({ id: "l-802", createdAt: T_NEW, lastUpdated: T_NEW, data: makeCharacter("802", "Second") })
    plantSoul({ id: "l-922", createdAt: T_OLD, lastUpdated: T_OLD, data: makeCharacter("922", "Sample") })
    fake.state.rows = [] // brand new account

    await hybrid.initializeHybridStorage(REAL_WALLET, USER_ID)

    // No data loss locally.
    expect(storedSouls()).toHaveLength(3)
    // Both real souls pushed, sample excluded.
    const pushed = fake.upsertCalls.map((c) => c.values.nft_id).sort()
    expect(pushed).toEqual(["801", "802"])
    expect(fake.upsertCalls.every((c) => c.values.deleted_at === null)).toBe(true)
    expect(dirtySet()).toHaveLength(0)
    expect(hybrid.getSyncStatus()).toBe("idle")
  })
})

// ---------------------------------------------------------------------------
// 8. upsert payload shape (column-mapping regression guard)
// ---------------------------------------------------------------------------

describe("upsert payload shape (§6 step 3: whole CharacterData as JSONB)", () => {
  it("sends the exact columns with the whole CharacterData under data and onConflict user_id,nft_id", async () => {
    enableCloud()
    const character = makeCharacter("4567", "Payload Check", {
      imageUrl: "https://img.example/4567.png",
      traitsVerified: true,
      traitsSource: "opensea",
      // extra nested field that a column-decomposition would silently strip
      psychologicalArchitecture: {
        consciousnessLayers: "layered",
        memoryArchitecture: "holographic",
        cognitiveProcessingStyle: "parallel",
        traumaPatterns: "none",
        identityFragmentation: "low",
      },
    })

    const soulId = hybrid.storeSoul(character)
    expect(soulId).toBe(`${NOW_ISO}-4567`)
    await hybrid.flushDirty()

    expect(fake.upsertCalls).toHaveLength(1)
    const call = fake.upsertCalls[0]
    expect(call.table).toBe("souls")
    // Exact payload: any added/renamed/stripped column fails this (the 2024
    // column-decomposition bug class).
    expect(call.values).toStrictEqual({
      user_id: USER_ID,
      nft_id: "4567",
      local_id: soulId,
      data: character,
      created_at: NOW_ISO,
      updated_at: NOW_ISO,
      deleted_at: null,
    })
    // The whole CharacterData object, field-for-field.
    expect(call.values.data).toStrictEqual(character)
    expect(call.options).toStrictEqual({ onConflict: "user_id,nft_id" })
  })
})

// ---------------------------------------------------------------------------
// flush triggers: debounced write + visibilitychange
// ---------------------------------------------------------------------------

describe("flush triggers (§6 step 5: flush on write + visibilitychange, no interval)", () => {
  it("a write schedules a debounced flush that upserts without any manual call", async () => {
    enableCloud()
    hybrid.storeSoul(makeCharacter("910", "Debounced"))
    expect(fake.upsertCalls).toHaveLength(0) // not synchronous

    await vi.advanceTimersByTimeAsync(2000) // > 1500ms debounce
    await drainMicrotasks()

    expect(fake.upsertCalls.filter((c) => c.values.nft_id === "910")).toHaveLength(1)
    expect(dirtySet()).toHaveLength(0)
    expect(hybrid.getSyncStatus()).toBe("idle")
  })

  it("hiding the tab (visibilitychange) flushes the dirty set immediately", async () => {
    enableCloud()
    hybrid.storeSoul(makeCharacter("911", "Hidden Flush"))
    expect(fake.upsertCalls).toHaveLength(0)

    doc.visibilityState = "hidden"
    doc.dispatchEvent(new Event("visibilitychange"))
    await drainMicrotasks()

    expect(fake.upsertCalls.filter((c) => c.values.nft_id === "911")).toHaveLength(1)
    expect(dirtySet()).toHaveLength(0)
  })
})

// ---------------------------------------------------------------------------
// BUG: tombstones are never cleared -> re-created souls can never sync
// ---------------------------------------------------------------------------

describe("soul re-creation after delete (tombstone supersession)", () => {
  // BUG (see final report): nothing ever removes an entry from
  // 'oni-souls-tombstones'. flushDirty() drops any dirty nft_id that has a
  // tombstone, so a soul the user deletes and then RE-CREATES for the same NFT
  // is silently never uploaded again — violating "flush on write" and
  // constitution §7 ("no operation a user can perform should ever destroy
  // their other data"). Correct-per-spec (LWW, newest wins): a local write
  // NEWER than the tombstone supersedes it (clear the local tombstone on
  // re-create, and let the live upsert with deleted_at: null revive the row).
  // Marked .fails until the source is fixed; flip to it() with the fix.
  it("a soul re-created after a flushed delete is uploaded again (newer write beats tombstone)", async () => {
    enableCloud()

    // T0: create + sync
    hybrid.storeSoul(makeCharacter("900", "First Life"))
    await hybrid.flushDirty()

    // T1: delete + sync tombstone
    vi.setSystemTime(new Date("2026-07-12T13:00:00.000Z"))
    const soul = hybrid.getSoulByNftId("900")
    hybrid.deleteSoul(soul!.id)
    await hybrid.flushDirty()
    const callsBeforeRecreate = fake.upsertCalls.length

    // T2 (> tombstone): the user re-creates a soul for the same NFT
    vi.setSystemTime(new Date("2026-07-12T14:00:00.000Z"))
    hybrid.storeSoul(makeCharacter("900", "Second Life"))
    await hybrid.flushDirty()

    const liveAfterRecreate = fake.upsertCalls
      .slice(callsBeforeRecreate)
      .filter((c) => c.values.nft_id === "900" && c.values.deleted_at === null)
    // Correct behavior: exactly one live upsert carrying the new soul.
    expect(liveAfterRecreate).toHaveLength(1)
    expect((liveAfterRecreate[0].values.data as CharacterData).soulName).toBe("Second Life")
  })

  // BUG companion (same root cause, remote direction): because the stale
  // tombstone also still exists on the server, the next login pull sees
  // deleted_at set and mergeFromRemote() deletes the re-created LOCAL soul
  // unconditionally (lines 221-228 do not compare the tombstone time against
  // the local lastUpdated). A newer local live write must beat an older
  // tombstone under LWW. Marked .fails until the source is fixed.
  it("a login pull with an older remote tombstone does not delete a newer re-created local soul", async () => {
    enableCloud()

    // Delete happened at T_OLD (tombstone lives on the server)...
    fake.state.rows = [remoteRow("901", {}, T_OLD, T_OLD, "tombstone-901")]
    // ...but the user re-created the soul locally afterwards, at T_NEW.
    plantSoul({ id: "l-901b", createdAt: T_NEW, lastUpdated: T_NEW, data: makeCharacter("901", "Reborn") })

    await hybrid.mergeFromRemote()

    // Correct behavior: the newer live soul survives the pull.
    expect(hybrid.getSoulByNftId("901")?.data.soulName).toBe("Reborn")
  })

  // Third direction (found live-fire in the two-device DoD run): the device
  // that DELETED keeps its tombstone in 'oni-souls-tombstones' forever, so a
  // pull that brings a NEWER live row (the soul was re-created on another
  // device) was skipped by the local-tombstone guard — the revival never
  // propagated. LWW: a remote live row newer than the local tombstone must
  // prune the tombstone and be applied.
  it("a pull with a live row newer than the local tombstone revives the soul (tombstone pruned)", async () => {
    enableCloud()

    // This device deleted the soul at T_OLD (tombstone flushed upstream)...
    hybrid.storeSoul(makeCharacter("902", "First Life"))
    vi.setSystemTime(new Date(T_OLD))
    const soul = hybrid.getSoulByNftId("902")
    hybrid.deleteSoul(soul!.id)
    expect(tombstones()["902"]).toBeTruthy() // unpushed local delete
    await hybrid.flushDirty()
    expect(tombstones()["902"]).toBeUndefined() // pushed -> pruned

    // ...and another device re-created it at T_NEW.
    fake.state.rows = [remoteRow("902", makeCharacter("902", "Reborn Elsewhere"), T_NEW)]

    await hybrid.mergeFromRemote()

    expect(hybrid.getSoulByNftId("902")?.data.soulName).toBe("Reborn Elsewhere")
    expect(tombstones()["902"]).toBeUndefined()
  })
})

// ---------------------------------------------------------------------------
// 9. cross-user isolation on a shared browser (audit findings 8 & 11)
// ---------------------------------------------------------------------------

describe("content-owner isolation (audit §8/§11: shared-browser cross-user leak)", () => {
  const USER_A = "user-A"
  const USER_B = "user-B"

  it("switching from user A to a different user B wipes A's souls and never uploads or shows them under B", async () => {
    // User A signs in on this browser and creates + syncs a soul.
    hybrid.setCurrentWalletAddress(REAL_WALLET)
    hybrid.setCurrentUserId(USER_A)
    expect(contentOwner()).toBe(USER_A)
    hybrid.storeSoul(makeCharacter("1000", "A's Private Soul"))
    await hybrid.flushDirty()
    expect(fake.upsertCalls.some((c) => c.values.nft_id === "1000" && c.values.user_id === USER_A)).toBe(true)
    const callsAfterA = fake.upsertCalls.length

    // User B signs in on the SAME browser. Their cloud account is empty.
    fake.state.rows = []
    hybrid.setCurrentUserId(USER_B)

    // A's soul is wiped immediately, before any merge — B can't see it.
    expect(hybrid.getSoulByNftId("1000")).toBeNull()
    expect(storedSouls()).toHaveLength(0)
    expect(dirtySet()).toHaveLength(0)
    expect(contentOwner()).toBe(USER_B)

    await hybrid.mergeFromRemote()
    await drainMicrotasks()

    // A's soul is never uploaded into B's account and never appears for B.
    const leaked = fake.upsertCalls.slice(callsAfterA).filter((c) => c.values.nft_id === "1000")
    expect(leaked).toHaveLength(0)
    expect(hybrid.getSoulByNftId("1000")).toBeNull()
  })

  it("anon-created souls (no owner) migrate to the first user who signs in — kept and uploaded", async () => {
    // Created while logged OUT: no userId, owner marker stays absent.
    hybrid.setCurrentWalletAddress(REAL_WALLET)
    hybrid.storeSoul(makeCharacter("1100", "Made While Anon"))
    expect(contentOwner()).toBeNull()
    expect(storedSouls()).toHaveLength(1)

    // First sign-in: the anon library is legitimately adopted, NOT wiped.
    fake.state.rows = []
    hybrid.setCurrentUserId(USER_ID)
    expect(hybrid.getSoulByNftId("1100")?.data.soulName).toBe("Made While Anon")
    expect(contentOwner()).toBe(USER_ID)

    await hybrid.mergeFromRemote()
    await drainMicrotasks()

    const uploads = fake.upsertCalls.filter(
      (c) => c.values.nft_id === "1100" && c.values.deleted_at === null,
    )
    expect(uploads.length).toBeGreaterThanOrEqual(1)
    expect(uploads[uploads.length - 1].values.user_id).toBe(USER_ID)
    // Still present locally after migration.
    expect(hybrid.getSoulByNftId("1100")?.data.soulName).toBe("Made While Anon")
  })

  it("sign-out wipes the previous authenticated user's souls so the next session can't see them", async () => {
    hybrid.setCurrentWalletAddress(REAL_WALLET)
    hybrid.setCurrentUserId(USER_ID)
    hybrid.storeSoul(makeCharacter("1200", "Signed-in Soul"))
    await hybrid.flushDirty()
    expect(hybrid.getSoulByNftId("1200")).not.toBeNull()

    hybrid.clearAuthenticatedContentOnSignOut()

    // Browser left as a clean anonymous slate.
    expect(hybrid.getSoulByNftId("1200")).toBeNull()
    expect(storedSouls()).toHaveLength(0)
    expect(dirtySet()).toHaveLength(0)
    expect(tombstones()).toEqual({})
    expect(contentOwner()).toBeNull()
    expect(hybrid.getSyncStatus()).toBe("local-only")
  })

  it("sign-out does NOT destroy anonymous souls (no authenticated owner recorded)", async () => {
    // Logged-out library only: owner never set.
    hybrid.setCurrentWalletAddress(REAL_WALLET)
    hybrid.storeSoul(makeCharacter("1250", "Anon Keeper"))
    expect(contentOwner()).toBeNull()

    hybrid.clearAuthenticatedContentOnSignOut()

    // Anonymous content belongs to the browser and must survive.
    expect(hybrid.getSoulByNftId("1250")?.data.soulName).toBe("Anon Keeper")
  })

  it("re-authenticating as the SAME user preserves local content and unsynced edits (no wipe)", async () => {
    hybrid.setCurrentWalletAddress(REAL_WALLET)
    hybrid.setCurrentUserId(USER_ID)
    hybrid.storeSoul(makeCharacter("1300", "Kept On Reload"))
    // A passive cold-load null (expired/not-yet-restored session) must not wipe.
    hybrid.setCurrentUserId(null)
    expect(hybrid.getSoulByNftId("1300")).not.toBeNull()
    // Session restored as the same user.
    fake.state.rows = []
    hybrid.setCurrentUserId(USER_ID)
    expect(hybrid.getSoulByNftId("1300")?.data.soulName).toBe("Kept On Reload")
    expect(contentOwner()).toBe(USER_ID)
  })

  it("sample and demo souls present at sign-in are never uploaded to the account", async () => {
    hybrid.setCurrentWalletAddress(REAL_WALLET)
    plantSoul({ id: "s", createdAt: T_OLD, lastUpdated: T_OLD, data: makeCharacter(SAMPLE_TOKEN_ID, "Sample") })
    plantSoul({ id: "d", createdAt: T_OLD, lastUpdated: T_OLD, data: makeCharacter("1631", "Demo Token") })
    plantSoul({ id: "r", createdAt: T_OLD, lastUpdated: T_OLD, data: makeCharacter("1400", "Real Soul") })

    fake.state.rows = []
    hybrid.setCurrentUserId(USER_ID) // adopt the anon library
    await hybrid.mergeFromRemote()
    await drainMicrotasks()

    expect(fake.upsertCalls.filter((c) => c.values.nft_id === SAMPLE_TOKEN_ID)).toHaveLength(0)
    expect(fake.upsertCalls.filter((c) => c.values.nft_id === "1631")).toHaveLength(0)
    // The genuine soul still uploads normally.
    expect(fake.upsertCalls.some((c) => c.values.nft_id === "1400")).toBe(true)
  })
})
