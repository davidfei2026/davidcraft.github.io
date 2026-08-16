"use strict";

/*
===========================================
NOVA CODE
No external libraries.
iPad-safe buttons.
===========================================
*/


/* ==========================================
   PROJECT
========================================== */

const files = {
  "index.html": `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>NOVA Project</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>

  <div class="card">
    <h1>Hello from NOVA</h1>
    <p>Edit the code and press Run.</p>

    <button id="helloButton">
      Click Me
    </button>
  </div>

  <script src="script.js"><\/script>
</body>
</html>`,

  "style.css": `body {
  margin: 0;
  min-height: 100vh;

  display: grid;
  place-items: center;

  font-family: Arial, sans-serif;

  background: #eef2f7;
}

.card {
  width: min(500px, 85%);
  padding: 40px;

  text-align: center;

  background: white;

  border-radius: 18px;

  box-shadow:
    0 15px 40px rgba(0,0,0,.12);
}

button {
  padding: 12px 18px;

  border: 0;
  border-radius: 9px;

  background: #2563eb;
  color: white;

  font-weight: 700;
}`,

  "script.js": `document
  .getElementById("helloButton")
  .addEventListener("click", function () {

    alert("NOVA is working!");

  });`
};


/* ==========================================
   STATE
========================================== */

let currentFile = "index.html";

let openTabs = [
  "index.html"
];


/* ==========================================
   ELEMENTS
========================================== */

const editor =
  document.getElementById("editor");

const lineNumbers =
  document.getElementById("lineNumbers");

const fileList =
  document.getElementById("fileList");

const tabs =
  document.getElementById("tabs");

const preview =
  document.getElementById("preview");

const status =
  document.getElementById("status");

const bottomContent =
  document.getElementById("bottomContent");

const messages =
  document.getElementById("messages");

const explorer =
  document.getElementById("explorer");


/* ==========================================
   BUTTON HELPER

   We deliberately use ONE click handler.
   Modern iPad browsers convert touch taps
   into click events correctly.
========================================== */

function onButton(id, fn) {

  const element =
    document.getElementById(id);

  if (!element) {
    console.error("Missing button:", id);
    return;
  }

  element.addEventListener(
    "click",
    function (event) {

      event.preventDefault();

      fn(event);

    },
    false
  );

}


/* ==========================================
   STATUS
========================================== */

function setStatus(text) {

  status.textContent =
    text;

}


/* ==========================================
   LINE NUMBERS
========================================== */

function updateLineNumbers() {

  const count =
    editor.value.split("\n").length;

  let html = "";

  for (let i = 1; i <= count; i++) {

    html +=
      `<div>${i}</div>`;

  }

  lineNumbers.innerHTML =
    html;

}


/* ==========================================
   EDITOR
========================================== */

function loadCurrentFile() {

  editor.value =
    files[currentFile] || "";

  updateLineNumbers();

  setStatus(
    "Editing " + currentFile
  );

}


editor.addEventListener(
  "input",
  function () {

    files[currentFile] =
      editor.value;

    updateLineNumbers();

    setStatus(
      currentFile + " • Unsaved"
    );

  }
);


/* ==========================================
   TAB KEY
========================================== */

editor.addEventListener(
  "keydown",
  function (event) {

    if (event.key !== "Tab") {
      return;
    }

    event.preventDefault();

    const start =
      editor.selectionStart;

    const end =
      editor.selectionEnd;

    const value =
      editor.value;

    editor.value =
      value.substring(0, start) +
      "  " +
      value.substring(end);

    editor.selectionStart =
      editor.selectionEnd =
      start + 2;

    files[currentFile] =
      editor.value;

    updateLineNumbers();

  }
);


/* ==========================================
   SCROLL LINE NUMBERS WITH EDITOR
========================================== */

editor.addEventListener(
  "scroll",
  function () {

    lineNumbers.scrollTop =
      editor.scrollTop;

  }
);


/* ==========================================
   FILE ICON
========================================== */

function fileIcon(name) {

  if (name.endsWith(".html")) {
    return "📄";
  }

  if (name.endsWith(".css")) {
    return "🎨";
  }

  if (name.endsWith(".js")) {
    return "⚡";
  }

  if (name.endsWith(".json")) {
    return "🧩";
  }

  return "📄";

}


/* ==========================================
   RENDER FILES
========================================== */

function renderFiles() {

  fileList.innerHTML = "";

  Object.keys(files).forEach(
    function (name) {

      const button =
        document.createElement("button");

      button.type =
        "button";

      button.className =
        "file";

      if (
        name === currentFile
      ) {

        button.classList.add(
          "active"
        );

      }

      button.textContent =
        fileIcon(name) +
        " " +
        name;

      button.addEventListener(
        "click",
        function () {

          openFile(name);

        }
      );

      fileList.appendChild(
        button
      );

    }
  );

}


