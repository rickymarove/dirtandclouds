# Build Plan: Dirt & Clouds Side-Scroller

Oct 11, 2026 · @Ricky

## How to use this plan

Give the agent one part at a time, and do not start the next part until the current one passes its checks. For each part:

1. Paste the shared context below, then paste the part.
2. Ask for a plan only, with no code yet.
3. Approve the plan, or correct it.
4. Let the agent code, then run the game and go through the "Done when" list.
5. Commit to Git, then move on. If a later part breaks something, roll back to the last commit.

**Shared context (paste before every part)**

The agent does not remember earlier parts, so this block restates the game each time.

```text
Game: a 2D side-scrolling browser game built with Phaser 3 and Vite (vanilla JavaScript).
A blue-shirted hero (the player) walks along a dirt path under clouds, with trees behind, reaches a shirtless cartoon villain, a short dialogue plays, then they fight.

Controls: only A, D and Space.
Space = jump while exploring, next line in dialogue, punch in the fight, restart on the end screen.

Art: no image files. Draw everything in code with shapes and generated textures.
World: 2400 px wide, camera 800 x 600 following the hero.

Files: src/main.js, src/scenes/BootScene.js, src/scenes/GameScene.js, src/scenes/EndScene.js, src/entities/Hero.js, src/entities/Villain.js, src/data/dialogue.js

Rules:
- Work only on the current part. Do not build ahead.
- Do not add libraries beyond Phaser.
- First reply with a short plan (files to touch, steps) and wait for my approval before writing code.
- Keep each file small and focused.
```

## Part A: Project setup

**Goal:** a Vite and Phaser project that runs and shows an empty scene, with the final folder structure already in place.

**Build**

- Create the Vite project (vanilla template), install Phaser, and add the folders and empty files from the shared context.
- `index.html` with a centered `#game` container and a dark page background.
- `main.js` creating the Phaser game: 800 x 600, `Phaser.AUTO`, Arcade physics with gravity of 900 on the y axis, `pixelArt: true`, scenes `[BootScene, GameScene, EndScene]`.
- `BootScene` that immediately starts `GameScene`.
- `GameScene` that sets a sky-blue background and shows the text "Part A works" in the middle.
- `EndScene` as an empty placeholder.

**Do not** add any gameplay, graphics or physics objects yet.

**Done when**

- [ ] `npm run dev` starts with no errors
- [ ] The browser shows a blue 800 x 600 canvas with the text "Part A works"
- [ ] The console is clean
- [ ] All files from the shared context exist, even if empty

## Part B: The world

**Goal:** the full scenery of sky, clouds, trees and dirt, with a camera that can scroll across the 2400 px world. No characters yet.

**Build**

- In `BootScene`, generate textures in code: a dirt strip with darker speckles and a lighter top edge, a cloud (overlapping white circles), and a tree (brown trunk, round green canopy).
- In `GameScene`, set world bounds to 2400 x 600. Make the dirt a solid ground about 120 px tall along the bottom (a static physics body or tiled sprite).
- Place 6 to 10 trees on top of the dirt at varied x positions, drawn behind where the characters will stand. No collision.
- Place 5 to 8 clouds at different heights, drifting slowly right to left and wrapping around. Give them a scroll factor of 0.5 so they move slower than the ground.
- Temporary scrolling test: let the camera move right when D is held and left when A is held, clamped to the world.

**Do not** add the hero, villain, dialogue or any enemy logic.

**Done when**

- [ ] Sky, clouds, trees and dirt all appear and look like one scene
- [ ] Holding D and A scrolls the camera across the whole 2400 px, and it stops at both ends
- [ ] Clouds drift on their own and move slower than the ground when the camera scrolls
- [ ] Trees stand on top of the dirt, not floating above it or sunk into it
- [ ] The test camera movement is easy to remove in Part C

## Part C: The hero

**Goal:** a blue-shirted hero the player can walk and jump with, standing on the dirt, with the camera following.

**Build**

- In `BootScene`, generate the hero texture as a small pixel grid (about 48 x 64 px on screen): blue shirt, dark pants, light skin tone.
- `Hero.js`: a class wrapping an Arcade physics sprite, with `update(keys)` handling input.
- A walks left, D walks right at 200 px/s, and the sprite flips to face the way it moves.
- Space jumps only when standing on the ground (jump velocity about -450).
- Walk animation done in code: a small leg swing or body bob while moving, and a squash when landing.
- Collide the hero with the ground and keep the hero inside the world bounds.
- Camera follows the hero with light smoothing. Remove the temporary camera test from Part B.
- Create the A, D and Space keys once in `GameScene` and pass them to the hero.

