export default async function handler(req, res) {
  let input = String(req.query.code || req.query.q || "").trim();

  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Cache-Control", "no-store");

  if (!input) {
    return res.status(400).json({ error: "請輸入股票代號或股票名稱" });
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

  const getFirstPrice = (str) => {
    if (!str) return NaN;

    const arr = String(str).split("_");

    for (const v of arr) {
      const n = clean(v);
      if (Number.isFinite(n) && n > 0) return n;
    }

    return NaN;
  };

  const getBestPrice = (item) => {
    const prices = [
      clean(item.z),
      clean(item.pz),
      getFirstPrice(item.a),
      getFirstPrice(item.b),
      clean(item.y)
    ];

    for (const p of prices) {
      if (Number.isFinite(p) && p > 0) return p;
    }

    return NaN;
  };

  const nameToCode = async (keyword) => {
    const sources = [
      "https://openapi.twse.com.tw/v1/exchangeReport/STOCK_DAY_ALL",
      "https://www.tpex.org.tw/openapi/v1/tpex_mainboard_quotes",
      "https://www.tpex.org.tw/openapi/v1/tpex_esb_latest_statistics"
    ];

    const getCode = (x) => {
      return String(
        x.Code ||
        x.SecuritiesCompanyCode ||
        x.SecuritiesCode ||
        x.StockCode ||
        x.CompanyCode ||
        x["證券代號"] ||
        x["股票代號"] ||
        x["公司代號"] ||
        x["代號"] ||
        ""
      ).trim();
    };

    const getNameText = (x) => {
      return Object.values(x)
        .filter((v) => typeof v === "string")
        .join(" ");
    };

    const normalizeText = (s) => {
      return String(s || "")
        .replace(/\s+/g, "")
        .trim();
    };

    const kw = normalizeText(keyword);

    for (const url of sources) {
      try {
        const r = await fetch(url, {
          headers: {
            "User-Agent": "Mozilla/5.0"
          }
        });

        if (!r.ok) continue;

        const data = await r.json();

        if (!Array.isArray(data)) continue;

        const exact = data.find((x) => {
          const code = getCode(x);
          const text = normalizeText(getNameText(x));

          return /^\d{4,6}$/.test(code) && text === kw;
        });

        const contains = data.find((x) => {
          const code = getCode(x);
          const text = normalizeText(getNameText(x));

          return /^\d{4,6}$/.test(code) && text.includes(kw);
        });

        const reverseContains = data.find((x) => {
          const code = getCode(x);
          const text = normalizeText(getNameText(x));

          return /^\d{4,6}$/.test(code) && kw.includes(text);
        });

        const item = exact || contains || reverseContains;

        if (item) {
          return getCode(item);
        }

      } catch (e) {
        console.log("股票名稱轉代號失敗", url, e.message);
      }
    }

    return null;
  };

  try {
    let code = input;

    if (!/^\d{4,6}$/.test(code)) {
      const foundCode = await nameToCode(code);

      if (!foundCode) {
        return res.status(404).json({
          error: "查無股票名稱",
          keyword: input
        });
      }

      code = foundCode;
    }

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
      candidates.find((x) => getBestPrice(x) > 0) ||
      candidates[0];

    const price = getBestPrice(item);
    const yesterday = clean(item.y);
    const volume = clean(item.v);

    if (!Number.isFinite(price) || price <= 0) {
      return res.status(404).json({ error: "即時價格異常" });
    }

    if (!Number.isFinite(yesterday) || yesterday <= 0) {
      return res.status(404).json({ error: "昨收價格異常" });
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
