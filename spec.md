# GrindMind

## Current State
The app has a full backend (Motoko) with `saveUserData`, `getUserData`, `saveProgress`, `getProgress`, `addJournalEntry`, `getJournalEntries`, and `deleteJournalEntry`. Authentication uses Internet Identity. The `useBackendSync` hook syncs data to the backend and loads it on mount when `hasPrincipal` is true.

## Requested Changes (Diff)

### Add
- Load journal entries from `getJournalEntries()` backend call in `loadFromBackend` (currently not called — journal entries saved to the separate journal collection are never loaded back)
- Load today's tasks from backend on refresh correctly

### Modify
- `useBackendSync.ts` → `loadFromBackend`: Also call `actor.getJournalEntries()` alongside existing calls. Parse the returned `content` string (format: `"CONQUERED: xxx | TOMORROW: yyy"`) back into `{date, conquered, dominate}` JournalEntry objects and use them as the journal data (takes precedence over `getUserData` journal entries since the separate collection is the primary source)
- `useGrindMind.ts` → `toggleTask`: When calling `fireSync()`, pass the updated tasks explicitly as an override (e.g. `fireSync({ tasks: next })`) to avoid stale closure where `stateRef.current.tasks` hasn't updated yet via the useEffect
- `useGrindMind.ts` → `loadFromBackend` effect: After loading journal from backend, map it correctly using the new format from `getJournalEntries` (each entry has `id`, `date`, `content`)

### Remove
- Nothing removed

## Implementation Plan
1. In `useBackendSync.ts`, add `actor.getJournalEntries()` to the Promise.all in `loadFromBackend`. Map results: parse content string back to `{date, conquered, dominate}`. Return this as `journal` field, overriding the getUserData journal.
2. In `useGrindMind.ts` `toggleTask`, change `fireSync()` to `fireSync({ tasks: next })` so the latest tasks are sent immediately.
3. Ensure the `loadFromBackend` effect in `useGrindMind.ts` handles the new journal format properly (already handles `data.journal` array of JournalEntry).
