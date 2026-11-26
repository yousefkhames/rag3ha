// Pure, client-side receipt parsing. Nothing leaves the browser.
(function (root) {
  const POLICIES = { "amazon.eg": 15, "btech": 14, "2b": 14, "talabat": 1, "sharaf": 15, "extra": 15, "ikea": 365, "namshi": 14, "adidas": 30, "puma": 30, "dell": 21, "samsung": 15, "xiaomi": 15, "temu": 90, "lulu": 14, "decathlon": 30, "hm": 30, amazon: 30, noon: 15, jumia: 15, apple: 14, ikea: 365, zara: 30, "h&m": 30, nike: 60, walmart: 90, target: 90, bestbuy: 15, ebay: 30, aliexpress: 15, shein: 45, etsy: 30, costco: 90, "mediamarkt": 14, "carrefour": 14, "other": 30 };
  const MONTHS = { jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5, jul: 6, aug: 7, sep: 8, sept: 8, oct: 9, nov: 10, dec: 11 };
  const AR = "٠١٢٣٤٥٦٧٨٩";
  const norm = s => s.replace(/[٠-٩]/g, d => AR.indexOf(d));
  const iso = d => d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
  function findDate(t) {
    const dm = t.match(/(?:delivered(?: on)?|delivery date|تاريخ التسليم|تم التسليم)[:\s]*(\d{4}-\d{2}-\d{2})/i);
    if (dm) { const x = dm[1].split("-"); return new Date(+x[0], +x[1] - 1, +x[2]); }
    let m = t.match(/(?:order(?:ed)?(?: date| placed)?|date|purchased|on)[:\s]*(\d{4})-(\d{2})-(\d{2})/i) || t.match(/(\d{4})-(\d{2})-(\d{2})/);
    if (m) return new Date(+m[1], +m[2] - 1, +m[3]);
    m = t.match(/(\d{1,2})(?:st|nd|rd|th)?\s+([A-Za-z]{3,9})\.?,?\s+(\d{4})/);
    if (m && MONTHS[m[2].slice(0, 4).toLowerCase()] !== undefined || m && MONTHS[m[2].slice(0, 3).toLowerCase()] !== undefined)
      return new Date(+m[3], MONTHS[m[2].slice(0, 3).toLowerCase()], +m[1]);
    m = t.match(/([A-Za-z]{3,9})\.?\s+(\d{1,2})(?:st|nd|rd|th)?,?\s+(\d{4})/);
    if (m && MONTHS[m[1].slice(0, 3).toLowerCase()] !== undefined) return new Date(+m[3], MONTHS[m[1].slice(0, 3).toLowerCase()], +m[2]);
    m = t.match(/(\d{1,2})[\/.](\d{1,2})[\/.](\d{4})/);
    if (m) { let a = +m[1], b = +m[2]; const day = a > 12 ? a : (b > 12 ? b : a), mon = a > 12 ? b : (b > 12 ? a : b); return new Date(+m[3], mon - 1, day); }
    return null;
  }
  function findStore(t, from) {
    const hay = (t + " " + (from || "")).toLowerCase();
    for (const k of Object.keys(POLICIES)) if (k !== "other" && hay.includes(k)) return k;
    const m = (from || "").match(/@([a-z0-9-]+)\./i);
    return m ? m[1].toLowerCase() : "other";
  }
  function findWindow(t) {
    let m = norm(t).match(/(\d{1,3})[\s-]*(?:day|days|يوم|أيام)[^.\n]{0,40}(?:return|refund|exchange|استرجاع|ارجاع|إرجاع)/i) ||
            norm(t).match(/(?:return|refund|exchange|استرجاع|ارجاع|إرجاع)[^.\n]{0,60}?(\d{1,3})[\s-]*(?:day|days|يوم|أيام)/i) ||
            norm(t).match(/within\s+(\d{1,3})\s+days/i);
    return m ? +m[1] : null;
  }
  function findAmount(t) {
    const t0 = norm(t);
    const m = t0.match(/(?:total|grand total|amount|الإجمالي|المجموع)[:\s=-]{0,6}((?:EGP|USD|EUR|GBP|SAR|AED|\$|€|£|ج\.م)?\s?[\d,]+(?:\.\d{1,2})?\s?(?:EGP|USD|EUR|GBP|SAR|AED|ج\.م)?)/i);
    return m ? m[1].trim() : "";
  }
  function findItem(t) {
    const m = t.match(/(?:item|product|items?|المنتج)[:\s]+([^\n]{3,80})/i);
    return m ? m[1].trim() : "";
  }
  function findOrder(t) { const m = t.match(/order\s*(?:#|no\.?|number|id)?[:\s#]*([A-Z0-9-]{5,})/i); return m ? m[1] : ""; }
  function findExplicit(t) {
    const m = t.match(/(?:return(?:s)? (?:by|before|until|deadline)|returnable (?:until|by)|last day to return|آخر موعد للاسترجاع|الاسترجاع حتى)[:\s]*(\d{4}-\d{2}-\d{2}|\d{1,2}(?:st|nd|rd|th)?\s+[A-Za-z]{3,9}\.?,?\s+\d{4}|[A-Za-z]{3,9}\.?\s+\d{1,2}(?:st|nd|rd|th)?,?\s+\d{4})/i);
    if (!m) return null; const d = findDate(m[1]); return d ? iso(d) : null;
  }
  function parse(text, from) {
    const store = findStore(text, from);
    const win = findWindow(text);
    const d = findDate(text); const ex = findExplicit(text);
    if (ex && d) { const days = Math.round((new Date(ex + "T12:00:00") - new Date(iso(d) + "T12:00:00")) / 864e5); if (days > 0) return { store, purchased: iso(d), windowDays: days, windowSource: "receipt", amount: findAmount(text), item: findItem(text), order: findOrder(text), explicitDeadline: ex }; }
    return { store, purchased: d ? iso(d) : "", windowDays: win || POLICIES[store] || 30, windowSource: win ? "receipt" : "default policy", amount: findAmount(text), item: findItem(text), order: findOrder(text) };
  }
  function deadline(purchased, days) { const d = new Date(purchased + "T12:00:00"); d.setDate(d.getDate() + days); return iso(d); }
  function daysLeft(dl, now) { const a = new Date(dl + "T12:00:00"), b = new Date((now || new Date()).toDateString() + " 12:00:00"); return Math.round((a - b) / 864e5); }
  function ics(items) {
    const L = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Rag3ha//EN"];
    items.filter(i => !i.done && i.deadline).forEach(i => {
      const d = i.deadline.replace(/-/g, "");
      L.push("BEGIN:VEVENT", "UID:" + i.id + "@rag3ha", "DTSTAMP:" + new Date().toISOString().replace(/[-:]|\.\d{3}/g, ""), "DTSTART;VALUE=DATE:" + d,
        "SUMMARY:Return deadline: " + (i.item || i.store).replace(/[,;\n]/g, " "), "DESCRIPTION:Store " + i.store + " order " + (i.order || "-"),
        "BEGIN:VALARM", "TRIGGER:-P3D", "ACTION:DISPLAY", "DESCRIPTION:Return window closes in 3 days", "END:VALARM", "END:VEVENT");
    });
    L.push("END:VCALENDAR"); return L.join("\r\n");
  }
  function split(text) { return text.split(/\n\s*-{3,}\s*\n/).map(x => x.trim()).filter(x => x.length > 15); }
  function fromEml(raw) {
    const hd = raw.split(/\r?\n\r?\n/)[0]; const f = (hd.match(/^From:.*$/im) || [""])[0].replace(/^From:\s*/i, "");
    const sub = (hd.match(/^Subject:.*$/im) || [""])[0].replace(/^Subject:\s*/i, "");
    let body = raw.slice(hd.length).replace(/<style[\s\S]*?<\/style>/gi, "").replace(/<[^>]+>/g, " ").replace(/=\r?\n/g, "").replace(/&nbsp;/g, " ").replace(/&amp;/g, "&");
    return { from: (f.match(/[\w.+-]+@[\w.-]+/) || [f])[0], text: sub + "\n" + body };
  }
  const api = { split, fromEml, parse, deadline, daysLeft, ics, POLICIES };
  if (typeof module !== "undefined") module.exports = api; else root.Rag = api;
})(typeof window !== "undefined" ? window : globalThis);
