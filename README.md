# BlinkX Editor Vite Plugin

A Vite plugin for bundling Monaco editor workers when using the BlinkX editor.

## Installation

```bash
npm install @blinkx/editor-vite
```

## Usage

Add to your `vite.config.js` / `vite.config.ts`:

```js
import { defineConfig } from 'vite';
import blinkEditorMonacoWorkers from '@blinkx/editor-vite';

export default defineConfig({
  plugins: [
    blinkEditorMonacoWorkers({
      // options (optional)
    })
  ]
});
```

## Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| sourceDir | string | 'node_modules/@blinkx/editor/dist/workers' | Source directory where Monaco workers are located |
| assetsSubdir | string | 'assets' | Subdirectory within the build output where workers should be copied |
| extensions | string[] | ['.js'] | File extensions to copy |

## License

MIT
