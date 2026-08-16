"use strict";

/*
==================================================
NOVA CODE V2
==================================================
*/


/* ================================================
   PROJECT
================================================ */

const project = {
  "index.html": `<!DOCTYPE html>
<html>
<head>
  <title>NOVA Project</title>
  <link rel="stylesheet" href="style.css">
</head>

<body>

  <main class="card">
    <h1>Hello from NOVA</h1>
    <p>Edit this project and press Run.</p>

    <button id="helloButton">
      Click Me
    </button>
  </main>

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
  background: white;
  padding: 40px;
  border-radius: 18px;
  box-shadow: 0 15px 40px rgba(0,0,0,.12);
  text-align: center;
}

button {
  border: 0;
  padding: 12px 18px;
  border-radius: 9px;
  background: #2563eb;
  color: white;
  font-weight: 700;
}`,

  "script.js": `document
  .getElementById("helloButton")
  .addEventListener("click", () => {
    alert("NOVA is working!");
  });`
};


let currentFile = "index.html";

let editor = null;

const openTabs = [
  "index.html"
];

const editorHistory = [];


/* ================================================
   ELEMENTS
================================================ */

const fileList =
  document.getElementById("fileList");

const tabs =
  document.getElementById("tabs");

const editorHost =
  document.getElementById("editorHost");

const status =
  document.getElementById("status");

const preview =
  document.getElementById("preview");

const bottomContent =
  document.getElementById("bottomContent");

const messages =
  document.getElementById("messages");


/* ================================================
   TOUCH-SAFE BUTTONS
================================================ */

function tap(element, fn) {

  if (!element) return;

  let lastTouch = 0;

  element.addEventListener(
    "touchend",
    event => {

      event.preventDefault();

      lastTouch = Date.now();

      fn(event);
    },
    { passive: false }
  );

  element.addEventListener(
    "click",
    event => {

      if (
        Date.now() - lastTouch < 650
      ) {
        return;
      }

      fn(event);
    }
  );
}


/* ================================================
   STATUS
================================================ */

function setStatus(text) {

  status.textContent = text;

}


/* ================================================
   CODEMIRROR
================================================ */

function modeForFile(filename) {

  if (filename.endsWith(".html")) {
    return "htmlmixed";
  }

  if (filename.endsWith(".css")) {
    return "css";
  }

  if (
    filename.endsWith(".js") ||
    filename.endsWith(".json")
  ) {
    return "javascript";
  }

  return "text/plain";
}


function createEditor() {

  editor = CodeMirror(
    editorHost,
    {
      value: project[currentFile] || "",

      mode: modeForFile(currentFile),

      theme: "material-darker",

      lineNumbers: true,

      lineWrapping: false,

      tabSize: 2,

      indentUnit: 2,

      smartIndent: true,

      autoCloseBrackets: true,

      matchBrackets: true,

      foldGutter: true,

      gutters: [
        "CodeMirror-linenumbers",
        "CodeMirror-foldgutter"
      ],

      styleActiveLine: true,

      autofocus: true,

      viewportMargin: Infinity,

      extraKeys: {

        "Cmd-S": saveProject,
        "Ctrl-S": saveProject,

        "Cmd-Enter": runProject,
        "Ctrl-Enter": runProject,

        "Cmd-F": openSearch,
        "Ctrl-F": openSearch

      }
    }
  );


  editor.on(
    "change",
    () => {

      project[currentFile] =
        editor.getValue();

      setStatus(
        currentFile + " • Unsaved"
      );

    }
  );

}


/* ================================================
   FILE ICON
================================================ */

function iconFor(filename) {

  if (filename.endsWith(".html")) {
    return "📄";
  }

  if (filename.endsWith(".css")) {
    return "🎨";
  }

  if (filename.endsWith(".js")) {
    return "⚡";
  }

  if (filename.endsWith(".json")) {
    return "🧩";
  }

  return "📄";
}


/* ================================================
   RENDER EXPLORER
================================================ */

