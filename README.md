# Taplux Template

Your Taplux site. Vanilla HTML/CSS/JS + Core-as-Service: the constructor logic
lives on Taplux's CDN and loads via `js/core-loader.js` (the only code file in
this repo).

---

## 🚀 Quick Start

1. **Use this template** — click "Use this template" on GitHub to create your own repo.
2. **Fill in `_meta.github_repo`** in `data.json` (see below).
3. **Deploy to Vercel** — import the repo, click Deploy. Your site is live at `your-repo.vercel.app`.
4. **Manage content** at **[admin.taplux.ru](https://admin.taplux.ru)** using your license key (no PAT, no local admin — all through Hosted Admin).

---

## 🔑 Step 1: Set your GitHub repository in `data.json`

Open `data.json` and replace the placeholder in the `_meta` block:

```json
{
  "_meta": {
    "github_repo": "your-username/your-repo-name"
  },
  ...
}
```

Use the format `owner/repo` (e.g. `mfipstart/my-taplux-site`).
**This is required** — without it, the constructor will refuse to load.

> **Where do I get this?** It's the `owner/repo` part of your GitHub URL:
> `https://github.com/`**`your-username/your-repo-name`**`/`

---

## 🌍 Multi-Site Setup: one repo → many Vercel projects

**Need 10 different landing pages for 10 affiliate programs? No problem.**

Taplux licenses bind to a GitHub repository, not to a domain. So one repo
= one license, and you can create as many Vercel projects as you want
from the same repo.

### Structure

```
your-taplux-repo/
├── sites/
│   ├── arb-1/                  ← Vercel Project "arb-1"
│   │   ├── index.html
│   │   ├── data.json
│   │   └── vercel.json
│   ├── arb-2/                  ← Vercel Project "arb-2"
│   │   ├── index.html
│   │   ├── data.json
│   │   └── vercel.json
│   └── arb-3/
│       └── ...
└── README.md
```

### How to add a new site

1. **In GitHub**: create a folder `sites/your-site-name/` and copy `index.html` + `data.json` + `vercel.json` from any existing site (or from the template root).
2. **Edit `data.json`** inside that folder — set `_meta.github_repo` to the same `owner/repo` as your main site.
3. **In Vercel**: New Project → Import `your-taplux-repo` → in "Configure Project" set **Root Directory** to `sites/your-site-name`. Click Deploy.
4. **Edit content** at `admin.taplux.ru` — the Hosted Admin will let you pick which site to manage.

All sites deploy from the same GitHub repo (one commit → all redeploy), all
share the same license, and each can have its own multi-page structure
(`/page1`, `/page2`, etc.).

### URL Slug Multi-Page (per site)

Each Vercel project supports URL slugs (multi-page) independently. The
`vercel.json` rewrites everything to `index.html` for SPA routing:

```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

Inside `data.json`, define pages with their slugs (`index`, `about`,
`contacts`, etc.) — they'll be accessible as `/`, `/about`, `/contacts`.

---

## 📂 What's where

- `data.json` — your content (blocks, pages, design, license).
- `index.html` — minimal shell, loads the core via `js/core-loader.js`.
- `vercel.json` — SPA rewrites for URL slugs.
- `js/core-loader.js` — thin loader that fetches the licensed core bundle from the Taplux CDN.

---

## 🆘 Troubleshooting

- **"License is not bound to any repository"** — you forgot to set `_meta.github_repo` in `data.json`. See Step 1.
- **"License is bound to another repository"** — the `github_repo` in `data.json` doesn't match what the License Server has. Check spelling, check the Hosted Admin dashboard.
- **"Invalid origin for this repository"** — you're opening the site from a non-Vercel domain. Use the `*.vercel.app` URL Vercel gave you, or `localhost` for local dev.
- **Multi-page (URL slugs) not working** — make sure `vercel.json` is in the same folder as `index.html` for that site.

---

## 📖 More info

- Taplux landing: [https://taplux.ru](https://taplux.ru)
- Hosted Admin: [https://admin.taplux.ru](https://admin.taplux.ru)
- Plan & strategy (Obsidian Brain): `Taplux — Phase M5 Multi-Site лицензирование.md`
