# Sidebar Suite / dsh-sidebar-expand

Four sidebar plugins in one install — and every component keeps its **own switch** on the Plugins page, so you can turn one off without uninstalling anything.

[中文](README.md) · MIT · Combines [dsh-sidebar-marks](https://github.com/DEVbyQIN/dsh-sidebar-marks), [dsh-active-sessions](https://github.com/DEVbyQIN/dsh-active-sessions), [dsh-sidebar-shortcuts](https://github.com/DEVbyQIN/dsh-sidebar-shortcuts) and [dsh-back-to-chat](https://github.com/DEVbyQIN/dsh-back-to-chat).

## Components

| Component | What it does | Version |
|---|---|---|
| `dsh-sidebar-marks` | Conversation marks: soft tinted row, colored end dot, custom title size; from the row menu, ⌘⇧M or right-click | 0.1.1 |
| `dsh-active-sessions` | Active-session bell beside the Workspace title: breathing dot for running tasks, one panel for running / last-three-days sessions | 0.1.1 |
| `dsh-sidebar-shortcuts` | Folds the workspace header entries into a compact two-column list or an icon grid (Settings → Sidebar shortcuts) | 0.1.0 |
| `dsh-back-to-chat` | “← Back to current chat” on the Plugins, scheduled-task and context-insights pages, keeping the composer draft | 0.1.1 |

All four have zero runtime dependencies. The bundle itself contains no plugin code — it is only a DSH bundle layer (the mechanism for packaging several plugins together).

## Install

Install the bundle once and all four components are in place.

**Desktop GUI**: open **Plugins** in the sidebar → **Add plugin** → enter `dsh-sidebar-expand` → **Enable now**.

**CLI** (any one):

```sh
# The desktop app's bundled CLI (profile is always desktop)
"/Applications/DeepSeek Harness.app/Contents/Resources/runtime/cli/bin/dsh" \
  plugin --profile desktop add dsh-sidebar-expand@0.1.0

# Any dsh CLI with your own profile
dsh plugin --profile web add dsh-sidebar-expand@0.1.0

# From GitHub instead of npm
dsh plugin --profile web add github:DEVbyQIN/dsh-sidebar-expand#v0.1.0
```

After installing, the Plugins page shows one **Sidebar Suite** card.

## Switch components individually

Plugins page → open the **Sidebar Suite** card → the **Included components** list:

- every row has its own **Enable / Disable** switch; disabling one unmounts its host half and browser half immediately (no restart with HMR enabled) while the others keep running;
- a component that ships a configuration page also gets a **Configure** button on its row (for example the shortcut layout options);
- switch state is stored as `disabled` overrides in the profile's `cordis.patch.yml`, so it survives bundle upgrades.

> The plugin list under **Settings → Built-in plugins** is read-only; the real per-component switches live on the Plugins page's bundle detail.

## Do not install the components separately at the same time

The bundle and a standalone component mount two instances of the same package; DSH's client module system rejects two active modules with the same package name (and the UI would duplicate). So uninstall the standalone `dsh-sidebar-marks` / `dsh-active-sessions` / `dsh-sidebar-shortcuts` / `dsh-back-to-chat` before installing this bundle, or vice versa. Need only one or two? Keep the bundle and switch the unwanted rows off.

## Upgrade and uninstall

- Upgrading the bundle upgrades all four pinned component versions (see the table). `CHANGELOG.md` records the mapping.
- Uninstalling removes the four components. To pause one temporarily, use its row switch instead.

## Compatibility

- DSH `0.2.x` (including desktop `0.2.1-rc.4`); Node `^22.19.0 || >=24`.
- The bundle registers no Loader entry and injects no service.

## Develop and self-test

This repository is only a bundle manifest (`package.json` + `cordis.patch.yml` + locale + docs):

```sh
node --test test/verify.mjs   # pinned versions, patch rows, locale, publish file list
npm pack --dry-run            # inspect the published file set
```

## License

MIT