function renderFiles() {

  fileList.innerHTML = "";

  Object.keys(project)
    .forEach(filename => {

      const button =
        document.createElement("button");

      button.className =
        "file" +
        (filename === currentFile
          ? " active"
          : "");

      button.dataset.file =
        filename;

      button.textContent =
        iconFor(filename) +
        " " +
        filename;

      fileList.appendChild(
        button
      );


      tap(
        button,
        () => openFile(filename)
      );

    });

}


/* ================================================
   OPEN FILE
================================================ */

function openFile(filename) {

  if (!project[filename]) {
    project[filename] = "";
  }


  if (
    !openTabs.includes(filename)
  ) {

    openTabs.push(filename);

  }


  currentFile =
    filename;


  editor.setValue(
    project[currentFile]
  );


  editor.setOption(
    "mode",
    modeForFile(currentFile)
  );


  renderFiles();
  renderTabs();

  setStatus(
    "Editing " + currentFile
  );


  setTimeout(
    () => editor.refresh(),
    0
  );

}


/* ================================================
   TABS
================================================ */

function renderTabs() {

  tabs.innerHTML = "";

  openTabs.forEach(
    filename => {

      const tab =
        document.createElement("div");

      tab.className =
        "tab" +
        (filename === currentFile
          ? " active"
          : "");


      const name =
        document.createElement("span");

      name.textContent =
        iconFor(filename) +
        " " +
        filename;


      const close =
        document.createElement("button");

      close.className =
        "tab-close";

      close.textContent =
        "×";


      tab.appendChild(name);
      tab.appendChild(close);

      tabs.appendChild(tab);


      tap(
        name,
        () => openFile(filename)
      );


      tap(
        close,
        event => {

          event.stopPropagation();

          closeTab(filename);

        }
      );

    }
  );

}


function closeTab(filename) {

  const index =
    openTabs.indexOf(filename);

  if (index === -1) {
    return;
  }


  openTabs.splice(
    index,
    1
  );


  if (
    currentFile === filename
  ) {

    const next =
      openTabs[index] ||
      openTabs[index - 1] ||
      openTabs[0];


    if (next) {

      openFile(next);

    } else {

      openTabs.push(
        "index.html"
      );

      openFile(
        "index.html"
      );

    }

  }


  renderTabs();

}


/* ================================================
   NEW FILE
================================================ */

function newFile() {

  const name =
    window.prompt(
      "New file name:",
      "new-file.js"
    );


  if (!name) {
    return;
  }


  if (
    project[name]
  ) {

    alert(
      "That file already exists."
    );

    return;
  }


  project[name] =
    "";


  renderFiles();

  openFile(name);

}


tap(
  document.getElementById("newFileBtn"),
  newFile
);


/* ================================================
   SAVE
================================================ */

function saveProject() {

  project[currentFile] =
    editor.getValue();


  localStorage.setItem(
    "nova-code-project-v2",
    JSON.stringify(project)
  );


  setStatus(
    "Project saved"
  );

}


tap(
  document.getElementById("saveBtn"),
  saveProject
);


/* ================================================
   LOAD
================================================ */

function loadProject() {

  const saved =
    localStorage.getItem(
      "nova-code-project-v2"
    );


  if (!saved) {
    return;
  }


  try {

    const parsed =
      JSON.parse(saved);


    Object.assign(
      project,
      parsed
    );

  } catch (error) {

    console.error(error);

  }

}


/* ================================================
   RUN PROJECT
================================================ */

