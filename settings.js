const THEME_STORAGE_KEY = "davidcraft-theme";

const settingsButton =
  document.getElementById("settings-button");

const settingsPanel =
  document.getElementById("settings-panel");

const settingsOverlay =
  document.getElementById("settings-overlay");

const settingsClose =
  document.getElementById("settings-close");

const themeOptions =
  document.querySelectorAll("[data-theme-choice]");

const systemThemeQuery =
  window.matchMedia("(prefers-color-scheme: dark)");

let selectedTheme =
  localStorage.getItem(THEME_STORAGE_KEY) || "system";

function getVisibleTheme(themeChoice) {
  if (themeChoice === "system") {
    return systemThemeQuery.matches ? "dark" : "light";
  }

  return themeChoice;
}

function updateSelectedOption() {
  themeOptions.forEach((button) => {
    const active =
      button.dataset.themeChoice === selectedTheme;

    button.classList.toggle("active", active);
    button.setAttribute("aria-pressed", String(active));
  });
}

function applyTheme(themeChoice) {
  const validThemes = ["light", "dark", "system"];

  if (!validThemes.includes(themeChoice)) {
    themeChoice = "system";
  }

  selectedTheme = themeChoice;

  document.documentElement.setAttribute(
    "data-theme",
    getVisibleTheme(themeChoice)
  );

  localStorage.setItem(
    THEME_STORAGE_KEY,
    themeChoice
  );

  updateSelectedOption();
}

function openSettings() {
  if (!settingsPanel || !settingsOverlay) {
    return;
  }

  settingsPanel.classList.add("open");
  settingsPanel.setAttribute("aria-hidden", "false");

  settingsOverlay.hidden = false;

  document.body.classList.add("settings-is-open");

  settingsButton?.setAttribute("aria-expanded", "true");

  settingsClose?.focus();
}

function closeSettings() {
  if (!settingsPanel || !settingsOverlay) {
    return;
  }

  settingsPanel.classList.remove("open");
  settingsPanel.setAttribute("aria-hidden", "true");

  settingsOverlay.hidden = true;

  document.body.classList.remove("settings-is-open");

  settingsButton?.setAttribute("aria-expanded", "false");
}

settingsButton?.addEventListener("click", () => {
  closeSidebar();
  openSettings();
});

settingsClose?.addEventListener("click", closeSettings);
settingsOverlay?.addEventListener("click", closeSettings);

themeOptions.forEach((button) => {
  button.addEventListener("click", () => {
    applyTheme(button.dataset.themeChoice);
  });
});

document.addEventListener("keydown", (event) => {
  if (
    event.key === "Escape" &&
    settingsPanel?.classList.contains("open")
  ) {
    closeSettings();
  }
});

systemThemeQuery.addEventListener("change", () => {
  if (selectedTheme === "system") {
    applyTheme("system");
  }
});

applyTheme(selectedTheme);
