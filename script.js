// ============================================================
//  The AI GUY – WiFi Card Generator
//  Change your links here. Everything on the page picks them up.
// ============================================================
const LINKS = {
  youtube: "https://www.youtube.com/@The_AI_gUi", // <- put your real channel URL
  telegram: "https://t.me/+ftkLjIBFmAo0OTVl", // <- put your real group invite URL
  github: "https://github.com/The-AI-gUi",
};

const $ = (s) => document.querySelector(s);

const el = {
  ssid: $("#ssid"),
  pass: $("#password"),
  security: $("#security"),
  hidden: $("#hidden"),
  showPass: $("#show-pass"),
  togglePw: $("#toggle-pw"),
  card: $("#card"),
  tilt: $("#tilt"),
  stage: $("#stage"),
  outSsid: $("#out-ssid"),
  outPass: $("#out-pass"),
  qrWifi: $("#qr-wifi"),
  qrBox: $("#qr-box"),
  qrBack: $("#qr-back"),
  backTitle: $("#back-title"),
  backHandle: $("#back-handle"),
  toast: $("#toast"),
};

/* ---------- fill every link on the page ---------- */
document.querySelectorAll("[data-link]").forEach((a) => {
  a.href = LINKS[a.dataset.link];
});
$("#year").textContent = new Date().getFullYear();

/* ---------- WiFi QR string (escape \ ; , : ") ---------- */
const esc = (s) => s.replace(/([\\;,:"])/g, "\\$1");

function wifiString() {
  const ssid = el.ssid.value.trim() || "Your network";
  const type = el.security.value;
  const pass = type === "nopass" ? "" : esc(el.pass.value);
  const hidden = el.hidden.checked ? "H:true;" : "";
  return type === "nopass"
    ? `WIFI:T:nopass;S:${esc(ssid)};${hidden};`
    : `WIFI:T:${type};S:${esc(ssid)};P:${pass};${hidden};`;
}

function renderFront() {
  const hasName = el.ssid.value.trim().length > 0;
  const open = el.security.value === "nopass";

  el.outSsid.textContent = hasName ? el.ssid.value.trim() : "Your network";
  el.outPass.textContent = el.pass.value || "••••••••";
  el.qrWifi.value = wifiString();
  el.qrBox.classList.toggle("idle", !hasName);

  el.pass.disabled = open;
  el.card.classList.toggle("no-pass", open || !el.showPass.checked);
}

/* ---------- back of the card ---------- */
function renderBack() {
  const which = document.querySelector('input[name="back"]:checked').value;
  const url = LINKS[which];
  el.qrBack.value = url;
  el.backTitle.textContent =
    which === "telegram" ? "Join the Telegram group" : "Watch on YouTube";
  el.backHandle.textContent = url.replace(/^https?:\/\/(www\.)?/, "");
}

/* ---------- wire up inputs ---------- */
["input", "change"].forEach((evt) => {
  [el.ssid, el.pass, el.security, el.hidden, el.showPass].forEach((n) =>
    n.addEventListener(evt, renderFront),
  );
});
document.querySelectorAll('input[name="back"]').forEach((r) => {
  r.addEventListener("change", () => {
    renderBack();
    el.card.classList.add("flipped");
  });
});

el.togglePw.addEventListener("click", () => {
  const show = el.pass.type === "password";
  el.pass.type = show ? "text" : "password";
  el.togglePw.textContent = show ? "Hide" : "Show";
  el.togglePw.setAttribute("aria-pressed", String(show));
});

/* ---------- flip ---------- */
$("#flip").addEventListener("click", () => el.card.classList.toggle("flipped"));
el.card.addEventListener("dblclick", () => el.card.classList.toggle("flipped"));

/* ---------- 3D tilt + holographic sheen ---------- */
const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

if (!reduce) {
  el.stage.addEventListener("pointermove", (e) => {
    const r = el.stage.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width;
    const py = (e.clientY - r.top) / r.height;
    el.tilt.style.setProperty("--ry", `${(px - 0.5) * 16}deg`);
    el.tilt.style.setProperty("--rx", `${(0.5 - py) * 12}deg`);
    el.card.style.setProperty("--mx", `${px * 100}%`);
    el.card.style.setProperty("--my", `${py * 100}%`);
    el.card.style.setProperty("--bx", `${px * 100}%`);
  });
  el.stage.addEventListener("pointerleave", () => {
    el.tilt.style.setProperty("--rx", "0deg");
    el.tilt.style.setProperty("--ry", "0deg");
  });
}

/* ---------- print ---------- */
function toast(msg) {
  el.toast.textContent = msg;
  el.toast.classList.add("show");
  setTimeout(() => el.toast.classList.remove("show"), 2400);
}

$("#print").addEventListener("click", () => {
  if (!el.ssid.value.trim()) {
    el.ssid.focus();
    toast("Add a network name first");
    return;
  }
  window.print();
});

// keep the QR sharp at print size
const sizes = new Map();
window.addEventListener("beforeprint", () => {
  [el.qrWifi, el.qrBack].forEach((q) => {
    sizes.set(q, q.size);
    q.size = 120;
  });
});
window.addEventListener("afterprint", () => {
  sizes.forEach((s, q) => {
    q.size = s;
  });
});

/* ---------- first paint ---------- */
renderFront();
renderBack();