function runProject() {

  project[currentFile] =
    editor.getValue();


  let html =
    project["index.html"] || "";


  const css =
    project["style.css"] || "";


  const js =
    project["script.js"] || "";


  html =
    html.replace(
      /<link[^>]*href=["']style\.css["'][^>]*>/gi,
      `<style>${css}</style>`
    );


  const safeJS =
    js.replace(
      /<\/script>/gi,
      "<\\/script>"
    );


  html =
    html.replace(
      /<script[^>]*src=["']script\.js["'][^>]*><\/script>/gi,
      `<script>
${safeJS}
<\/script>`
    );


  const errors = [];


  const srcdoc =
`<!DOCTYPE html>
<html>
<head>

${html.includes("<meta charset")
  ? ""
  : '<meta charset="UTF-8">'}

<script>
window.addEventListener("error", event => {

  parent.postMessage(
    {
      type: "nova-error",
      message: event.message,
      line: event.lineno
    },
    "*"
  );

});
<\/script>

</head>
<body>

${html}

</body>
</html>`;


  preview.srcdoc =
    srcdoc;


  showBottomPanel(
    "preview"
  );


  setStatus(
    "Project running"
  );

}


/* ================================================
   PREVIEW ERRORS
================================================ */

window.addEventListener(
  "message",
  event => {

    if (
      !event.data ||
      event.data.type !== "nova-error"
    ) {
      return;
    }


    addConsoleLine(
      "Error: " +
      event.data.message +
      (
        event.data.line
          ? " (line " +
            event.data.line +
            ")"
          : ""
      ),
      true
    );


    showBottomPanel(
      "console"
    );

  }
);


tap(
  document.getElementById("runBtn"),
  runProject
);


/* ================================================
   DOWNLOAD
================================================ */

function downloadFile() {

  project[currentFile] =
    editor.getValue();


  const blob =
    new Blob(
      [project[currentFile]],
      {
        type:
          "text/plain;charset=utf-8"
      }
    );


  const url =
    URL.createObjectURL(
      blob
    );


  const a =
    document.createElement(
      "a"
    );


  a.href =
    url;

  a.download =
    currentFile;


  document.body.appendChild(
    a
  );

  a.click();

  a.remove();


  setTimeout(
    () =>
      URL.revokeObjectURL(url),
    1000
  );


  setStatus(
    "Downloaded " +
    currentFile
  );

}


tap(
  document.getElementById("downloadBtn"),
  downloadFile
);


/* ================================================
   SEARCH
================================================ */

const searchOverlay =
  document.getElementById(
    "searchOverlay"
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

  searchOverlay.style.display =
    "flex";


  searchInput.value =
    "";


  searchResults.innerHTML =
    "";


  setTimeout(
    () =>
      searchInput.focus(),
    50
  );

}


function closeSearch() {

  searchOverlay.style.display =
    "none";

}


tap(
  document.getElementById("searchBtn"),
  openSearch
);


searchOverlay.addEventListener(
  "touchend",
  event => {

    if (
      event.target ===
      searchOverlay
    ) {

      event.preventDefault();

      closeSearch();

    }

  },
  { passive: false }
);


searchOverlay.addEventListener(
  "click",
  event => {

    if (
      event.target ===
      searchOverlay
    ) {

      closeSearch();

    }

  }
);


searchInput.addEventListener(
  "input",
  () => {

    const term =
      searchInput.value
        .toLowerCase()
        .trim();


    searchResults.innerHTML =
      "";


    if (!term) {
      return;
    }


    Object.entries(
      project
    ).forEach(
      ([filename, content]) => {

        const lines =
          content.split("\n");


        lines.forEach(
          (line, index) => {

            if (
              line
                .toLowerCase()
                .includes(term)
            ) {

              const result =
                document.createElement(
                  "button"
                );


              result.className =
                "search-result";


              result.innerHTML =
                escapeHtml(line) +
                `<small>${filename} • line ${index + 1}</small>`;


              searchResults.appendChild(
                result
              );


              tap(
                result,
                () => {

                  openFile(
                    filename
                  );


                  const lineNumber =
                    index;


                  editor.setCursor(
                    {
                      line:
                        lineNumber,

                      ch:
                        0
                    }
                  );


                  editor.focus();


                  closeSearch();

                }
              );

            }

          }
        );

      }
    );

  }
);


/* ================================================
   CONSOLE
================================================ */

function showBottomPanel(
  name
) {

  document
    .querySelectorAll(
      ".bottom-tab"
    )
    .forEach(
      button => {

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
      `
      <iframe
        id="preview"
        style="
          width:100%;
          height:100%;
          border:0;
          background:white;
          display:block;
        ">
      </iframe>
      `;


    /*
      Reconnect iframe reference.
    */

    window.preview =
      document.getElementById(
        "preview"
      );


    runProjectToFrame();

    return;
  }


  if (
    name === "console"
  ) {

    bottomContent.innerHTML =
      `<div id="consoleOutput"></div>`;

    return;
  }


  if (
    name === "problems"
  ) {

    bottomContent.innerHTML =
      `
      <div style="color:#8f99a8">
        No problems detected.
      </div>
      `;

  }

}


function addConsoleLine(
  text,
  isError = false
) {

  let output =
    document.getElementById(
      "consoleOutput"
    );


  if (!output) {

    showBottomPanel(
      "console"
    );

    output =
      document.getElementById(
        "consoleOutput"
      );

  }


  const line =
    document.createElement(
      "div"
    );


  line.className =
    "console-line" +
    (isError
      ? " error"
      : "");


  line.textContent =
    text;


  output.appendChild(
    line
  );

}


function runProjectToFrame() {

  const frame =
    document.getElementById(
      "preview"
    );


  if (!frame) {
    return;
  }


  let html =
    project["index.html"] ||
    "";


  const css =
    project["style.css"] ||
    "";


  const js =
    project["script.js"] ||
    "";


  html =
    html.replace(
      /<link[^>]*href=["']style\.css["'][^>]*>/gi,
      `<style>${css}</style>`
    );


  html =
    html.replace(
      /<script[^>]*src=["']script\.js["'][^>]*><\/script>/gi,
      `<script>${js.replace(
        /<\/script>/gi,
        "<\\/script>"
      )}<\/script>`
    );


  frame.srcdoc =
    html;

}


/* ================================================
   BOTTOM TABS
================================================ */

document
  .querySelectorAll(
    ".bottom-tab"
  )
  .forEach(
    button => {

      tap(
        button,
        () =>
          showBottomPanel(
            button.dataset.panel
          )
      );

    }
  );


/* ================================================
   AI
================================================ */

function addMessage(
  type,
  text
) {

  const div =
    document.createElement(
      "div"
    );


  div.className =
    "msg " + type;


  div.textContent =
    text;


  messages.appendChild(
    div
  );


  messages.scrollTop =
    messages.scrollHeight;


  return div;

}


async function askAI() {

  const box =
    document.getElementById(
      "aiPrompt"
    );


  const prompt =
    box.value.trim();


  if (!prompt) {
    return;
  }


  project[currentFile] =
    editor.getValue();


  addMessage(
    "user",
    prompt
  );


  box.value =
    "";


  const response =
    addMessage(
      "ai",
      "Thinking..."
    );


  try {

    const text =
      await callAI(
        prompt
      );


    response.textContent =
      text;


  } catch (error) {

    response.textContent =
      "AI error: " +
      error.message;

  }

}


tap(
  document.getElementById("askBtn"),
  askAI
);


/* ================================================
   AI FIX
================================================ */

async function fixCode() {

  const currentCode =
    editor.getValue();


  addMessage(
    "user",
    "Fix the current file."
  );


  const answer =
    addMessage(
      "ai",
      "Analyzing..."
    );


  try {

    const text =
      await callAI(
`
Fix ${currentFile}.

Return ONLY the corrected complete file.
Do not use markdown fences.

Current code:

${currentCode}
`
      );


    const cleaned =
      cleanCode(text);


    editor.setValue(
      cleaned
    );


    project[currentFile] =
      cleaned;


    answer.textContent =
      "Fixed and applied the code.";

  } catch (error) {

    answer.textContent =
      "AI error: " +
      error.message;

  }

}


tap(
  document.getElementById("fixBtn"),
  fixCode
);


/* ================================================
   GROQ BACKEND
================================================ */

async function callAI(
  userPrompt
) {

  /*
    Connect this to the backend you already
    use for Groq.

    Never place the private Groq key here.
  */

  const AI_ENDPOINT =
    "/api/groq";


  const context =
Object.entries(project)
  .map(
    ([filename, content]) =>
`
--- ${filename} ---

${content}
`
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
`
You are NOVA AI, an expert
web development assistant.

The user is working inside an
online code editor.

You can help with:

HTML
CSS
JavaScript
debugging
UI
responsive design
project architecture

Current project:

${context}
`
            },

            {
              role: "user",

              content:
                userPrompt
            }

          ]

        })
      }
    );


  if (!response.ok) {

    throw new Error(
      "AI request failed: " +
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
    "Invalid AI response."
  );

}


function cleanCode(
  value
) {

  return value
    .replace(
      /^```[a-zA-Z0-9_-]*\s*/,
      ""
    )
    .replace(
      /\s*```$/,
      ""
    )
    .trim();

}


/* ================================================
   COMMAND PALETTE
================================================ */

function openCommands() {

  const commands = [

    {
      name: "Run Project",
      action: runProject
    },

    {
      name: "Save Project",
      action: saveProject
    },

    {
      name: "Search Project",
      action: openSearch
    },

    {
      name: "New File",
      action: newFile
    },

    {
      name: "Download File",
      action: downloadFile
    },

    {
      name: "Toggle Explorer",
      action: toggleExplorer
    }

  ];


  const choice =
    window.prompt(
      "NOVA Commands:\n\n" +
      commands
        .map(
          (cmd, i) =>
            `${i + 1}. ${cmd.name}`
        )
        .join("\n") +
      "\n\nEnter a number:"
    );


  const index =
    Number(choice) - 1;


  if (
    commands[index]
  ) {

    commands[index].action();

  }

}


tap(
  document.getElementById(
    "commandBtn"
  ),
  openCommands
);


/* ================================================
   EXPLORER TOGGLE
================================================ */

function toggleExplorer() {

  const explorer =
    document.getElementById(
      "explorer"
    );


  if (
    explorer.style.display ===
    "none"
  ) {

    explorer.style.display =
      "";

  } else {

    explorer.style.display =
      "block";

  }


  setTimeout(
    () => {

      if (editor) {
        editor.refresh();
      }

    },
    100
  );

}


tap(
  document.getElementById(
    "explorerBtn"
  ),
  toggleExplorer
);


/* ================================================
   CLEAR PROJECT
================================================ */

function clearProject() {

  const ok =
    window.confirm(
      "Clear the saved NOVA project?"
    );


  if (!ok) {
    return;
  }


  localStorage.removeItem(
    "nova-code-project-v2"
  );


  location.reload();

}


tap(
  document.getElementById(
    "clearBtn"
  ),
  clearProject
);


/* ================================================
   ESCAPE HTML
================================================ */

function escapeHtml(
  value
) {

  return value
    .replace(
      /&/g,
      "&amp;"
    )
    .replace(
      /</g,
      "&lt;"
    )
    .replace(
      />/g,
      "&gt;"
    )
    .replace(
      /"/g,
      "&quot;"
    )
    .replace(
      /'/g,
      "&#039;"
    );

}


/* ================================================
   KEYBOARD
================================================ */

document.addEventListener(
  "keydown",
  event => {

    if (
      (event.metaKey ||
       event.ctrlKey) &&
      event.key.toLowerCase() ===
        "s"
    ) {

      event.preventDefault();

      saveProject();

    }


    if (
      (event.metaKey ||
       event.ctrlKey) &&
      event.key.toLowerCase() ===
        "f"
    ) {

      event.preventDefault();

      openSearch();

    }


    if (
      (event.metaKey ||
       event.ctrlKey) &&
      event.key ===
        "Enter"
    ) {

      event.preventDefault();

      runProject();

    }


    if (
      event.key === "Escape"
    ) {

      closeSearch();

    }

  }
);


/* ================================================
   START
================================================ */

loadProject();

renderFiles();

renderTabs();

createEditor();

runProject();

setStatus(
  "NOVA Code v2 ready"
);
