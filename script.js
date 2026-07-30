const themeButton = document.querySelector("#theme-button");

const savedTheme = localStorage.getItem("davidcraft-theme");

if (savedTheme === "dark") {
  document.body.classList.add("dark");
}

themeButton.addEventListener("click", () => {
  document.body.classList.toggle("dark");

  const currentTheme =
    document.body.classList.contains("dark")
      ? "dark"
      : "light";

  localStorage.setItem("davidcraft-theme", currentTheme);
});
