const PASSCODE_LENGTH = 6;

const dots = Array.from(document.querySelectorAll(".dot"));
const keypad = document.getElementById("keypad");
const dotsEl = document.getElementById("dots");
const cancelBtn = document.getElementById("cancel");
const emergencyBtn = document.getElementById("emergency");
const passcodeScreen = document.getElementById("passcode-screen");
const googleScreen = document.getElementById("google-screen");
const themeColorMeta = document.getElementById("theme-color");
const searchForm = document.getElementById("g-search");
const searchInput = document.getElementById("g-query");
const appsBtn = document.getElementById("g-apps");
const codeSheet = document.getElementById("g-code-sheet");
const codeValue = document.getElementById("g-code-value");
const codeClose = document.getElementById("g-code-close");
const codeReset = document.getElementById("g-code-reset");

let entry = "";
let savedCode = "";
let locked = false;
let unlocked = false;

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

function showGoogle() {
  unlocked = true;
  locked = true;
  savedCode = entry;

  googleScreen.hidden = false;
  void googleScreen.offsetWidth;
  googleScreen.classList.add("visible");

  passcodeScreen.classList.add("unlocking");
  themeColorMeta.setAttribute("content", "#ffffff");
  document.documentElement.style.background = "#fff";
  document.body.style.background = "#fff";

  setTimeout(() => {
    passcodeScreen.classList.add("hidden");
    searchInput.focus({ preventScroll: true });
  }, 400);
}

function hideCodeSheet() {
  codeSheet.hidden = true;
}

function showCodeSheet() {
  codeValue.textContent = savedCode || "------";
  codeSheet.hidden = false;
}

function resetToLockScreen() {
  hideCodeSheet();
  unlocked = false;
  locked = false;
  savedCode = "";
  clearEntry();
  searchInput.value = "";
  searchInput.blur();

  googleScreen.classList.remove("visible");
  passcodeScreen.classList.remove("hidden", "unlocking");

  themeColorMeta.setAttribute("content", "#636464");
  document.documentElement.style.background = "";
  document.body.style.background = "";

  setTimeout(() => {
    googleScreen.hidden = true;
  }, 350);
}

function pressDigit(digit) {
  if (locked || unlocked || entry.length >= PASSCODE_LENGTH) return;

  entry += digit;
  updateDots();

  if (entry.length === PASSCODE_LENGTH) {
    locked = true;
    setTimeout(showGoogle, 220);
  }
}

function deleteDigit() {
  if (locked || unlocked || entry.length === 0) return;
  entry = entry.slice(0, -1);
  updateDots();
}

function setKeyPressed(key, pressed) {
  if (!key) return;
  key.classList.toggle("pressed", pressed);
}

keypad.addEventListener("pointerdown", (e) => {
  const key = e.target.closest(".key");
  if (!key) return;
  setKeyPressed(key, true);
});

keypad.addEventListener("pointerup", (e) => {
  const key = e.target.closest(".key");
  setKeyPressed(key, false);
});

keypad.addEventListener("pointercancel", (e) => {
  const key = e.target.closest(".key");
  setKeyPressed(key, false);
});

keypad.addEventListener("pointerleave", (e) => {
  const key = e.target.closest(".key");
  setKeyPressed(key, false);
});

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

appsBtn.addEventListener("click", (e) => {
  e.preventDefault();
  e.stopPropagation();
  showCodeSheet();
});

/* iOS sometimes drops click on icon buttons — also handle touch */
appsBtn.addEventListener(
  "touchend",
  (e) => {
    e.preventDefault();
    showCodeSheet();
  },
  { passive: false }
);

codeClose.addEventListener("click", hideCodeSheet);
codeReset.addEventListener("click", resetToLockScreen);

codeSheet.addEventListener("click", (e) => {
  if (e.target === codeSheet) hideCodeSheet();
});

searchForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const q = searchInput.value.trim();
  if (!q) return;
  window.open(`https://www.google.com/search?q=${encodeURIComponent(q)}`, "_blank");
});

document.addEventListener("keydown", (e) => {
  if (unlocked) {
    if (e.key === "Escape" && !codeSheet.hidden) hideCodeSheet();
    return;
  }
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
