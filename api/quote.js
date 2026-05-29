export default async function handler(req, res) {
  const code = String(req.query.code || "").trim();

  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Cache-Control", "s-maxage=10, stale-while-revalidate=30");

  if (!/^\d{4,6}$/.test(code)) {
    return res.status(400).json({ error: "股票代號錯誤" });
  }

  try {
    const url = "https://openapi.twse.com.tw/v1/exchangeReport/STOCK_DAY_ALL";
    const r = await fetch(url);
    const data = await r.json();

    const item = data.find(x => x.Code === code || x["證券代號"] === code);

    if (!item) {
      return res.status(404).json({ error: "查無資料" });
    }

    const price = Number(String(item.ClosingPrice || item["收盤價"] || "0").replace(/,/g, ""));
    const change = Number(String(item.Change || item["漲跌價差"] || "0").replace(/,/g, ""));
    const volume = Number(String(item.TradeVolume || item["成交股數"] || "0").replace(/,/g, ""));

    const percent = price - change !== 0 ? change / (price - change) * 100 : 0;

    return res.status(200).json({
      code,
      name: item.Name || item["證券名稱"] || "",
      price,
      change,
      percent,
      volume,
      source: "TWSE_PROXY"
    });

  } catch (err) {
    return res.status(500).json({
      error: "行情 proxy 失敗",
      detail: err.message
    });
  }
}
