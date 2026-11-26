# Rag3ha (رجّعها)
Paste a purchase receipt, get the return deadline, a countdown, and calendar reminders. Free, bilingual (English/Arabic RTL), and private: parsing runs in your browser and nothing is uploaded.

## Privacy and honest limits
- It never connects to your inbox. You paste text. A Gmail/Outlook connector would need OAuth and a server you trust, so it is a roadmap item, not included.
- Parsing is rule-based (store, date, total, "N days" phrases, Arabic digits). It is a helper: always check the review screen. If no window is in the text, it uses a default per store, which may be wrong.
- Data lives in localStorage on this device. Export/import JSON to move it.
- `server/server.js` is an optional static server plus opaque-blob sync endpoint. The web client does not use sync yet; encrypt client-side before adding it.

## What changed over 10 polish rounds
Parser (delivery dates, EGP, Egyptian stores), accessibility (skip link, labels, live regions), mobile layout, edit/filter/summary, opt-in reminders, Arabic polish (Arabic-Indic digits, Arabic store names), installable offline PWA, light/dark theme, multi-receipt and .eml import, strict Content-Security-Policy (no external connections), how-it-works section.

## Run
`npm test` then `npm start` (port 8080). The site in `docs/` is static and works on GitHub Pages.

Roadmap: Gmail/Outlook "paste forwarded email" import, encrypted sync, warranty dates, browser notifications.
## License
MIT
