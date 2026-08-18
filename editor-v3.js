"use strict";

/*
=========================================================
DAVIDCRAFT CODE V3
=========================================================
Uses your existing DavidCraft AI Worker.

Worker:
https://davidcraft-ai.feidavid81022.workers.dev

Assistant:
coding

Version:
v1
=========================================================
*/


/* =====================================================
   AI CONNECTION
===================================================== */

const WORKER_URL =
  "https://davidcraft-ai.feidavid81022.workers.dev";

const AI_VERSION =
  "v1";


/* =====================================================
   PROJECT
===================================================== */

const defaultFiles = {

  "index.html":
`<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">

  <meta
    name="viewport"
    content="width=device-width, initial-scale=1"
  >

  <title>DavidCraft Project</title>

  <link
    rel="stylesheet"
    href="style.css"
  >
</head>

<body>

  <main class="card">

    <h1>
      Hello from DavidCraft Code
    </h1>

    <p>
      Edit the code and press Run.
    </p>

    <button id="helloButton">
      Click Me
    </button>

  </main>

  <script src="script.js"><\/script>

</body>
</html>`,

  "style.css":
`body {
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

  "script.js":
`document
  .getElementById("helloButton")
  .addEventListener("click", () => {

    alert("DavidCraft Code is working!");

  });`

};


/* =====================================================
   STATE
===================================================== */

let files = {};

let currentFile =
  "index.html";

let openTabs = [
  "index.html"
];

let aiMode =
  "build";

let pendingAIChange =
  null;


/* =====================================================
   ELEMENTS
===================================================== */

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

const panelContent =
  document.getElementById("panelContent");

const status =
  document.getElementById("status");

const messages =
  document.getElementById("messages");

const aiPrompt =
  document.getElementById("aiPrompt");

const pendingChange =
  document.getElementById(
    "pendingChange"
  );


/* =====================================================
   LOAD PROJECT
===================================================== */

function loadProject() {

  try {

    const saved =
      localStorage.getItem(
        "davidcraft-code-project"
      );

    if (saved) {

      const parsed =
        JSON.parse(saved);

      files =
        {
          ...defaultFiles,
          ...parsed
        };

    } else {

      files =
        {
          ...defaultFiles
        };

    }

  } catch (error) {

    console.error(error);

    files =
      {
        ...defaultFiles
      };

  }

}


/* =====================================================
   SAVE PROJECT
===================================================== */

function saveProject() {

  files[currentFile] =
    editor.value;

  try {

    localStorage.setItem(
      "davidcraft-code-project",
      JSON.stringify(files)
    );

    setStatus(
      "Project saved"
    );

  } catch (error) {

    setStatus(
      "Could not save project"
    );

  }

}


/* =====================================================
   STATUS
===================================================== */

function setStatus(text) {

  status.textContent =
    text;

}


/* =====================================================
   LINE NUMBERS
===================================================== */

function updateLineNumbers() {

  const count =
    editor.value
      .split("\n")
      .length;

  let html = "";

  for (
    let i = 1;
    i <= count;
    i++
  ) {

    html +=
      `<div>${i}</div>`;

  }

  lineNumbers.innerHTML =
    html;

}


/* =====================================================
   FILE ICON
===================================================== */

function fileIcon(name) {

  if (
    name.endsWith(".html")
  ) {
    return "📄";
  }

  if (
    name.endsWith(".css")
  ) {
    return "🎨";
  }

  if (
    name.endsWith(".js")
  ) {
    return "⚡";
  }

  if (
    name.endsWith(".json")
  ) {
    return "🧩";
  }

  if (
    name.endsWith(".md")
  ) {
    return "📝";
  }

  return "📄";

}


/* =====================================================
   RENDER FILES
===================================================== */

function renderFiles() {

  fileList.innerHTML =
    "";

  Object.keys(files)
    .forEach(
      name => {

        const row =
          document.createElement(
            "div"
          );

        row.style.display =
          "flex";

        const button =
          document.createElement(
            "button"
          );

        button.className =
          "file-btn" +
          (
            name === currentFile
              ? " active"
              : ""
          );

        button.innerHTML =
          `
          <span>${fileIcon(name)}</span>
          <span class="file-btn-name">
            ${escapeHtml(name)}
          </span>
          `;

        button.addEventListener(
          "click",
          () => {

            openFile(name);

          }
        );


        const deleteButton =
          document.createElement(
            "button"
          );

        deleteButton.className =
          "file-btn-delete";

        deleteButton.textContent =
          "×";

        deleteButton.title =
          "Delete file";


        deleteButton.addEventListener(
          "click",
          event => {

            event.stopPropagation();

            deleteFile(name);

          }
        );


        row.appendChild(
          button
        );

        row.appendChild(
          deleteButton
        );

        row.style.margin =
          "2px 0";

        fileList.appendChild(
          row
        );

      }
    );

}


/* =====================================================
   OPEN FILE
===================================================== */

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


  editor.value =
    files[currentFile];


  updateLineNumbers();

  renderFiles();

  renderTabs();


  setStatus(
    "Editing " + currentFile
  );

}


/* =====================================================
   RENDER TABS
===================================================== */

function renderTabs() {

  tabs.innerHTML =
    "";


  openTabs.forEach(
    name => {

      if (
        !files[name]
      ) {
        return;
      }


      const tab =
        document.createElement(
          "div"
        );

      tab.className =
        "tab" +
        (
          name === currentFile
            ? " active"
            : ""
        );


      const nameElement =
        document.createElement(
          "span"
        );

      nameElement.className =
        "tab-name";

      nameElement.textContent =
        fileIcon(name) +
        " " +
        name;


      const close =
        document.createElement(
          "button"
        );

      close.className =
        "tab-close";

      close.textContent =
        "×";


      nameElement.addEventListener(
        "click",
        () => {

          openFile(name);

        }
      );


      close.addEventListener(
        "click",
        event => {

          event.stopPropagation();

          closeTab(name);

        }
      );


      tab.appendChild(
        nameElement
      );

      tab.appendChild(
        close
      );

      tabs.appendChild(
        tab
      );

    }
  );

}


/* =====================================================
   CLOSE TAB
===================================================== */

function closeTab(name) {

  const index =
    openTabs.indexOf(name);


  if (
    index === -1
  ) {
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


    editor.value =
      files[currentFile];

    updateLineNumbers();

  }


  renderTabs();

  renderFiles();

}


/* =====================================================
   EDITOR INPUT
===================================================== */

editor.addEventListener(
  "input",
  () => {

    files[currentFile] =
      editor.value;

    updateLineNumbers();

    setStatus(
      currentFile +
      " • Unsaved"
    );

  }
);


/* =====================================================
   TAB / INDENT
===================================================== */

editor.addEventListener(
  "keydown",
  event => {

    if (
      event.key === "Tab"
    ) {

      event.preventDefault();


      const start =
        editor.selectionStart;

      const end =
        editor.selectionEnd;


      editor.value =
        editor.value.substring(
          0,
          start
        ) +
        "  " +
        editor.value.substring(
          end
        );


      editor.selectionStart =
        editor.selectionEnd =
        start + 2;


      files[currentFile] =
        editor.value;


      updateLineNumbers();

    }


    /*
      Auto-close common characters.
    */

    const pairs = {
      "{": "}",
      "(": ")",
      "[": "]",
      '"': '"',
      "'": "'"
    };


    if (
      pairs[event.key]
    ) {

      const start =
        editor.selectionStart;

      const end =
        editor.selectionEnd;


      if (
        start === end
      ) {

        event.preventDefault();


        const char =
          event.key;

        const close =
          pairs[char];


        const before =
          editor.value.slice(
            0,
            start
          );

        const after =
          editor.value.slice(
            end
          );


        editor.value =
          before +
          char +
          close +
          after;


        editor.selectionStart =
          editor.selectionEnd =
          start + 1;


        files[currentFile] =
          editor.value;

        updateLineNumbers();

      }

    }

  }
);


/* =====================================================
   SCROLL LINE NUMBERS
===================================================== */

editor.addEventListener(
  "scroll",
  () => {

    lineNumbers.scrollTop =
      editor.scrollTop;

  }
);


/* =====================================================
   BUILD PREVIEW
===================================================== */

function buildPreview() {

  let html =
    files["index.html"] ||
    "";


  const css =
    files["style.css"] ||
    "";


  const js =
    files["script.js"] ||
    "";


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


  return `
<!DOCTYPE html>

<html>

<head>

<meta
  charset="UTF-8"
>

<script>

window.addEventListener(
  "error",
  function(event) {

    parent.postMessage(
      {
        type: "error",
        message: event.message,
        line: event.lineno || 0
      },
      "*"
    );

  }
);

<\/script>

</head>

<body>

${html}

</body>

</html>
`;

}


/* =====================================================
   RUN
===================================================== */

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


/* =====================================================
   PREVIEW ERRORS
===================================================== */

window.addEventListener(
  "message",
  event => {

    if (
      !event.data ||
      event.data.type !== "error"
    ) {
      return;
    }


    addConsole(
      "Error: " +
      event.data.message +
      (
        event.data.line
          ? ` (line ${event.data.line})`
          : ""
      ),
      true
    );


    showPanel(
      "console"
    );

  }
);


/* =====================================================
   BOTTOM PANELS
===================================================== */

function showPanel(name) {

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

    panelContent.innerHTML =
      `
      <iframe
        id="preview"
        sandbox="allow-scripts"
      ></iframe>
      `;


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

    panelContent.innerHTML =
      `
      <div
        class="console"
        id="console"
      >
        Console ready.
      </div>
      `;


    return;

  }


  if (
    name === "problems"
  ) {

    panelContent.innerHTML =
      `
      <div
        class="problem"
      >
        No problems detected.
      </div>
      `;

  }

}


function addConsole(
  text,
  isError = false
) {

  let consoleElement =
    document.getElementById(
      "console"
    );


  if (!consoleElement) {

    showPanel(
      "console"
    );

    consoleElement =
      document.getElementById(
        "console"
      );

  }


  const line =
    document.createElement(
      "div"
    );


  line.className =
    "console-line" +
    (
      isError
        ? " error"
        : ""
    );


  line.textContent =
    text;


  consoleElement.appendChild(
    line
  );

}


/* =====================================================
   NEW FILE
===================================================== */

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
    () => {

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


  setStatus(
    "Created " + name
  );

}


/* =====================================================
   RENAME
===================================================== */

function renameCurrentFile() {

  const newName =
    window.prompt(
      "Rename " + currentFile,
      currentFile
    );


  if (!newName) {
    return;
  }


  if (
    Object.prototype.hasOwnProperty.call(
      files,
      newName
    )
  ) {

    setStatus(
      "That name already exists"
    );

    return;

  }


  files[newName] =
    files[currentFile];


  delete files[currentFile];


  const index =
    openTabs.indexOf(
      currentFile
    );


  if (index !== -1) {

    openTabs[index] =
      newName;

  }


  currentFile =
    newName;


  editor.value =
    files[currentFile];


  updateLineNumbers();

  renderFiles();

  renderTabs();


  setStatus(
    "Renamed file"
  );

}


/* =====================================================
   DELETE
===================================================== */

function deleteFile(name = currentFile) {

  const names =
    Object.keys(files);


  if (
    names.length <= 1
  ) {

    setStatus(
      "You need at least one file"
    );

    return;

  }


  const yes =
    window.confirm(
      `Delete ${name}?`
    );


  if (!yes) {
    return;
  }


  delete files[name];


  openTabs =
    openTabs.filter(
      tab => tab !== name
    );


  if (
    currentFile === name
  ) {

    currentFile =
      openTabs[0] ||
      Object.keys(files)[0];


    if (
      !openTabs.includes(
        currentFile
      )
    ) {

      openTabs.push(
        currentFile
      );

    }

    editor.value =
      files[currentFile];

    updateLineNumbers();

  }


  renderFiles();

  renderTabs();


  setStatus(
    "Deleted " + name
  );

}


/* =====================================================
   SEARCH
===================================================== */

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
    () => {

      searchInput.focus();

    },
    100
  );

}


function closeSearch() {

  searchModal.style.display =
    "none";

}


searchInput.addEventListener(
  "input",
  performSearch
);


function performSearch() {

  const term =
    searchInput.value
      .trim()
      .toLowerCase();


  searchResults.innerHTML =
    "";


  if (!term) {
    return;
  }


  Object.entries(files)
    .forEach(
      ([name, content]) => {

        const lines =
          content.split("\n");


        lines.forEach(
          (line, lineIndex) => {

            if (
              line
                .toLowerCase()
                .includes(term)
            ) {

              const button =
                document.createElement(
                  "button"
                );


              button.style =
                `
                width:100%;
                display:block;
                margin-bottom:5px;
                padding:9px;
                text-align:left;
                border:1px solid #343d49;
                border-radius:7px;
                background:#1a2028;
                color:white;
                `;


              button.innerHTML =
                `
                ${escapeHtml(line)}

                <small
                  style="color:#8994a5"
                >
                  ${escapeHtml(name)}
                  • line ${lineIndex + 1}
                </small>
                `;


              button.addEventListener(
                "click",
                () => {

                  openFile(name);


                  const linesBefore =
                    lines
                      .slice(
                        0,
                        lineIndex
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
                button
              );

            }

          }
        );

      }
    );

}


/* =====================================================
   AI MODE
===================================================== */

document
  .querySelectorAll(
    "[data-ai-mode]"
  )
  .forEach(
    button => {

      button.addEventListener(
        "click",
        () => {

          aiMode =
            button.dataset.aiMode;


          document
            .querySelectorAll(
              "[data-ai-mode]"
            )
            .forEach(
              other => {

                other.classList.toggle(
                  "active",
                  other === button
                );

              }
            );


          setStatus(
            "AI mode: " +
            aiMode
          );

        }
      );

    }
  );


/* =====================================================
   AI PROMPTS
===================================================== */

function createAIPrompt(
  userText
) {

  const projectContext =
    Object.entries(files)
      .map(
        ([name, content]) =>
          `
--- ${name} ---

${content}
`
      )
      .join("\n");


  const currentCode =
    editor.value;


  if (
    aiMode === "fix"
  ) {

    return `
You are fixing code inside the DavidCraft Code Editor.

Current file:
${currentFile}

Current code:
${currentCode}

Project:
${projectContext}

User request:
${userText || "Find and fix the problems in the current code."}

Explain what is wrong briefly, then provide the corrected complete file.
`;

  }


  if (
    aiMode === "explain"
  ) {

    return `
You are explaining code inside the DavidCraft Code Editor.

Current file:
${currentFile}

Code:
${currentCode}

Project:
${projectContext}

User question:
${userText || "Explain this code."}
`;

  }


  if (
    aiMode === "edit"
  ) {

    return `
You are editing a project inside the DavidCraft Code Editor.

Current file:
${currentFile}

Current code:
${currentCode}

Project:
${projectContext}

User request:
${userText}

Provide the exact changes needed.
If multiple files must change, clearly identify each file.
`;

  }


  return `
You are the coding agent inside DavidCraft Code.

Build what the user requests.

Current file:
${currentFile}

Current code:
${currentCode}

Project:
${projectContext}

User request:
${userText}

Think about the entire project.
Tell the user what you changed.
If code needs to be replaced, include the complete replacement.
If multiple files are needed, identify the files clearly.
`;

}


/* =====================================================
   AI REQUEST
===================================================== */

async function runAI() {

  const text =
    aiPrompt.value.trim();


  if (!text && aiMode !== "fix") {

    setStatus(
      "Enter an AI request"
    );

    return;

  }


  files[currentFile] =
    editor.value;


  addMessage(
    "user",
    text ||
      "Fix the current file."
  );


  aiPrompt.value =
    "";


  const loading =
    addMessage(
      "ai",
      "Thinking..."
    );


  try {

    const reply =
      await callDavidCraftAI(
        createAIPrompt(
          text
        )
      );


    loading.remove();


    const responseElement =
      addMessage(
        "ai",
        reply
      );


    /*
      Try to detect a structured AI change.
    */

    const possibleChange =
      extractAIChange(
        reply
      );


    if (
      possibleChange
    ) {

      pendingAIChange =
        possibleChange;


      showPendingChange();

    }


  } catch (error) {

    loading.textContent =
      "AI error: " +
      error.message;

  }

}


/* =====================================================
   DAVIDCRAFT AI WORKER
===================================================== */

async function callDavidCraftAI(
  prompt
) {

  const conversation = [
    {
      role: "user",
      content: prompt
    }
  ];


  const response =
    await fetch(
      WORKER_URL,
      {
        method: "POST",

        headers: {
          "Content-Type":
            "application/json"
        },

        body: JSON.stringify({

          assistant:
            "coding",

          version:
            AI_VERSION,

          messages:
            conversation

        })

      }
    );


  const data =
    await response.json();


  if (!response.ok) {

    throw new Error(
      data.error ||
      "The request failed."
    );

  }


  if (
    !data.reply
  ) {

    throw new Error(
      "The AI returned no reply."
    );

  }


  return data.reply;

}


/* =====================================================
   AI CHANGE DETECTION
===================================================== */

function extractAIChange(
  text
) {

  /*
    Supported format:

    <DAVIDCRAFT_CHANGE>
    {
      "file": "style.css",
      "content": "..."
    }
    </DAVIDCRAFT_CHANGE>
  */


  const match =
    text.match(
      /<DAVIDCRAFT_CHANGE>\s*([\s\S]*?)\s*<\/DAVIDCRAFT_CHANGE>/i
    );


  if (!match) {

    return null;

  }


  try {

    const data =
      JSON.parse(
        match[1]
      );


    if (
      !data.file ||
      typeof data.content !==
        "string"
    ) {

      return null;

    }


    return data;

  } catch {

    return null;

  }

}


/* =====================================================
   PENDING CHANGE
===================================================== */

function showPendingChange() {

  pendingChange.classList.remove(
    "hidden"
  );

}


function hidePendingChange() {

  pendingChange.classList.add(
    "hidden"
  );

}


/* =====================================================
   APPLY AI CHANGE
===================================================== */

function applyAIChange() {

  if (
    !pendingAIChange
  ) {

    return;

  }


  const {
    file,
    content
  } =
    pendingAIChange;


  files[file] =
    content;


  if (
    !openTabs.includes(file)
  ) {

    openTabs.push(file);

  }


  currentFile =
    file;


  editor.value =
    content;


  updateLineNumbers();

  renderFiles();

  renderTabs();


  setStatus(
    "AI change applied to " +
    file
  );


  pendingAIChange =
    null;


  hidePendingChange();

}


/* =====================================================
   REJECT AI CHANGE
===================================================== */

function rejectAIChange() {

  pendingAIChange =
    null;

  hidePendingChange();

  setStatus(
    "AI change rejected"
  );

}


/* =====================================================
   MESSAGES
===================================================== */

function addMessage(
  sender,
  text
) {

  const message =
    document.createElement(
      "div"
    );


  message.className =
    "message " +
    sender;


  message.textContent =
    text;


  messages.appendChild(
    message
  );


  messages.scrollTop =
    messages.scrollHeight;


  return message;

}


/* =====================================================
   CLEAR AI
===================================================== */

function clearAI() {

  messages.innerHTML =
    `
    <div class="message ai">
      AI chat cleared.
    </div>
    `;

  pendingAIChange =
    null;

  hidePendingChange();

}


/* =====================================================
   ESCAPE HTML
===================================================== */

function escapeHtml(
  value
) {

  return String(value)
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


/* =====================================================
   DOWNLOAD
===================================================== */

function downloadCurrentFile() {

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
    URL.createObjectURL(
      blob
    );


  const link =
    document.createElement(
      "a"
    );


  link.href =
    url;

  link.download =
    currentFile;


  document.body.appendChild(
    link
  );


  link.click();


  link.remove();


  setTimeout(
    () => {

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


/* =====================================================
   BUTTONS
===================================================== */

document
  .getElementById(
    "runBtn"
  )
  .addEventListener(
    "click",
    runProject
  );


document
  .getElementById(
    "saveBtn"
  )
  .addEventListener(
    "click",
    saveProject
  );


document
  .getElementById(
    "downloadBtn"
  )
  .addEventListener(
    "click",
    downloadCurrentFile
  );


document
  .getElementById(
    "newFileBtn"
  )
  .addEventListener(
    "click",
    showFileModal
  );


document
  .getElementById(
    "newSideBtn"
  )
  .addEventListener(
    "click",
    showFileModal
  );


document
  .getElementById(
    "createFileBtn"
  )
  .addEventListener(
    "click",
    createNewFile
  );


document
  .getElementById(
    "cancelFileBtn"
  )
  .addEventListener(
    "click",
    hideFileModal
  );


document
  .getElementById(
    "renameBtn"
  )
  .addEventListener(
    "click",
    renameCurrentFile
  );


document
  .getElementById(
    "deleteBtn"
  )
  .addEventListener(
    "click",
    () =>
      deleteFile(
        currentFile
      )
  );


document
  .getElementById(
    "searchBtn"
  )
  .addEventListener(
    "click",
    openSearch
  );


document
  .getElementById(
    "closeSearchBtn"
  )
  .addEventListener(
    "click",
    closeSearch
  );


document
  .getElementById(
    "askBtn"
  )
  .addEventListener(
    "click",
    runAI
  );


document
  .getElementById(
    "clearAiBtn"
  )
  .addEventListener(
    "click",
    clearAI
  );


document
  .getElementById(
    "applyBtn"
  )
  .addEventListener(
    "click",
    applyAIChange
  );


document
  .getElementById(
    "rejectBtn"
  )
  .addEventListener(
    "click",
    rejectAIChange
  );


document
  .getElementById(
    "explorerBtn"
  )
  .addEventListener(
    "click",
    () => {

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
  );


/* =====================================================
   BOTTOM TABS
===================================================== */

document
  .querySelectorAll(
    ".bottom-tab"
  )
  .forEach(
    button => {

      button.addEventListener(
        "click",
        () => {

          showPanel(
            button.dataset.panel
          );

        }
      );

    }
  );


/* =====================================================
   MODAL EVENTS
===================================================== */

fileModal.addEventListener(
  "click",
  event => {

    if (
      event.target ===
      fileModal
    ) {

      hideFileModal();

    }

  }
);


searchModal.addEventListener(
  "click",
  event => {

    if (
      event.target ===
      searchModal
    ) {

      closeSearch();

    }

  }
);


/* =====================================================
   ENTER KEY
===================================================== */

fileNameInput.addEventListener(
  "keydown",
  event => {

    if (
      event.key ===
      "Enter"
    ) {

      event.preventDefault();

      createNewFile();

    }

  }
);


/* =====================================================
   KEYBOARD SHORTCUTS
===================================================== */

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
      event.key ===
      "Escape"
    ) {

      hideFileModal();

      closeSearch();

    }

  }
);


/* =====================================================
   START
===================================================== */

loadProject();

renderFiles();

renderTabs();

editor.value =
  files[currentFile];

updateLineNumbers();

runProject();

setStatus(
  "DavidCraft Code v3 ready"
);
