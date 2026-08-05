# QY Translate

A minimalistic, efficient translation extension for Chrome.

**Documentation:** [English](docs/Instructions/Instructions(English).md) | [简体中文](docs/Instructions/使用说明(简体中文).md) | [繁體中文](docs/Instructions/使用說明(繁体中文).md)

## Install

| Store | Link |
|-------|------|
| Chrome Web Store | [Download](https://chrome.google.com/webstore/detail/fjldhjdclpmehigldnbgbllchcjdgccc) |
| Edge Add-ons | [Download](https://microsoftedge.microsoft.com/addons/detail/%E8%BD%BB%E6%B0%A7%E7%BF%BB%E8%AF%91/gldjnohpkhoipopkgkoepimoaoekhioo) |

## Features

- Web page translation with bilingual display
- Select-to-translate on any web page
- Quick word query via popup or shortcut (`Alt + K` / `⌘ + K`)
- Multiple translation engines (Baidu, Google, etc.)
- AI large model translation (DeepSeek, OpenAI, Claude, MiniMax, GLM, Qwen, etc.) with custom API endpoints, models, and prompts
- PDF translation support
- Vocabulary collection

## Development

Built with **Vue 3** and **TypeScript**.

### Setup

```bash
pnpm install
```

### Build for production

```bash
pnpm build
```

### Development mode

```bash
# Watch frontend sources
pnpm watch

# Watch background.js
pnpm bg:watch
```

Then load the `dist` folder as an unpacked extension in `chrome://extensions`.

## Contact

Email: phraseanywhere@outlook.com
