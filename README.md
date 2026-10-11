# Dirt & Clouds

A 2D side-scrolling browser game built with **Phaser 3** and **Vite** (vanilla JavaScript).

A blue-shirted hero walks along a dirt path under drifting parallax clouds and trees, encounters a shirtless villain, engages in a short dialogue, and brawls in a one-on-one fight. All graphics are generated procedurally in code without external image asset files, and sound effects are synthesized in real-time via the Web Audio API.

---

## Controls

The entire game is played using only three keys:

| Key | Exploring | In Dialogue | In Fight | End Screen |
| :--- | :--- | :--- | :--- | :--- |
| **A** | Walk left | *Disabled* | Walk left | *Nothing* |
| **D** | Walk right | *Disabled* | Walk right | *Nothing* |
| **Space** | Jump | Advance / skip typing | Punch | Restart |

An on-screen hint at the bottom of the screen always reflects the current action for the **Space** key.

---

## Project Structure

```text
mygame/
├── index.html                  # Centered game canvas container
├── src/
│   ├── main.js                 # Phaser 3 game initialization & config
│   ├── style.css               # Dark theme page centering styles
│   ├── scenes/
│   │   ├── BootScene.js        # Procedural texture generator (dirt, clouds, trees, characters)
│   │   ├── GameScene.js        # Core game loop: explore, dialogue, and fight state machine
│   │   └── EndScene.js         # Victory & Game Over screen with restart logic
│   ├── entities/
│   │   ├── Hero.js             # Player physics sprite, walk bob, landing squash, combat
│   │   └── Villain.js          # Enemy physics sprite, idle sway, telegraph AI, combat
│   ├── data/
│   │   ├── dialogue.js         # Scripted dialogue lines
│   │   └── fightConfig.js      # Combat tuning parameters (damage, reach, speeds, cooldowns)
│   └── utils/
│       └── audio.js            # Procedural Web Audio API sound effects
└── package.json
```

---

## Getting Started

### Prerequisites
- Node.js (v18 or higher recommended)
- npm

### Installation
Clone the repository and install dependencies:
```bash
npm install
```

### Development
Start the local development server with Hot Module Replacement (HMR):
```bash
npm run dev
```
Open your browser at the local URL printed in your terminal (typically `http://localhost:5173/`).

### Production Build
Build the minified production assets into the `dist/` directory:
```bash
npm run build
```

Preview the production build locally:
```bash
npm run preview
```

---

## Deployment to GitHub Pages

If deploying to **GitHub Pages**, create a `vite.config.js` file at the root of the project with the `base` property set to your repository name:

```javascript
import { defineConfig } from 'vite';

export default defineConfig({
  base: '/<repository-name>/', // Replace with your repository name
});
```

Then run `npm run build` and publish the generated `dist/` folder to GitHub Pages (or use a GitHub Actions workflow).
