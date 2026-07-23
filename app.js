const PASSCODE_LENGTH = 6;

const dots = Array.from(document.querySelectorAll(".dot"));
const keypad = document.getElementById("keypad");
const dotsEl = document.getElementById("dots");
const cancelBtn = document.getElementById("cancel");
const emergencyBtn = document.getElementById("emergency");

let entry = "";
let locked = false;

/* iOS PWA often undersizes 100vh/dvh — pin to real window height */
function syncViewportHeight() {
  const h = Math.round(
    Math.max(window.innerHeight, window.visualViewport?.height || 0)
  );
  if (h > 0) {
    document.documentElement.style.setProperty("--app-height", `${h}px`);
  }
}

syncViewportHeight();
window.addEventListener("resize", syncViewportHeight);
window.addEventListener("orientationchange", syncViewportHeight);
window.visualViewport?.addEventListener("resize", syncViewportHeight);
window.visualViewport?.addEventListener("scroll", syncViewportHeight);

function updateDots() {
  dots.forEach((dot, i) => {
    dot.classList.toggle("filled", i < entry.length);
  });
  cancelBtn.textContent = entry.length > 0 ? "Delete" : "Cancel";
}

function clearEntry() {
  entry = "";
  updateDots();
}

function shakeAndClear() {
  locked = true;
  dotsEl.classList.add("shake");
  setTimeout(() => {
    dotsEl.classList.remove("shake");
    clearEntry();
    locked = false;
  }, 400);
}

function pressDigit(digit) {
  if (locked || entry.length >= PASSCODE_LENGTH) return;

  entry += digit;
  updateDots();

  if (entry.length === PASSCODE_LENGTH) {
    // Placeholder: wrong passcode shake for now — real unlock later
    setTimeout(shakeAndClear, 180);
  }
}

function deleteDigit() {
  if (locked || entry.length === 0) return;
  entry = entry.slice(0, -1);
  updateDots();
}

keypad.addEventListener("click", (e) => {
  const key = e.target.closest(".key");
  if (!key) return;
  pressDigit(key.dataset.digit);
});

cancelBtn.addEventListener("click", () => {
  if (entry.length > 0) {
    deleteDigit();
  }
});

emergencyBtn.addEventListener("click", () => {
  // Placeholder for later
});

document.addEventListener("keydown", (e) => {
  if (e.key >= "0" && e.key <= "9") {
    pressDigit(e.key);
  } else if (e.key === "Backspace") {
    deleteDigit();
  } else if (e.key === "Escape") {
    clearEntry();
  }
});

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("sw.js").catch(() => {});
  });
}