**Do not** add the villain, dialogue, health or attacks.

**Done when**

- [ ] The hero starts at x = 100 and stands on the dirt
- [ ] A and D move the hero and flip its direction; no other key does anything
- [ ] Space jumps, and holding Space does not allow a double jump in the air
- [ ] The hero cannot walk out of the world or fall through the ground
- [ ] The camera follows smoothly and stops at the world edges

## Part D: The villain and dialogue

**Goal:** the villain stands at the end of the path, and walking up to him starts a typed dialogue that ends by handing control to the fight.

**Build**

- In `BootScene`, generate the villain texture (about 60 x 76 px): bare chest in a flat skin color, dark red pants, bigger build than the hero. Keep it a simple cartoon, no fine detail.
- `Villain.js`: an Arcade physics sprite standing on the ground at x = 2000, facing left, with a slow idle sway.
- `src/data/dialogue.js`: an array of `{ speaker, text }` lines. Use the placeholder script from the PRD.
- In `GameScene`, add a `state` value (`explore`, `dialogue`, `fight`). When the hero is within 150 px of the villain during `explore`, switch to `dialogue` once.
- On entering `dialogue`: stop the hero, lock A and D, and show a text box at the bottom with the speaker name and line.
- The text types out one letter at a time. Space finishes the current line, and Space again shows the next one.
- After the last line, hide the box and set `state` to `fight`. For now the fight state does nothing except show the text "FIGHT" on screen.
- Show a small hint at the bottom of the screen that always matches what Space does in the current state.

**Do not** add health, punching or villain movement.

**Done when**

- [ ] The villain is visible at the end of the path and looks different from the hero at a glance
- [ ] Dialogue triggers once at about 150 px and never again after it ends
- [ ] The hero cannot move during dialogue
- [ ] Space skips typing first, then advances, and the last line leads to the "FIGHT" text
- [ ] The hint text changes correctly between states

## Part E: The fight

**Goal:** a winnable and losable one-on-one fight that starts when the dialogue ends. Outcomes can be a simple placeholder text until Part F.

**Build**

- When `state` becomes `fight`, lock the camera so both characters stay on screen, and disable jumping. Space now means punch.
- Health: both characters start at 100. Draw two bars at the top of the screen, hero on the left and villain on the right.
- Hero punch: Space, 10 damage, reach 40 px in front of the hero, 0.4 s cooldown. A short arm or body motion shows the punch.
- Villain AI: walk toward the hero until within reach, then punch every 1.5 s. Show a 0.3 s wind-up flash before each punch so the player can walk away to dodge. After being hit, back off briefly.
- Villain punch: 10 damage, reach 40 px, only lands if the hero is still in reach when the wind-up ends.
- Hit feedback on both sides: white flash, 30 px knockback, and a short screen shake.
- Put the tuning numbers (damage, cooldown, attack interval, speed) in one config object at the top of the file so they are easy to change.
- When either health reaches 0, set `state` to `won` or `lost` and show placeholder text "YOU WIN" or "YOU LOSE".

**Do not** build the end screens, restart or sound yet.

**Done when**

- [ ] The fight starts right after the last dialogue line
- [ ] Space punches, the cooldown works, and mashing Space does not break it
- [ ] The villain approaches, telegraphs, and can be dodged by walking away
- [ ] Both health bars drop correctly and hits feel visible
- [ ] The fight can be won and lost, and nothing keeps moving after it ends

## Part F: End screens, restart and polish

**Goal:** a finished game loop with proper win and lose screens, restart, and a final cleanup pass.

**Build**

- `EndScene` receives a result (`won` or `lost`) and shows a title ("Victory" or "Game over") with the line "Press Space to play again".
- Space on the end screen restarts the whole game from `BootScene` with a clean state: full health, hero back at x = 100, dialogue ready to trigger again.
- Make sure no old keys, timers or tweens carry over after a restart.
- Polish, only if time allows and one item at a time: simple sound effects made with the Web Audio API, a fade between scenes, a slight camera zoom when the fight starts.
- Clean up: remove leftover test text, confirm the files match the project layout, and add a short README with how to run and build.

**Do not** add new characters, levels or controls.

**Done when**

- [ ] Winning shows "Victory" and losing shows "Game over"
- [ ] Space restarts, and the second playthrough behaves exactly like the first
- [ ] Restarting five times in a row causes no errors or doubled events
- [ ] `npm run build` succeeds and the built game runs from `dist/`
- [ ] The README explains how to run and deploy the game
