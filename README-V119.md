# 🎃💚 CHEMVENTUR v119 - Left Panel Sync & Mobile Fixes Edition! 💚🎃

**The dream since October... the dream since birth!**

## 🆕 What's NEW in v119!

### 🏠 ROOM CODE PANEL
- Creating a room now pops up a **big neon code panel** immediately, with **📋 Copy Code** and **🔗 Copy Link** buttons.
- The share link uses `location.origin + location.pathname + '?room=CODE'`, so it works from either the short GitHub Pages link or a mirrored copy on the same origin.
- Opening a `?room=CODE` link prefills the join box and prompts you to press **JOIN** (never auto-joins without your say-so).

### ⏱️ LEFT PANEL: AGREEMENT-COLORED SETTINGS
First working instance of the Left Panel's three-color agreement pattern from the build order:
- A **⏱️ TURN TIMER** slider (1 second → ∞) lives in the Left Panel, synced per-player to Firebase (`players/{id}/settings`).
- The button is **green** when every player in the room has the same value, **grey** when settings differ, and shows a **red pattern** (animated stripes) when another player changed it more recently than you.
- **Right-click** (desktop) or **long-press** (phone) the button for quick presets: 1s / 5s / 10s / 30s / 60s / ∞.
- Built as a reusable pattern (`js/left-panel-sync.js`) — more LP settings can plug into the same agreement logic later.

### 📱 PHONE CONTROLS — ALL THREE FIXES FROM THE ROADMAP
- **Ship turning fixed**: dragging on the canvas now rotates the ship (and aims guns) to face your finger, exactly like the desktop mouse-drag behavior — previously touch only moved the ship without ever turning it.
- **Gun choosing simplified**: a new bottom-left picker (`‹ Gun Name ›`) cycles through all 10 guns with big thumb-sized arrow buttons; long-press the gun name for the full gun-options popup. The old 10-button grid is also enlarged at phone widths (was shrinking to 7px text before — now real touch targets).
- **Shooting fixed**: a new circular **🔫 FIRE** button (bottom-right) fires the current gun in the ship's facing direction. Tap for a single shot, hold for rapid fire. Previously there was **no way to fire at all on touch** — `touchstart`/`touchmove`/`touchend` never called into the gun/fire system.
- **Bonus fix (was blocking all of the above):** on phone-width screens (≤480px) the Left Panel used to be `position:absolute; top:0; bottom:0; width:100%`, completely covering the canvas — the game was literally unplayable on a real phone in portrait. The panel is now a slide-in drawer (☰ button, top-left) with a dimmed backdrop; the canvas is visible and playable by default.

---

## 🎮 HOW TO PLAY (phone additions)

### Mobile:
- **Drag anywhere on the canvas**: ship flies toward your finger and turns to face it.
- **🔫 FIRE button** (bottom-right): tap = one shot, hold = rapid fire.
- **‹ Gun ›** picker (bottom-left): tap arrows to cycle guns, long-press the name for gun options.
- **☰ button** (top-left): opens/closes the full Left Panel as a drawer.

### Multiplayer room links:
1. Click **🌐 CREATE ROOM** → the room code panel pops up with the code and share link.
2. Send the link to a friend — opening it prefills their join box.
3. The **⏱️ TURN TIMER** button in the Left Panel shows at a glance whether everyone in the room agrees on the setting.

---

## 📁 New/changed files

```
js/left-panel-sync.js     # 🆕 Agreement-colored LP settings (turn timer)
js/touch-v117.js          # Ship now turns + aims on drag; FIRE button + gun picker wiring
js/multiplayer-v117.js    # Player node now carries a `settings` sub-object
js/main.js                # Extracted fireCurrentGun() shared by mouse-up and the FIRE button
js/ui.js                  # Room code panel, copy-code/copy-link, selectGun() helper, panel drawer toggle
index.html                # Room code panel, turn-timer control, mobile controls, panel toggle + backdrop
css/main.css              # Phone-width Left Panel becomes a slide-in drawer
css/ui.css                # Mobile controls, LP agreement colors, enlarged gun buttons on phone widths
```

---

## 📝 Version History

- **v119** (Sep 19, 2026) - Room code panel, Left Panel agreement-colored turn timer, and all three named phone-control fixes (ship turning, simplified gun picker, working FIRE button) — plus the panel-covers-canvas bug that was blocking mobile play entirely.
- **v118** - AI Players & Chat Edition
- **v117 Multi** (Feb 14, 2026) - Multiplayer + Touch + Microphone! 💝
- **v116** - Right-click menus, ship movement, upgrades
- ...and many more!

---

## 🔭 Still open from the multiplayer build order (not in this pass)

Scoped out to keep this pass focused and testable — flagging so the next session knows where to pick up:
- Waiting list / observer cap / subscriber-brings-a-friend rules (build order item 1's tail).
- The full turn engine (turn timer *driving* actual turns, SKIP button, time-step keys, hot-seat).
- Voting and the subscriber voting-type tab.
- Sub-only ship shapes, chat.bot, Stage 3.

---

**🎃 ENJOY THE GAME, PUMPKIN! 💚**
