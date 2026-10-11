# Turbopack chunk loader: full-document `querySelectorAll` per chunk

Minimal reproduction for a main-thread cost in the Turbopack browser runtime.

Before loading a chunk, `runtime-backend-dom.ts` checks whether a tag for it already exists:

```js
document.querySelectorAll(
  `script[src="${chunkUrl}"],script[src^="${chunkUrl}?"],script[src="${decodedChunkUrl}"],script[src^="${decodedChunkUrl}?"]`
)
```

Attribute and prefix selectors walk the whole document, and the check runs once per chunk, so boot cost grows with
`DOM elements × chunks`.

## The app

- `app/page.jsx` renders `?n=<elements>` static elements (default 4000) next to 80 client widgets.
- `components/Widgets.jsx` loads each widget with `next/dynamic`, so every widget is its own async chunk that the
  runtime loads during hydration.

## Run

```sh
npm install
npx playwright install chromium
npm run build
npm start            # http://localhost:3123
npm run measure      # in a second terminal
```

`scripts/measure.mjs` wraps `Document.prototype.querySelectorAll`, times only calls with the runtime's selector
shape, and loads the page at 500 / 2000 / 4000 / 8000 elements with CPU throttling 1x and 4x (3 runs each).

## Result (next 16.5.0-canary.8, Chromium, median of 3)

| CPU | DOM elements | Probe calls | Time in the probe |
|---|---|---|---|
| 4x | 761 | 82 | 30.8 ms |
| 4x | 2,261 | 82 | 76.4 ms |
| 4x | 4,261 | 82 | 115.7 ms |
| 4x | 8,261 | 82 | 229.9 ms |
| 1x | 4,261 | 82 | 22.2 ms |

The time scales linearly with DOM size at a fixed chunk count.
