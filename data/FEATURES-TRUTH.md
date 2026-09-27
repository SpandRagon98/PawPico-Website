# MewMuze website feature truth

Checked against the existing Windows Pro and Free source checkouts on 13 September 2026. These are source checks; they do not independently attest the contents of a particular published installer. The website's Free/Pro table remains in `app/page.tsx`.

| Website feature | Pro source | Free source | Paper-only? | Evidence |
|---|---|---|---|---|
| Roaming, climbing, window physics, edge peek | Yes | Yes | No | Pro `src/physics/physicsEngine.ts`, `src/native/windowPlatforms.ts`, `src/__tests__/edgePeek.test.ts`; Free `src/engine/catEngine.ts` |
| Cursor gaze, petting, idle reactions | Yes | Yes | No | Pro `src/engine/catEngine.ts`, `src/interaction/pettingDetector.ts`, `src/behaviour/moodSystem.ts`; Free matching modules |
| Five breeds, coat patterns, accessories | Yes | Limited | No | Free `src/edition/edition.ts` defines Classic, Solid/Tuxedo, Flower Band and three coats; Pro `src/components/SettingsPanel.tsx` |
| Pomodoro, break and water reminders | Yes | Limited durations | No | Free `src/edition/edition.ts`, `src/productivity/pomodoro.ts`, `reminders.ts`; Pro matching modules |
| Custom reminders | Unlimited | One active | No | Free `src/edition/edition.ts` (`FREE_MAX_CUSTOM_REMINDERS`), Pro `src/productivity/scheduledReminders.ts` |
| Calculator, unit converter, time-zone converter | Yes | Yes | No | Both editions `src/calctime/calculator.ts`, `units.ts`, `timezones.ts`; `src/components/CalcTimePanel.tsx` |
| Gmail, Calendar, Clipboard Assistant | Yes | Visible but locked | No | Free `src/edition/edition.ts` ProFeature union and `src/edition/ProLock.tsx`; Pro `src/integrations/`, `src/clipboard-assistant/` |
| PDF and spreadsheet Quick Tools | Yes | Visible but locked | No | Free `src/edition/edition.ts`; Pro `src/quicktools/convert.ts`, `sheets.ts` |
| Optional local agent-status file | Yes | Yes | No | Pro `src/App.tsx` reads one configured file through `read_agent_status`; this is **not** Paper's AI Persona Router |
| Pro activation and updates | Yes | No activation or update channel | No | Free `src/edition/edition.ts` (`requiresActivation`, `receivesUpdates`); Pro `src/licensing/license.ts`, `updater.ts` |
| Local Qwen AI, Whisper voice transcription, Persona Router, Paper Tasks | No established shipping evidence | No | Yes | Paper-only `src-tauri/src/local_ai.rs`, `src/companion/persona/router.ts`, `src/tasks/` — not advertised here |

The local page previews use authentic cat assets already produced from the MewMuze renderer. The new desktop vignette is illustrative HTML/CSS, not a browser copy of Windows. Four reduced-motion PNGs are frame-zero extracts of existing site WebP assets; no synthetic cat art was introduced.

Commerce remains `lib/commerce.ts`: ₹549 in India and $7.99 internationally for base Pro, with Dodo's live checkout determining the amount actually charged. Free is free to keep and requires no activation. Neither licence rules nor checkout code was changed for this visual update.
