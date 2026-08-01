const sidebar = document.getElementById("sidebar");
const sidebarOpen = document.getElementById("sidebar-open");
const sidebarClose = document.getElementById("sidebar-close");
const sidebarOverlay = document.getElementById("sidebar-overlay");

function openSidebar() {
  if (!sidebar || !sidebarOverlay) {
    return;
  }

  sidebar.classList.add("open");
  sidebarOverlay.hidden = false;

  document.body.classList.add("sidebar-is-open");

  sidebarOpen?.setAttribute("aria-expanded", "true");
}

function closeSidebar() {
  if (!sidebar || !sidebarOverlay) {
    return;
  }

  sidebar.classList.remove("open");
  sidebarOverlay.hidden = true;

  document.body.classList.remove("sidebar-is-open");

  sidebarOpen?.setAttribute("aria-expanded", "false");
}

sidebarOpen?.addEventListener("click", openSidebar);
sidebarClose?.addEventListener("click", closeSidebar);
sidebarOverlay?.addEventListener("click", closeSidebar);

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeSidebar();
  }
});

window.addEventListener("resize", () => {
  if (window.innerWidth > 900) {
    closeSidebar();
  }
});
