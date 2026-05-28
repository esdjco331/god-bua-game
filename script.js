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
/* 籤詩 */
/* ======================= */

const poems = {
  up: [
    "金光照殿，貴人扶盤。量能若起，紅燭可期。",
    "雲開見日，龍抬頭。守住支撐，順勢而行。",
    "財星高照，主力有意。可留意突破訊號。"
  ],

  mid: [
    "神明笑而不語，盤勢未明。",
    "風吹香煙半邊散，今日宜觀望。",
    "等待方向，比猜方向更重要。"
  ],

  down: [
    "烏雲遮月，宜避鋒芒。",
    "香灰落地，短線有壓。",
    "神鐘低鳴，先保本金。"
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
  particles = Array.from({ length: 90 }, () => ({
    x: Math.random() * W,
    y: Math.random() * H,
    r: Math.random() * 2.5 + 0.5,
    vy: Math.random() * -0.6 - 0.1,
    vx: (Math.random() - 0.5) * 0.3,
    a: Math.random() * 0.6 + 0.1
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
/* 工具 */
/* ======================= */

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
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

  setTimeout(() => {
    stage.classList.remove("throwing");

    const left = Math.random() > 0.5 ? 1 : 0;
    const right = Math.random() > 0.5 ? 1 : 0;

    if (left === 1) {
      leftBua.classList.add("flat");
    }

    if (right === 1) {
      rightBua.classList.add("flat");
    }

    const stock = stockInput.value.trim();
    const target = stock ? `${stock} ` : "";

    /* 聖杯 */
    if (left !== right) {
      document.body.classList.add("blessed");

      resultEl.className = "result up";
      resultEl.innerHTML = "聖杯";

      meaningEl.innerHTML = `神明示意：${target}會漲 📈`;

      poemEl.innerHTML =
        "【上上籤】<br>" +
        pick(poems.up);

      playBell(true);
    }

    /* 笑杯 */
    else if (left === 0 && right === 0) {
      resultEl.className = "result mid";
      resultEl.innerHTML = "笑杯";

      meaningEl.innerHTML = `神明笑而不答：${target}觀望`;

      poemEl.innerHTML =
        "【中平籤】<br>" +
        pick(poems.mid);

      playBell(false);
    }

    /* 哭杯 */
    else {
      document.body.classList.add("doom");

      resultEl.className = "result down";
      resultEl.innerHTML = "哭杯";

      meaningEl.innerHTML = `神明示意：${target}會跌 📉`;

      poemEl.innerHTML =
        "【下下籤】<br>" +
        pick(poems.down);

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
