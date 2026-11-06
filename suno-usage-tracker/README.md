# Suno Usage Tracker

A small Chrome extension that shows a **Suno free account's usage**, an estimate of how many **generations** are left, and a rough countdown to the daily reset.

```
80/100 used today
20 left today + 25 backup = 4 generations left
Resets in ~14 h
```

A "generation" is one press of Create, which gives you 2 songs.

> ## ⚠️ Unsupported, AI-made, use at your own risk
> - This extension was **written by Claude (an AI made by Anthropic)** at the request of a Suno user, and tested only on that user's free account in Chrome.
> - It is **unofficial and unsupported**. It is not affiliated with or endorsed by Suno or Anthropic.
> - It has **not been reviewed by a professional developer**. There are no promises of fixes, updates or replies to issues.
> - Suno can change their site at any time and break it. It only reads data that Suno's own website already loads for you.

## Install (no coding needed)

1. Click the green **Code** button on this page, then **Download ZIP**, and unzip it.
2. In Chrome, go to `chrome://extensions`.
3. Turn on **Developer mode** (top right).
4. Click **Load unpacked** and select the unzipped folder (the one containing `manifest.json`).
5. Click the puzzle-piece icon in Chrome's toolbar and pin **Suno Usage Tracker**.
6. Open (or reload) **suno.com** while logged in. The extension only learns your numbers once the site has loaded them.
7. Click the extension's icon.

**Updating:** replace the files in the folder, then press the reload arrow on the extension at `chrome://extensions`.

**Troubleshooting**
- *"Open suno.com once to load":* reload suno.com while logged in, then reopen the popup.
- *Numbers stop updating:* press **Refresh** in the popup, or reload suno.com.
- *Still nothing:* see "Make your own" below. Suno has probably changed something.

## What it shows

| Popup line | Where it comes from |
|---|---|
| `80/100 used today` | `monthly_usage` / `monthly_limit` in Suno's `billing/info` response |
| `+ 25 backup` | the `credits` field in the same response |
| `4 generations left` | (limit − usage + credits) ÷ 10, rounded down |
| `Resets in ~14 h` | time until 00:00 UTC, worked out from your computer's clock |

The icon badge shows the generations-left number.

The reset timer works the same for anyone in any country, since it counts down to a fixed UTC moment and shows the time remaining. It will be wrong if your plan resets on a different schedule.

## What was found (and what wasn't verified)

These are observations from **one free account**, not guarantees.

- `monthly_usage` / `monthly_limit` **reset daily** despite the names. Usage counts up from 0 and returned to 0 at about midnight UTC.
- `credits` behaves like a **separate backup balance**. It didn't move while the daily allowance was being used, started dropping only after usage hit the limit, and did not refill at the daily reset. Whether it is monthly or a one-off bonus is unknown.
- **One generation cost 10 credits** (2 songs), consistently. Extras like extending or editing may cost more, so "generations left" is an estimate.
- Suno's help centre says free credits replenish daily on UTC and lists a free tier of 50 credits a day. The tested account showed a limit of 100, so other accounts and plans may differ.

## Privacy

- It stores only a few numbers (usage, limit, credits, time of last update) in your browser's extension storage.
- It only runs on `suno.com`. Nothing is sent anywhere else. No analytics or tracking.
- Your login token is used in memory only, to re-request the same `billing/info` address the site itself uses. It is never saved or sent elsewhere.

## Settings you may want to change

The cost per generation is set at the top of both `popup.js` and `background.js`:

```js
const COST = 10; // credits per generation (2 songs)
```

Change both if your account uses a different cost.

---

# Make your own (or fix this one)

If Suno changes things, or you want to build something similar for another site, this is how it was made. You don't need to be a programmer, and an AI assistant can do the coding if you give it the right information.

## 1. Find where the site gets its numbers

1. Log in at suno.com and press **F12** to open DevTools.
2. Click the **Network** tab, tick **Preserve log**, and click the **Fetch/XHR** filter.
3. Reload the page. Type `billing`, `credit` or `usage` in the filter box.
4. Click each entry, then its **Response** tab. Look for numbers that match what you expect.
5. Generate a song and see which numbers change and by how much.
6. Note the **Request URL** of the entry (Headers tab).

**What to share with an AI assistant:** the Request URL and the response text.

**What not to share:** `Bearer eyJ...` tokens, cookies, captcha tokens, your email, user ID or birthday. Blank those out of anything you post, including screenshots.

## 2. How this extension is built

| File | Job |
|---|---|
| `manifest.json` | Declares the extension, permissions, and which scripts run on suno.com |
| `inject.js` | Runs inside the page. Wraps `window.fetch` to spot the site's own `billing/info` request, copies the response, and re-requests it after you generate and once a minute |
| `bridge.js` | Receives numbers from `inject.js` and saves them to extension storage |
| `background.js` | Sets the badge number on the icon |
| `popup.html`, `popup.js` | The window you see when clicking the icon, including the reset timer |

Key design choices:
- `inject.js` runs in the page's own context (`"world": "MAIN"` in the manifest) so it can see the site's requests and use the site's login helper.
- It copies the site's own request instead of hard-coding the address, so it still works if the address's host changes.
- A fresh login token is requested from the site's login library (`window.Clerk.session.getToken()`) for each re-request, because tokens expire quickly.
- Only numbers are stored, never tokens.

## 3. Prompt to give an AI assistant if it breaks

> This Chrome extension (files attached) reads Suno's `billing/info` response to show usage. It's stopped working. Here is the current Request URL and response from DevTools [paste, with any tokens removed], and any red Console errors. Please update the extension and walk me through reloading it step by step. I don't code.

## Licence

MIT. See `LICENSE`.
