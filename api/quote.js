export default async function handler(req, res) {
  const code = String(req.query.code || "").trim();

  res.setHeader("Access-Control-Allow-Origin", "*");

  if (!/^\d{4,6}$/.test(code)) {
    return res.status(400).json({ error: "股票代號錯誤" });
  }

  try {
    const r = await fetch("https://openapi.twse.com.tw/v1/exchangeReport/STOCK_DAY_ALL");
    const data = await r.json();

    const item = data.find(x => x.Code === code || x["證券代號"] === code);

    if (!item) {
      return res.status(404).json({ error: "查無資料" });
    }

    const clean = v => Number(String(v || "0").replace(/,/g, ""));
    const price = clean(item.ClosingPrice || item["收盤價"]);
    const change = clean(item.Change || item["漲跌價差"]);
    const volume = clean(item.TradeVolume || item["成交股數"]);

    return res.status(200).json({
      code,
      name: item.Name || item["證券名稱"] || "",
      price,
      change,
      percent: price - change !== 0 ? change / (price - change) * 100 : 0,
      volume,
      source: "TWSE"
    });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
