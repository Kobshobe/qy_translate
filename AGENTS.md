# QY Translate — Agent Instructions

## 🌐 Language

- **Default language: English**. All code, comments, docs, commit messages, and agent responses should be in English.
- i18n user-facing strings are the only exception — those go in `src/_locales/`.

## ✅ Task Completion Checklist

After completing a task, always:

1. **Build** — run `pnpm build` to ensure the project compiles without errors.
2. **Test** — if the change affects the extension's UI or behavior, use `playwright-cli` to verify it works in the browser.

## Preview the Extension

```bash
playwright-cli open "chrome://extensions/" --headed --persistent
```

If the extension is not loaded, prompt the user to manually load it.

### Extension name

The extension is named **"轻氧翻译" (QY Translate)** — locate it by name in the
snapshot when working on `chrome://extensions/`.

## playwright-cli
Always use the default session — never pass `-s`/`-session`;
run commands like `playwright-cli open`, `playwright-cli goto`, `playwright-cli eval`
without a session flag so they target the default session.

## ❗ Browser Preview — Keep Open

Do **NOT** run `close` or `close-all` on the browser opened by `playwright-cli open`.
It is left open for manual visual review. Only close stale headless sessions if a new
one was spawned.

```bash
# ✅ Correct: leave browser open after actions
playwright-cli goto "http://..."

# ❌ Wrong: do not close
playwright-cli close
```
