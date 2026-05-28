const canvas = document.getElementById("particles");
const ctx = canvas.getContext("2d");

const kCanvas = document.getElementById("kline");
const kCtx = kCanvas.getContext("2d");

const stage = document.getElementById("stage");
const leftBua = document.getElementById("leftBua");
const rightBua = document.getElementById("rightBua");

const throwBtn = document.getElementById("throwBtn");
const resultEl = document.getElementById("result");
const meaningEl = document.getElementById("meaning");
const poemEl = document.getElementById("poem");

const stockInput = document.getElementById("stockInput");
const clearBtn = document.getElementById("clearBtn");

const godLight = document.getElementById("godLight");
const godSymbol = document.getElementById("godSymbol");

let W = 0;
let H = 0;
let particles = [];
let audioCtx = null;

/* ======================= */
/* 股票中文名 */
/* ======================= */

const stockNames = {
  "2330":"台積電",
  "2317":"鴻海",
  "2454":"聯發科",
  "2308":"台達電",
  "2412":"中華電",
  "2881":"富邦金",
  "2882":"國泰金",
  "2891":"中信金",
  "2886":"兆豐金",
  "2603":"長榮",
  "2609":"陽明",
  "2615":"萬海",
  "2618":"長榮航",
  "2303":"聯電",
  "2002":"中鋼",
  "1301":"台塑",
  "1303":"南亞",
  "3008":"大立光",
  "3034":"聯詠",
  "3711":"日月光投控",
  "3450":"聯鈞",
  "4722":"國精化",
  "4542":"科嶠",
  "2382":"廣達",
  "2357":"華碩",
  "6669":"緯穎",
  "3231":"緯創",
  "2327":"國巨",
  "2498":"宏達電",
  "6446":"藥華藥",
  "3661":"世芯-KY",
  "3443":"創意",
  "5274":"信驊"
};

/* ======================= */
/* 籤詩 */
/* ======================= */

const poems = {
  up: [
    "金光照殿，貴人扶盤。量能若起，紅燭可期。",
    "雲開見日，龍抬頭。守住支撐，順勢而行。",
    "財星高照，主力有意。可留意突破訊號。",
    "香煙直上，福星入局。明日若開高放量，宜順勢觀察。"
  ],

  mid: [
    "神明笑而不語，盤勢未明。先看量價，再定進退。",
    "風吹香煙半邊散，今日宜觀望，不宜重倉。",
    "等待方向，比猜方向更重要。盤勢未定，勿急躁。",
    "籤中有變，心中莫急。守株待兔，反得其時。"
  ],

  down: [
    "烏雲遮月，宜避鋒芒。若跌破支撐，先保本金。",
    "香灰落地，短線有壓。莫戀戰，留得青山在。",
    "神鐘低鳴，盤中多震。嚴守停損，勿與趨勢硬拚。",
    "黑雲壓城，財氣暫退。明日宜保守，勿貪快利。"
  ]
};

/* ======================= */
/* 畫面尺寸 */
/* ======================= */

function resize() {
  W = canvas.width = kCanvas.width = window.innerWidth;
  H = canvas.height = kCanvas.height = window.innerHeight;
}

resize();
window.addEventListener("resize", resize);

/* ======================= */
/* 金色粒子 */
/* ======================= */

function createParticles() {
  particles = Array.from({ length: 110 }, () => ({
    x: Math.random() * W,
    y: Math.random() * H,
    r: Math.random() * 2.6 + 0.5,
    vy: Math.random() * -0.65 - 0.12,
    vx: (Math.random() - 0.5) * 0.35,
    a: Math.random() * 0.65 + 0.12
  }));
}

createParticles();

function drawParticles() {
  ctx.clearRect(0, 0, W, H);

  particles.forEach((p) => {
    p.x += p.vx;
    p.y += p.vy;

    if (p.y < -20) {
      p.y = H + 20;
      p.x = Math.random() * W;
    }

    ctx.beginPath();
    ctx.fillStyle = `rgba(255,180,50,${p.a})`;
    ctx.shadowBlur = 16;
    ctx.shadowColor = "rgba(255,180,30,.9)";
    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    ctx.fill();
  });

  ctx.shadowBlur = 0;

  requestAnimationFrame(drawParticles);
}

drawParticles();

/* ======================= */
/* K 線背景 */
/* ======================= */

function drawKline() {
  kCtx.clearRect(0, 0, W, H);

  const gap = 22;

  for (let x = 0; x < W; x += gap) {
    const h = 26 + Math.random() * 95;

    const y =
      H * 0.68 +
      Math.sin((x + Date.now() / 25) / 55) * 80;

    const isUp = Math.random() > 0.5;

    kCtx.strokeStyle = isUp
      ? "rgba(255,30,30,.5)"
      : "rgba(0,230,90,.5)";

    kCtx.fillStyle = isUp
      ? "rgba(255,30,30,.25)"
      : "rgba(0,230,90,.25)";

    kCtx.beginPath();
    kCtx.moveTo(x + 5, y - h * 0.75);
    kCtx.lineTo(x + 5, y + h * 0.75);
    kCtx.stroke();

    kCtx.fillRect(x, y - h / 2, 10, h);
  }
}