/* ==========================================
   OPEN FILE
========================================== */

function openFile(name) {

  if (
    !Object.prototype.hasOwnProperty.call(
      files,
      name
    )
  ) {

    return;

  }


  files[currentFile] =
    editor.value;


  currentFile =
    name;


  if (
    !openTabs.includes(name)
  ) {

    openTabs.push(name);

  }


  loadCurrentFile();

  renderFiles();

  renderTabs();

}


/* ==========================================
   TABS
========================================== */

function renderTabs() {

  tabs.innerHTML = "";

  openTabs.forEach(
    function (name) {

      const tab =
        document.createElement("div");

      tab.className =
        "tab";

      if (
        name === currentFile
      ) {

        tab.classList.add(
          "active"
        );

      }


      const nameSpan =
        document.createElement(
          "span"
        );

      nameSpan.className =
        "tab-name";

      nameSpan.textContent =
        fileIcon(name) +
        " " +
        name;


      const close =
        document.createElement(
          "button"
        );

      close.type =
        "button";

      close.className =
        "tab-close";

      close.textContent =
        "×";


      tab.appendChild(
        nameSpan
      );

      tab.appendChild(
        close
      );


      nameSpan.addEventListener(
        "click",
        function () {

          openFile(name);

        }
      );


      close.addEventListener(
        "click",
        function (event) {

          event.stopPropagation();

          closeTab(name);

        }
      );


      tabs.appendChild(
        tab
      );

    }
  );

}


/* ==========================================
   CLOSE TAB
========================================== */

function closeTab(name) {

  const index =
    openTabs.indexOf(name);

  if (index === -1) {
    return;
  }

  openTabs.splice(
    index,
    1
  );


  if (
    currentFile === name
  ) {

    const next =
      openTabs[index] ||
      openTabs[index - 1];

    if (next) {

      currentFile =
        next;

    } else {

      openTabs.push(
        "index.html"
      );

      currentFile =
        "index.html";

    }

    loadCurrentFile();

  }


  renderTabs();

  renderFiles();

}


/* ==========================================
   RUN
========================================== */

