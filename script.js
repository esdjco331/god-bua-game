const canvas =
document.getElementById("particles");

const ctx =
canvas.getContext("2d");

const kCanvas =
document.getElementById("kline");

const kCtx =
kCanvas.getContext("2d");

const stage =
document.getElementById("stage");

const leftBua =
document.getElementById("leftBua");

const rightBua =
document.getElementById("rightBua");

const throwBtn =
document.getElementById("throwBtn");

const resultEl =
document.getElementById("result");

const meaningEl =
document.getElementById("meaning");

const poemEl =
document.getElementById("poem");

const stockInput =
document.getElementById("stockInput");

const clearBtn =
document.getElementById("clearBtn");

let W = 0;
let H = 0;

let particles = [];

/* ======================= */
/* 籤詩 */
/* ======================= */

const poems = {

  up:[
    "金光照殿，貴人扶盤。量能若起，紅燭可期。",
    "雲開見日，龍抬頭。守住支撐，順勢而行。",
    "財星高照，主力有意。可留意突破訊號。"
  ],

  mid:[
    "神明笑而不語，盤勢未明。",
    "風吹香煙半邊散，今日宜觀望。",
    "等待方向，比猜方向更重要。"
  ],

  down:[
    "烏雲遮月，宜避鋒芒。",
    "香灰落地，短線有壓。",
    "神鐘低鳴，先保本金。"
  ]
};

/* ======================= */

function resize(){

  W =
  canvas.width =
  kCanvas.width =
  window.innerWidth;

  H =
  canvas.height =
  kCanvas.height =
  window.innerHeight;
}

resize();

window.addEventListener(
  "resize",
  resize
);

/* ======================= */
/* 金色粒子 */
/* ======================= */

function createParticles(){

  particles =
  Array.from(
    {length:90},
    ()=>({

      x:Math.random()*W,

      y:Math.random()*H,

      r:Math.random()*2.5+.5,

      vy:Math.random()*-.6-.1,

      vx:(Math.random()-.5)*.3,

      a:Math.random()*.6+.1
    })
  );
}

createParticles();

function drawParticles(){

  ctx.clearRect(0,0,W,H);

  particles.forEach(p=>{

    p.x += p.vx;
    p.y += p.vy;

    if(p.y < -20){

      p.y = H + 20;
      p.x = Math.random()*W;
    }

    ctx.beginPath();

    ctx.fillStyle =
    `rgba(255,180,50,${p.a})`;

    ctx.shadowBlur = 16;

    ctx.shadowColor =
    "rgba(255,180,30,.9)";

    ctx.arc(
      p.x,
      p.y,
      p.r,
      0,
      Math.PI*2
    );

    ctx.fill();
  });

  requestAnimationFrame(
    drawParticles
  );
}

drawParticles();

/* ======================= */
/* K線背景 */
/* ======================= */

function drawKline(){

  kCtx.clearRect(0,0,W,H);

  const gap = 22;

  for(
    let x=0;
    x<W;
    x+=gap
  ){

    const h =
    26 + Math.random()*95;

    const y =
    H*.68 +
    Math.sin(
      (x+Date.now()/25)/55
    )*80;

    const up =
    Math.random() > .5;

    kCtx.strokeStyle =
    up
    ? "rgba(255,30,30,.5)"
    : "rgba(0,230,90,.5)";

    kCtx.fillStyle =
    up
    ? "rgba(255,30,30,.25)"
    : "rgba(0,230,90,.25)";

    kCtx.beginPath();

    kCtx.moveTo(
      x+5,
      y-h*.75
    );

    kCtx.lineTo(
      x+5,
      y+h*.75
    );

    kCtx.stroke();

    kCtx.fillRect(
      x,
      y-h/2,
      10,
      h
    );
  }
}

setInterval(
  drawKline,
  420
);

/* ======================= */
/* 擲筊 */
/* ======================= */

function pick(arr){

  return arr[
    Math.floor(
      Math.random()*arr.length
    )
  ];
}

function throwBua(){

  leftBua.classList.remove("flat");

  rightBua.classList.remove("flat");

  resultEl.className =
  "result";

  resultEl.innerHTML =
  "神明降駕中...";

  meaningEl.innerHTML =
  "香火升起，請稍候";

  poemEl.innerHTML = "";

  setTimeout(()=>{

    let left =
    Math.random() > .5 ? 1 : 0;

    let right =
    Math.random() > .5 ? 1 : 0;

    if(left)
      leftBua.classList.add("flat");

    if(right)
      rightBua.classList.add("flat");

    const stock =
    stockInput.value.trim();

    const target =
    stock
    ? stock + " "
    : "";

    /* 聖杯 */

    if(left !== right){

      resultEl.className =
      "result up";

      resultEl.innerHTML =
      "聖杯";

      meaningEl.innerHTML =
      `神明示意：${target}會漲 📈`;

      poemEl.innerHTML =
      "【上上籤】<br>" +
      pick(poems.up);
    }

    /* 笑杯 */

    else if(
      left === 0 &&
      right === 0
    ){

      resultEl.className =
      "result mid";

      resultEl.innerHTML =
      "笑杯";

      meaningEl.innerHTML =
      `神明笑而不答：${target}觀望`;

      poemEl.innerHTML =
      "【中平籤】<br>" +
      pick(poems.mid);
    }

    /* 哭杯 */

    else{

      resultEl.className =
      "result down";

      resultEl.innerHTML =
      "哭杯";

      meaningEl.innerHTML =
      `神明示意：${target}會跌 📉`;

      poemEl.innerHTML =
      "【下下籤】<br>" +
      pick(poems.down);
    }

  },900);
}

/* ======================= */

throwBtn.addEventListener(
  "click",
  throwBua
);

clearBtn.addEventListener(
  "click",
  ()=>{

    stockInput.value = "";
  }
);