setInterval(drawKline, 420);
drawKline();

/* ======================= */
/* 音效 */
/* ======================= */

function getAudioContext() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }

  return audioCtx;
}

function playThrowSound() {
  const ac = getAudioContext();
  const now = ac.currentTime;

  for (let i = 0; i < 7; i++) {
    const osc = ac.createOscillator();
    const gain = ac.createGain();

    osc.type = "triangle";
    osc.frequency.setValueAtTime(160 + i * 38, now + i * 0.045);

    gain.gain.setValueAtTime(0.08, now + i * 0.045);
    gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.16);

    osc.connect(gain).connect(ac.destination);

    osc.start(now + i * 0.045);
    osc.stop(now + i * 0.18);
  }
}

function playBell(good = false) {
  const ac = getAudioContext();
  const now = ac.currentTime;

  const notes = good ? [523, 784, 1046] : [392, 330, 261];

  notes.forEach((freq, i) => {
    const osc = ac.createOscillator();
    const gain = ac.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(freq, now + i * 0.13);

    gain.gain.setValueAtTime(0.001, now + i * 0.13);
    gain.gain.exponentialRampToValueAtTime(0.13, now + i * 0.16);
    gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.9);

    osc.connect(gain).connect(ac.destination);

    osc.start(now + i * 0.13);
    osc.stop(now + i * 0.95);
  });
}

/* ======================= */
/* 神明降駕 */
/* ======================= */

function godDescend() {
  godLight.classList.remove("descend");
  godSymbol.classList.remove("descend");

  void godLight.offsetWidth;

  godLight.classList.add("descend");
  godSymbol.classList.add("descend");
}

/* ======================= */

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

const stockNameCache = {};

async function getStockDisplay() {
  const code = stockInput.value.trim();

  if (!code) {
    return "此股";
  }

  if (stockNameCache[code]) {
    return `${code} ${stockNameCache[code]}`;
  }

  const url =
    `https://mis.twse.com.tw/stock/api/getStockInfo.jsp?ex_ch=tse_${code}.tw|otc_${code}.tw&json=1&delay=0&_=${Date.now()}`;

  try {
    const res = await fetch(url);
    const data = await res.json();

    if (data.msgArray && data.msgArray.length > 0) {
      const item = data.msgArray.find(x => x.c === code);

      if (item && item.n) {
        stockNameCache[code] = item.n;
        return `${code} ${item.n}`;
      }
    }
  } catch (e) {
    console.log("查詢股名失敗", e);
  }

  return code;
}

/* ======================= */
/* 擲筊 */
/* ======================= */

function throwBua() {
  throwBtn.disabled = true;

  document.body.className = "";

  leftBua.classList.remove("flat");
  rightBua.classList.remove("flat");

  stage.classList.remove("throwing");

  resultEl.className = "result";
  resultEl.innerHTML = "神明降駕中...";
  meaningEl.innerHTML = "香火升起，請稍候";
  poemEl.innerHTML = "";

  godDescend();
  playThrowSound();

  void stage.offsetWidth;

  stage.classList.add("throwing");

  setTimeout(async () => {
    stage.classList.remove("throwing");

    const left = Math.random() > 0.5 ? 1 : 0;
    const right = Math.random() > 0.5 ? 1 : 0;

    if (left === 1) {
      leftBua.classList.add("flat");
    }

    if (right === 1) {
      rightBua.classList.add("flat");
    }

    const stockDisplay = await getStockDisplay();

    if (left !== right) {
      document.body.classList.add("blessed");

      resultEl.className = "result up";
      resultEl.innerHTML = "聖杯";

      meaningEl.innerHTML =
        `您所求的「${stockDisplay}」明天神明示意：有機會上漲 📈`;

      poemEl.innerHTML =
        "【上上籤】<br>" + pick(poems.up);

      playBell(true);
    }

    else if (left === 0 && right === 0) {
      resultEl.className = "result mid";
      resultEl.innerHTML = "笑杯";

      meaningEl.innerHTML =
        `您所求的「${stockDisplay}」明天神明笑而不答：宜先觀望`;

      poemEl.innerHTML =
        "【中平籤】<br>" + pick(poems.mid);

      playBell(false);
    }

    else {
      document.body.classList.add("doom");

      resultEl.className = "result down";
      resultEl.innerHTML = "哭杯";

      meaningEl.innerHTML =
        `您所求的「${stockDisplay}」明天神明示意：恐有下跌壓力 📉`;

      poemEl.innerHTML =
        "【下下籤】<br>" + pick(poems.down);

      playBell(false);
    }

    throwBtn.disabled = false;

    

  }, 1450);
}

/* ======================= */
/* 事件 */
/* ======================= */

throwBtn.addEventListener("click", throwBua);

clearBtn.addEventListener("click", () => {
  stockInput.value = "";
  stockInput.focus();
});

stockInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    throwBua();
  }
});