function buildPreview() {

  let html =
    files["index.html"] || "";

  const css =
    files["style.css"] || "";

  const js =
    files["script.js"] || "";


  /* CSS */

  html =
    html.replace(
      /<link[^>]+href=["']style\.css["'][^>]*>/gi,
      "<style>" +
        css +
      "</style>"
    );


  /* JS */

  const safeJS =
    js.replace(
      /<\/script>/gi,
      "<\\/script>"
    );


  html =
    html.replace(
      /<script[^>]+src=["']script\.js["'][^>]*><\/script>/gi,
      "<script>" +
        safeJS +
      "<\/script>"
    );


  return html;

}


function runProject() {

  files[currentFile] =
    editor.value;


  preview.srcdoc =
    buildPreview();


  showPanel(
    "preview"
  );


  setStatus(
    "Project running"
  );

}


/* ==========================================
   SAVE
========================================== */

function saveProject() {

  files[currentFile] =
    editor.value;


  try {

    localStorage.setItem(
      "nova-code-project",
      JSON.stringify(files)
    );


    setStatus(
      "Project saved"
    );

  } catch (error) {

    setStatus(
      "Save failed"
    );

    console.error(error);

  }

}


/* ==========================================
   DOWNLOAD
========================================== */

function downloadFile() {

  files[currentFile] =
    editor.value;


  const blob =
    new Blob(
      [files[currentFile]],
      {
        type:
          "text/plain;charset=utf-8"
      }
    );


  const url =
    URL.createObjectURL(blob);


  const link =
    document.createElement("a");

  link.href =
    url;

  link.download =
    currentFile;

  document.body.appendChild(
    link
  );

  link.click();

  document.body.removeChild(
    link
  );


  setTimeout(
    function () {

      URL.revokeObjectURL(
        url
      );

    },
    1000
  );


  setStatus(
    "Downloaded " +
    currentFile
  );

}


/* ==========================================
   NEW FILE MODAL
========================================== */

const fileModal =
  document.getElementById(
    "fileModal"
  );

const fileNameInput =
  document.getElementById(
    "fileNameInput"
  );


function showFileModal() {

  fileNameInput.value =
    "";

  fileModal.style.display =
    "flex";

  setTimeout(
    function () {

      fileNameInput.focus();

    },
    100
  );

}


function hideFileModal() {

  fileModal.style.display =
    "none";

}


function createNewFile() {

  const name =
    fileNameInput.value.trim();

  if (!name) {

    return;

  }


  if (
    Object.prototype.hasOwnProperty.call(
      files,
      name
    )
  ) {

    setStatus(
      "That file already exists"
    );

    return;

  }


  files[name] =
    "";


  hideFileModal();

  renderFiles();

  openFile(name);

}


/* ==========================================
   SEARCH
========================================== */

const searchModal =
  document.getElementById(
    "searchModal"
  );

const searchInput =
  document.getElementById(
    "searchInput"
  );

const searchResults =
  document.getElementById(
    "searchResults"
  );


function openSearch() {

  searchModal.style.display =
    "flex";

  searchInput.value =
    "";

  searchResults.innerHTML =
    "";

  setTimeout(
    function () {

      searchInput.focus();

    },
    100
  );

}


function closeSearch() {

  searchModal.style.display =
    "none";

}


function escapeHtml(text) {

  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

}


function searchProject() {

  const term =
    searchInput.value
      .trim()
      .toLowerCase();


  searchResults.innerHTML =
    "";


  if (!term) {
    return;
  }


  Object.keys(files).forEach(
    function (name) {

      const lines =
        files[name].split("\n");


      lines.forEach(
        function (line, index) {

          if (
            line
              .toLowerCase()
              .includes(term)
          ) {

            const result =
              document.createElement(
                "button"
              );

            result.type =
              "button";

            result.style =
              `
              display:block;
              width:100%;
              padding:10px;
              margin-bottom:5px;
              text-align:left;
              border:1px solid #303846;
              border-radius:7px;
              background:#202733;
              color:white;
              `;

            result.innerHTML =
              escapeHtml(line) +
              `<br><small style="color:#8792a3">${name} • line ${index + 1}</small>`;


            result.addEventListener(
              "click",
              function () {

                openFile(name);

                const linesBefore =
                  files[name]
                    .split("\n")
                    .slice(
                      0,
                      index
                    )
                    .join("\n");


                editor.focus();

                editor.setSelectionRange(
                  linesBefore.length,
                  linesBefore.length
                );


                closeSearch();

              }
            );


            searchResults.appendChild(
              result
            );

          }

        }
      );

    }
  );

}


searchInput.addEventListener(
  "input",
  searchProject
);


/* ==========================================
   BOTTOM PANELS
========================================== */

function showPanel(name) {

  document
    .querySelectorAll(
      ".bottom-tab"
    )
    .forEach(
      function (button) {

        button.classList.toggle(
          "active",
          button.dataset.panel ===
            name
        );

      }
    );


  if (
    name === "preview"
  ) {

    bottomContent.innerHTML =
      '<iframe id="preview" sandbox="allow-scripts"></iframe>';

    const frame =
      document.getElementById(
        "preview"
      );

    frame.srcdoc =
      buildPreview();

    return;

  }


  if (
    name === "console"
  ) {

    bottomContent.innerHTML =
      '<div id="console">Console is ready.</div>';

    return;

  }


  if (
    name === "problems"
  ) {

    bottomContent.innerHTML =
      `
      <div style="
        padding:12px;
        color:#8994a5;
      ">
        No problems detected.
      </div>
      `;

  }

}


/* ==========================================
   AI UI
========================================== */

function addMessage(
  type,
  text
) {

  const element =
    document.createElement(
      "div"
    );

  element.className =
    "message " + type;

  element.textContent =
    text;

  messages.appendChild(
    element
  );

  messages.scrollTop =
    messages.scrollHeight;

  return element;

}


/* ==========================================
   AI ENDPOINT
========================================== */

async function callAI(
  userPrompt
) {

  /*
    Replace this with your existing
    Groq backend endpoint.

    DO NOT put the secret API
    key in editor.js.
  */

  const AI_ENDPOINT =
    "/api/groq";


  const context =
    Object.keys(files)
      .map(
        function (name) {

          return (
            "\n--- " +
            name +
            " ---\n" +
            files[name]
          );

        }
      )
      .join("\n");


  const response =
    await fetch(
      AI_ENDPOINT,
      {
        method: "POST",

        headers: {
          "Content-Type":
            "application/json"
        },

        body: JSON.stringify({

          messages: [

            {
              role: "system",

              content:
                "You are NOVA AI, an expert web development assistant."
            },

            {
              role: "user",

              content:
                `
PROJECT:

${context}

USER REQUEST:

${userPrompt}
`
            }

          ]

        })

      }
    );


  if (!response.ok) {

    throw new Error(
      "AI server error: " +
      response.status
    );

  }


  const data =
    await response.json();


  if (
    typeof data.content ===
    "string"
  ) {

    return data.content;

  }


  if (
    data.choices &&
    data.choices[0] &&
    data.choices[0].message
  ) {

    return data
      .choices[0]
      .message
      .content;

  }


  throw new Error(
    "Invalid AI response"
  );

}


/* ==========================================
   AI ASK
========================================== */

async function askAI() {

  const input =
    document.getElementById(
      "aiPrompt"
    );


  const prompt =
    input.value.trim();


  if (!prompt) {
    return;
  }


  files[currentFile] =
    editor.value;


  addMessage(
    "user",
    prompt
  );


  input.value =
    "";


  const response =
    addMessage(
      "ai",
      "Thinking..."
    );


  try {

    const answer =
      await callAI(
        prompt
      );


    response.textContent =
      answer;

  } catch (error) {

    response.textContent =
      "AI error: " +
      error.message;

  }

}


/* ==========================================
   AI FIX
========================================== */

async function fixCode() {

  const code =
    editor.value;


  const response =
    addMessage(
      "ai",
      "Checking the code..."
    );


  try {

    const answer =
      await callAI(
        `
Fix the current file.

File:
${currentFile}

Code:
${code}

Return the complete corrected file.
Do not use markdown fences.
`
      );


    const cleaned =
      answer
        .replace(
          /^```[a-zA-Z0-9_-]*\s*/,
          ""
        )
        .replace(
          /\s*```$/,
          ""
        )
        .trim();


    editor.value =
      cleaned;

    files[currentFile] =
      cleaned;

    updateLineNumbers();


    response.textContent =
      "Done. The corrected code is now in the editor.";


  } catch (error) {

    response.textContent =
      "AI error: " +
      error.message;

  }

}


/* ==========================================
   EXPLORER TOGGLE
========================================== */

function toggleExplorer() {

  if (
    explorer.style.display ===
    "none"
  ) {

    explorer.style.display =
      "";

  } else {

    explorer.style.display =
      "none";

  }

}


/* ==========================================
   CLEAR SAVED PROJECT
========================================== */

function clearProject() {

  const confirmed =
    window.confirm(
      "Delete the saved NOVA project?"
    );


  if (!confirmed) {
    return;
  }


  localStorage.removeItem(
    "nova-code-project"
  );


  window.location.reload();

}


/* ==========================================
   LOAD SAVED PROJECT
========================================== */

function loadSavedProject() {

  try {

    const saved =
      localStorage.getItem(
        "nova-code-project"
      );


    if (!saved) {
      return;
    }


    const loaded =
      JSON.parse(saved);


    Object.assign(
      files,
      loaded
    );


  } catch (error) {

    console.error(
      "Could not load project:",
      error
    );

  }

}


/* ==========================================
   ALL BUTTONS
========================================== */

onButton(
  "explorerBtn",
  toggleExplorer
);

onButton(
  "newFileBtn",
  showFileModal
);

onButton(
  "newFileSideBtn",
  showFileModal
);

onButton(
  "createFileBtn",
  createNewFile
);

onButton(
  "cancelFileBtn",
  hideFileModal
);

onButton(
  "searchBtn",
  openSearch
);

onButton(
  "closeSearchBtn",
  closeSearch
);

onButton(
  "saveBtn",
  saveProject
);

onButton(
  "downloadBtn",
  downloadFile
);

onButton(
  "runBtn",
  runProject
);

onButton(
  "clearBtn",
  clearProject
);

onButton(
  "askBtn",
  askAI
);

onButton(
  "fixBtn",
  fixCode
);


/* ==========================================
   BOTTOM BUTTONS
========================================== */

document
  .querySelectorAll(
    ".bottom-tab"
  )
  .forEach(
    function (button) {

      button.addEventListener(
        "click",
        function () {

          showPanel(
            button.dataset.panel
          );

        }
      );

    }
  );


/* ==========================================
   MODAL BACKDROPS
========================================== */

document
  .getElementById("fileModal")
  .addEventListener(
    "click",
    function (event) {

      if (
        event.target ===
        this
      ) {

        hideFileModal();

      }

    }
  );


document
  .getElementById("searchModal")
  .addEventListener(
    "click",
    function (event) {

      if (
        event.target ===
        this
      ) {

        closeSearch();

      }

    }
  );


/* ==========================================
   KEYBOARD
========================================== */

document.addEventListener(
  "keydown",
  function (event) {

    if (
      (event.metaKey ||
       event.ctrlKey) &&
      event.key.toLowerCase() === "s"
    ) {

      event.preventDefault();

      saveProject();

    }


    if (
      (event.metaKey ||
       event.ctrlKey) &&
      event.key.toLowerCase() === "f"
    ) {

      event.preventDefault();

      openSearch();

    }


    if (
      (event.metaKey ||
       event.ctrlKey) &&
      event.key === "Enter"
    ) {

      event.preventDefault();

      runProject();

    }


    if (
      event.key === "Escape"
    ) {

      hideFileModal();

      closeSearch();

    }

  }
);


/* ==========================================
   START
========================================== */

loadSavedProject();

renderFiles();

renderTabs();

loadCurrentFile();

runProject();

setStatus(
  "NOVA Code ready"
);


/* ==========================================
   DEBUG MESSAGE
========================================== */

console.log(
  "NOVA Code loaded successfully."
);
