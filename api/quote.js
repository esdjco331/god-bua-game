export default async function handler(req, res) {
  const code = String(req.query.code || "").trim();

  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Cache-Control", "no-store");

  if (!/^\d{4,6}$/.test(code)) {
    return res.status(400).json({ error: "股票代號錯誤" });
  }

  try {
    const url =
      `https://mis.twse.com.tw/stock/api/getStockInfo.jsp?ex_ch=tse_${code}.tw|otc_${code}.tw&json=1&delay=0&_=${Date.now()}`;

    const r = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0",
        "Referer": "https://mis.twse.com.tw/stock/index.jsp"
      }
    });

    const data = await r.json();

    if (!data.msgArray || data.msgArray.length === 0) {
      return res.status(404).json({ error: "查無即時行情" });
    }

    const item = data.msgArray.find(x => x.c === code);

    if (!item) {
      return res.status(404).json({ error: "查無股票資料" });
    }

    const clean = v => {
      if (!v || v === "-" || v === "_") return NaN;
      return Number(String(v).replace(/,/g, ""));
    };

    let price = clean(item.z);
    const yesterday = clean(item.y);
    const volume = clean(item.v);

    if (isNaN(price)) {
      price =
        clean(item.a?.split("_")[0]) ||
        clean(item.b?.split("_")[0]);
    }

    const change =
      !isNaN(price) && !isNaN(yesterday)
        ? price - yesterday
        : 0;

    const percent =
      !isNaN(yesterday) && yesterday !== 0
        ? change / yesterday * 100
        : 0;

    return res.status(200).json({
      code: item.c,
      name: item.n || "",
      price,
      change,
      percent,
      volume,
      source: "MIS"
    });

  } catch (e) {
    return res.status(500).json({
      error: "即時行情查詢失敗",
      detail: e.message
    });
  }
}
