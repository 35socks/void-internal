# Suite

A private, static creative + homelab workspace. 40 small apps, no build step, no backend.
Runs from any static host (GitHub Pages) or by opening `index.html` locally.

```
index.html          home / launcher
assets/suite.css    shared look
assets/suite.js     shell, storage, S3 sync, CRUD + helpers
<app>/index.html    one folder per app  →  /bookmarks/, /cam/, /demos/ …
```

## Deploy (GitHub Pages)
1. Make this folder the root of a repo.
2. Settings → Pages → Source: **GitHub Actions** (the included workflow deploys it), or "Deploy from branch".
3. Visit `https://<you>.github.io/<repo>/`.

## Where your data lives
- Everything is stored **in your browser** (localStorage + IndexedDB). Nothing is sent anywhere by default.
- **Settings → Local backup** exports/imports one JSON file.
- **Settings → Cloud storage** syncs that same backup to your S3 bucket (`suite/backup.json`) and powers **Demo Vault** (`demos/`).

## Connecting S3 (once)
Never put AWS keys in this repo. Enter them in Settings; they are kept only in your browser.
1. Create a **new** IAM user (not an old/leaked key) with the policy shown in Settings (limited to `suite/`, `demos/`, `media/`).
2. Paste the CORS JSON shown in Settings into the bucket's CORS config (origin = your Pages URL).
3. Settings → paste bucket, region, access key, secret → *Save & test*.

## Notes
- The passcode is a convenience lock for the UI, not encryption. Use **Vault** for secrets (AES-256-GCM, separate master password, no recovery).
- Data is per-browser. Use cloud sync or backups to move between devices.
- Lab Launcher reachability checks only work for services your browser can reach; an https page cannot probe plain `http://` hosts (mixed content).
