# PRD: Dirt & Clouds Side-Scroller

Oct 11, 2026 · @Ricky

## Overview

A one-level, 2D side-scrolling browser game: a blue-shirted hero walks along a dirt path under the clouds, reaches a shirtless villain, talks to him, and fights him. The whole game plays with three keys: **A**, **D** and **Space**.

Scope is deliberately small: one level, one dialogue, one fight, about 5 minutes of play. It is built with Phaser and Vite, and every graphic is drawn in code, so there are no image files to find or fix.

## Goals and non-goals

The goal is a game someone can start and finish in one sitting, with a clear beginning, middle and end.

**Goals**

- Playable from first screen to win or lose screen with no bugs that block progress
- Walk, talk and fight using only A, D and Space
- Runs in any modern browser at a steady 60 fps
- All art generated in code, with no external image files

**Non-goals**

- Multiple levels, inventory, save system or leaderboards
- Touch or gamepad controls
- Online play or a second player
- Custom hand-drawn art and animation sheets

## World and visuals

The world is a flat, scrolling strip 2400 px wide, shown through an 800 x 600 camera that follows the hero. Everything is built from simple shapes and generated textures in a small, consistent palette.

| Layer | What it looks like | Behavior |
| --- | --- | --- |
| Sky | Flat light-blue background | Static |
| Clouds | 5 to 8 white puffs made of overlapping circles, at different heights | Drift slowly right to left, move at half the camera speed (parallax) |
| Trees | 6 to 10 trees: brown trunk with a round green canopy | Decoration only, placed behind the characters, no collision |
| Dirt | Brown ground strip, about 120 px tall, with darker speckles and a lighter grass-colored top edge | Solid floor; characters stand on top of it |

Characters always stand on the dirt, in front of the trees. The hero starts on the far left (x = 100) and the villain waits near the right end (x = 2000).

## Characters

Two characters, both built from shapes or a small pixel grid, with a clear silhouette difference so the player can tell them apart instantly.

|  | Hero (player) | Villain |
| --- | --- | --- |
| Look | Blue shirt, dark pants, light skin tone | Bare chest, dark red pants, bigger build |
| Size | About 48 x 64 px | About 60 x 76 px |
| Health | 100 | 100 |
| Starts at | x = 100, left side | x = 2000, right side |
| Moves | Walk, jump (while exploring), punch (in the fight) | Walk toward the hero, punch |
| Animation | Leg swing while walking, squash on landing, flash white when hit | Idle sway, arm swing on punch, flash white when hit |

The villain is a cartoon character drawn from simple shapes: a bare torso in a flat skin color, with pants. Nothing more detailed than that is needed.

## Controls

Only three keys are used. Space changes meaning with the game state, so one key covers jumping, talking and fighting.

| Key | While exploring | In dialogue | In the fight | On end screen |
| --- | --- | --- | --- | --- |
| A | Walk left | Disabled | Walk left | Nothing |
| D | Walk right | Disabled | Walk right | Nothing |
| Space | Jump | Next line | Punch | Restart |

No mouse, menus or other keys are needed. A one-line hint at the bottom of the screen shows the current meaning of Space.

## Game flow

&#91;embedded content: game flow · 5 states, 1 loop back\]

Exploring ends when the hero reaches the villain. The fight ends in a victory screen or a game over, and a loss restarts the game from the beginning.

## Dialogue

Dialogue starts automatically when the hero comes within 150 px of the villain.

- The hero stops, input for A and D is locked, and the camera settles on both characters.
- A text box appears at the bottom of the screen with the speaker's name and the line.
- Text types out one letter at a time; pressing Space finishes the line, then moves to the next.
- Dialogue is a plain array of lines in one file, so the script is easy to edit.
- The script is 4 to 6 lines, alternating villain and hero. After the last line the fight begins.

Placeholder script to replace with your own:

1. Villain: You walked a long way just to lose.
2. Hero: I'm not here to talk.
3. Villain: Good. Neither am I.

## Fight

The fight is a simple one-on-one brawl on the same dirt strip, with the camera locked in place. The hero wins by dropping the villain's health to 0 before his own reaches 0.

| Rule | Value |
| --- | --- |
| Hero punch | Space, damage 10, reach 40 px, 0.4 s cooldown |
| Villain punch | Damage 10, reach 40 px, one attack every 1.5 s, with a 0.3 s wind-up flash so it can be dodged |
| Hit feedback | White flash, small knockback (30 px), short screen shake |
| Health bars | One bar per character at the top of the screen, hero left and villain right |
| Villain behavior | Walks toward the hero until in reach, then punches on a timer; backs off briefly after being hit |
| Hero defense | Walk away with A or D to dodge; no block button |
| Jump | Disabled during the fight so Space only means punch |

With 100 health and 10 damage, each side needs 10 clean hits. Tune the villain's attack timer first if the fight feels too easy or too hard.

## Technical approach

Phaser 3 with Arcade physics, bundled by Vite. Characters, trees, clouds and dirt are generated at startup, so the project has no asset files.

```
mygame/
  index.html
  src/
    main.js              game config
    scenes/
      BootScene.js       generates all textures
      GameScene.js       explore, dialogue and fight states
      EndScene.js        win / game over screen
    entities/
      Hero.js
      Villain.js
    data/
      dialogue.js        the script as an array of lines
```

- **State machine:** one `state` value in `GameScene` (`explore`, `dialogue`, `fight`, `won`, `lost`) decides what the update loop and the Space key do.
- **Procedural art:** pixel-grid sprites via `textures.generate`, trees and clouds drawn with shapes, dirt drawn once to a texture.
- **Deployment:** `npm run build`, then upload `dist/` to Netlify, Vercel or GitHub Pages.

## Milestones and acceptance

Build in this order, and test in the browser after each step:

1. Project setup: Vite and Phaser running, blank scene on screen
2. World: sky, scrolling dirt, clouds, trees, camera following the hero
3. Hero: A and D walking, Space jumping, generated sprite with walk animation
4. Villain and dialogue: villain placed, trigger distance, text box, scripted lines
5. Fight: punches, health bars, villain AI, hit feedback
6. End screens and polish: win and game over, restart with Space, sound if time allows

**The game is done when:**

- [ ] The hero walks from the left edge to the villain using only A, D and Space
- [ ] Dialogue triggers once at the right distance and cannot be skipped by accident
- [ ] The fight can be won and lost, and both end screens appear
- [ ] Space restarts the game from the end screen
- [ ] No console errors, and the game holds 60 fps in a normal browser

**Risks**

- Space meaning three different things can confuse players, so the on-screen hint must always match the state.
- Fight balance takes real playtesting; keep the villain's attack timer easy to change.
- Hand-made pixel sprites need a few rounds of adjustment before they look right.

**Open questions**

- Should the hero be able to jump during the fight, or is punch-only Space fine?
- Should the world scroll (2400 px, as assumed here) or fit on a single screen?
- Does the villain have a name, and do you want a sound or music pass at the end?
