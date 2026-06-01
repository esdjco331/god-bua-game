export default async function handler(req, res) {
  const code = String(req.query.code || "").trim();

  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Cache-Control", "no-store");

  if (!/^\d{4,6}$/.test(code)) {
    return res.status(400).json({ error: "股票代號錯誤" });
  }

  const clean = (v) => {
    if (v === undefined || v === null) return NaN;
    if (v === "" || v === "-" || v === "_" || v === "0.0000") return NaN;

    const n = Number(String(v).replace(/,/g, ""));
    return Number.isFinite(n) ? n : NaN;
  };

  const round2 = (n) => {
    if (!Number.isFinite(n)) return NaN;
    return Math.round(n * 100) / 100;
  };

  try {
    const url =
      `https://mis.twse.com.tw/stock/api/getStockInfo.jsp?ex_ch=tse_${code}.tw|otc_${code}.tw&json=1&delay=0&_=${Date.now()}`;

    const r = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0",
        "Referer": "https://mis.twse.com.tw/stock/index.jsp"
      }
    });

    if (!r.ok) {
      return res.status(502).json({
        error: "MIS 行情來源連線失敗",
        status: r.status
      });
    }

    const data = await r.json();

    if (!data.msgArray || data.msgArray.length === 0) {
      return res.status(404).json({ error: "查無即時行情" });
    }

    const candidates = data.msgArray.filter((x) => x.c === code);

    if (candidates.length === 0) {
      return res.status(404).json({ error: "查無股票資料" });
    }

    const item =
      candidates.find((x) => clean(x.z) > 0) ||
      candidates.find((x) => clean(x.pz) > 0) ||
      candidates[0];

    let price = clean(item.z);

    if (!Number.isFinite(price) || price <= 0) {
      price = clean(item.pz);
    }

    const yesterday = clean(item.y);
    const volume = clean(item.v);

    if (!Number.isFinite(price) || price <= 0) {
      return res.status(404).json({
        error: "即時價格異常"
      });
    }

    if (!Number.isFinite(yesterday) || yesterday <= 0) {
      return res.status(404).json({
        error: "昨收價格異常"
      });
    }

    const change = price - yesterday;
    const percent = (change / yesterday) * 100;

    return res.status(200).json({
      code: item.c,
      name: item.n || "",
      price: round2(price),
      change: round2(change),
      percent: round2(percent),
      volume: Number.isFinite(volume) ? Math.round(volume) : null,
      volumeUnit: "張",
      market: item.ex || "",
      source: "MIS"
    });

  } catch (e) {
    return res.status(500).json({
      error: "即時行情查詢失敗",
      detail: e.message
    });
  }
}
