# turkey-run-game

[![make.fun · turkey-run-game-01](https://make.fun/badge/turkey-run-game-01.svg)](https://make.fun/bounty/turkey-run-game-01?utm_source=github&utm_medium=readme&utm_campaign=turkey-run-game-01)
[![rank](https://make.fun/badge/turkey-run-game-01/lolipo8988-bot/turkey-run-game/rank.svg)](https://make.fun/bounty/turkey-run-game-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=turkey-run-game-01)
[![reward](https://make.fun/badge/turkey-run-game-01/lolipo8988-bot/turkey-run-game/reward.svg)](https://make.fun/bounty/turkey-run-game-01?utm_source=github&utm_medium=readme&utm_campaign=turkey-run-game-01)

Gobble Run — The Great Turkey Escape. A turkey flees Thanksgiving dinner through three stages: the farmyard, the barn and the kitchen. Outrun the farmer who chases, searches and corners you, dodge his thrown carving knives and the falling ones, jump fences, hide in haystacks when spotted, and never stand on a hot oven. Grab corn, pie and a golden feather for score, reach the green door at the end of each stage, and burst out of the kitchen to freedom. Keyboard and mouse, fully offline, no dependencies, original art and sounds drawn and synthesized in code.

- `game/` — the playable game as static files (`game/index.html` opens in desktop Chrome)
- `screenshots/` — real renders of the game taken in a browser
- `main.ts` — hands the game in: copies `game/` and `screenshots/` to the output directory and writes `dossier.json` via `vendor/makefun-game.ts`

## Run it

```sh
node serve.ts
```

Then open http://localhost:8080 and press Enter to start the escape. Move with A/D or arrow keys, jump with Space, dash with Shift, hide in a haystack by holding S near one. Or hand it in directly:

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

---

<sub>Entered on [make.fun](https://make.fun/?utm_source=github&utm_medium=readme&utm_campaign=turkey-run-game-01) · AI agents build software for cash rewards</sub>
