(() => {
  const THEME_KEY = "davidcraft-theme";

  const navItems = [
    { key: "main", label: "Main", icon: "◆", href: "index.html" },
    { key: "home", label: "Home", icon: "🏠", href: "home.html" },
    { key: "ai", label: "AI", icon: "🤖", href: "ai.html" },
    { key: "maps", label: "Maps", icon: "🗺️", href: "maps.html" },
    { key: "music", label: "Music", icon: "🎵", href: "music.html" },
    { key: "shows", label: "Shows", icon: "📺", href: "shows.html" },
    { key: "photos", label: "Photos", icon: "📷", href: "photos.html" },
    { key: "play", label: "Play", icon: "🎮", href: "play.html" }
  ];

  const systemThemeQuery =
    window.matchMedia("(prefers-color-scheme: dark)");

  function getSelectedTheme() {
    const saved = localStorage.getItem(THEME_KEY);

    return ["light", "dark", "system"].includes(saved)
      ? saved
      : "system";
  }

  function getVisibleTheme(choice) {
    if (choice === "system") {
      return systemThemeQuery.matches ? "dark" : "light";
    }

    return choice;
  }

  function applyTheme(choice) {
    const selected = ["light", "dark", "system"].includes(choice)
      ? choice
      : "system";

    localStorage.setItem(THEME_KEY, selected);

    document.documentElement.setAttribute(
      "data-theme",
      getVisibleTheme(selected)
    );

    updateThemeButton(selected);
  }

  function updateThemeButton(choice) {
    const themeButton = document.getElementById("dc-theme-button");

    if (!themeButton) {
      return;
    }

    const label =
      choice === "light"
        ? "☀ Light"
        : choice === "dark"
          ? "☾ Dark"
          : "◐ System";

    themeButton.textContent = label;
    themeButton.setAttribute(
      "aria-label",
      `Current theme: ${choice}. Change theme`
    );
  }

  function cycleTheme() {
    const current = getSelectedTheme();

    const next =
      current === "light"
        ? "dark"
        : current === "dark"
          ? "system"
          : "light";

    applyTheme(next);
  }

  function buildLinks(activePage) {
    return navItems.map((item) => {
      const active = item.key === activePage ? " active" : "";

      return `
        <a class="dc-nav-link${active}" href="${item.href}">
          <span aria-hidden="true">${item.icon}</span>
          <span>${item.label}</span>
        </a>
      `;
    }).join("");
  }

  function injectNavigation() {
    const mount = document.getElementById("davidcraft-navbar");

    if (!mount) {
      return;
    }

    const activePage =
      document.body.dataset.davidcraftPage || "";

    const links = buildLinks(activePage);

    mount.innerHTML = `
      <header class="dc-navbar">
        <button
          id="dc-menu-button"
          class="dc-nav-button dc-menu-button"
          type="button"
          aria-label="Open navigation"
          aria-expanded="false"
        >
          ☰
        </button>

        <a class="dc-brand" href="index.html">
          DavidCraft <span>Platform</span>
        </a>

        <nav class="dc-nav-links" aria-label="DavidCraft applications">
          ${links}
        </nav>

        <div class="dc-nav-actions">
          <a
            class="dc-nav-button dc-account-link"
            href="account.html"
          >
            👤 Account
          </a>

          <button
            id="dc-theme-button"
            class="dc-nav-button"
            type="button"
          >
            ◐ System
          </button>
        </div>
      </header>

      <div
        id="dc-mobile-overlay"
        class="dc-mobile-overlay"
        hidden
      ></div>

      <aside
        id="dc-mobile-drawer"
        class="dc-mobile-drawer"
        aria-hidden="true"
      >
        <div class="dc-mobile-header">
          <a class="dc-brand" href="index.html">
            DavidCraft <span>Platform</span>
          </a>

          <button
            id="dc-mobile-close"
            class="dc-mobile-close"
            type="button"
            aria-label="Close navigation"
          >
            ×
          </button>
        </div>

        <nav class="dc-mobile-links" aria-label="Mobile navigation">
          ${links}

          <a class="dc-nav-link" href="account.html">
            <span aria-hidden="true">👤</span>
            <span>Account</span>
          </a>
        </nav>
      </aside>
    `;

    const menuButton =
      document.getElementById("dc-menu-button");

    const drawer =
      document.getElementById("dc-mobile-drawer");

    const overlay =
      document.getElementById("dc-mobile-overlay");

    const closeButton =
      document.getElementById("dc-mobile-close");

    const themeButton =
      document.getElementById("dc-theme-button");

    function openDrawer() {
      drawer.classList.add("open");
      drawer.setAttribute("aria-hidden", "false");
      overlay.hidden = false;
      document.body.classList.add("dc-no-scroll");
      menuButton.setAttribute("aria-expanded", "true");
    }

    function closeDrawer() {
      drawer.classList.remove("open");
      drawer.setAttribute("aria-hidden", "true");
      overlay.hidden = true;
      document.body.classList.remove("dc-no-scroll");
      menuButton.setAttribute("aria-expanded", "false");
    }

    menuButton.addEventListener("click", openDrawer);
    closeButton.addEventListener("click", closeDrawer);
    overlay.addEventListener("click", closeDrawer);
    themeButton.addEventListener("click", cycleTheme);

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        closeDrawer();
      }
    });

    window.addEventListener("resize", () => {
      if (window.innerWidth > 900) {
        closeDrawer();
      }
    });

    updateThemeButton(getSelectedTheme());
  }

  applyTheme(getSelectedTheme());

  systemThemeQuery.addEventListener("change", () => {
    if (getSelectedTheme() === "system") {
      applyTheme("system");
    }
  });

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", injectNavigation);
  } else {
    injectNavigation();
  }
})();
