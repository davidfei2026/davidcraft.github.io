"use strict";

/*
=========================================
NOVA CODE — iPad Version
=========================================
*/


/* ================================
   PROJECT FILES
================================ */

const files = {
  "index.html": `<!DOCTYPE html>
<html>
<head>
  <title>My Website</title>
  <link rel="stylesheet" href="style.css">
</head>

<body>

  <h1>Hello World!</h1>

  <p>
    Start building your website.
  </p>

  <button onclick="sayHello()">
    Click Me
  </button>

  <script src="script.js"><\/script>

</body>
</html>`,

  "style.css": `body {
  font-family: Arial, sans-serif;
  padding: 40px;
}

h1 {
  color: #2563eb;
}

button {
  padding: 10px 16px;
  border: 0;
  border-radius: 8px;
  background: #2563eb;
  color: white;
}`,

  "script.js": `function sayHello() {
  alert("Hello from NOVA Code!");
}`
};


let currentFile = "index.html";


/* ================================
   ELEMENTS
================================ */

const editor =
  document.getElementById("editor");

const preview =
  document.getElementById("preview");

const currentTab =
  document.getElementById("currentTab");

const status =
  document.getElementById("status");

const messages =
  document.getElementById("messages");

const promptBox =
  document.getElementById("prompt");


/* ================================
   SAFE CLICK / TOUCH HANDLER
================================ */

function tap(element, callback) {

  if (!element) return;

  let lastTouch = 0;

  element.addEventListener(
    "touchend",
    event => {

      event.preventDefault();

      lastTouch = Date.now();

      callback(event);

    },
    {
      passive: false
    }
  );


  element.addEventListener(
    "click",
    event => {

      /*
        Avoid firing twice on iPad.
      */

      if (
        Date.now() - lastTouch < 700
      ) {
        return;
      }

      callback(event);

    }
  );
}


/* ================================
   STATUS
================================ */

function setStatus(text) {

  status.textContent = text;

}


/* ================================
   OPEN FILE
================================ */

function openFile(filename) {

  if (!files.hasOwnProperty(filename)) {
    return;
  }


  /*
    Save the current file first.
  */

  files[currentFile] =
    editor.value;


  currentFile =
    filename;


  editor.value =
    files[currentFile];


  currentTab.textContent =
    currentFile;


  document
    .querySelectorAll(".file")
    .forEach(button => {

      button.classList.toggle(
        "active",
        button.dataset.file === currentFile
      );

    });


  setStatus(
    "Editing " + currentFile
  );

}


/* ================================
   FILE BUTTONS
================================ */

document
  .querySelectorAll(".file")
  .forEach(button => {

    tap(
      button,
      () => {
        openFile(button.dataset.file);
      }
    );

  });


/* ================================
   EDITOR INPUT
================================ */

editor.addEventListener(
  "input",
  () => {

    files[currentFile] =
      editor.value;

    setStatus(
      "Unsaved changes"
    );

  }
);


/* ================================
   TAB KEY
================================ */

editor.addEventListener(
  "keydown",
  event => {

    if (event.key !== "Tab") {
      return;
    }

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

  }
);


/* ================================
   RUN
================================ */

function runProject() {

  files[currentFile] =
    editor.value;


  let html =
    files["index.html"];


  const css =
    files["style.css"] || "";


  const js =
    files["script.js"] || "";


  /*
    Add CSS.
  */

  if (css.trim()) {

    html =
      html.replace(
        "</head>",
        `<style>${css}</style></head>`
      );

  }


  /*
    Add JavaScript.
  */

  if (js.trim()) {

    const safeJS =
      js.replace(
        /<\/script>/gi,
        "<\\/script>"
      );


    html =
      html.replace(
        "</body>",
        `<script>${safeJS}<\/script></body>`
      );

  }


  preview.srcdoc =
    html;


  setStatus(
    "Preview updated"
  );

}


/* ================================
   RUN BUTTON
================================ */

tap(
  document.getElementById("runBtn"),
  runProject
);


/* ================================
   SAVE
================================ */

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
      "Could not save project"
    );

  }

}


tap(
  document.getElementById("saveBtn"),
  saveProject
);


/* ================================
   LOAD PROJECT
================================ */

function loadProject() {

  try {

    const saved =
      localStorage.getItem(
        "nova-code-project"
      );


    if (!saved) {
      return;
    }


    const parsed =
      JSON.parse(saved);


    Object.keys(parsed).forEach(
      filename => {

        files[filename] =
          parsed[filename];

        createFileButton(
          filename
        );

      }
    );


  } catch (error) {

    console.log(
      "No saved project."
    );

  }

}


/* ================================
   DOWNLOAD
================================ */

function downloadCurrentFile() {

  files[currentFile] =
    editor.value;


  const blob =
    new Blob(
      [files[currentFile]],
      {
        type: "text/plain;charset=utf-8"
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


  link.remove();


  setTimeout(
    () => {
      URL.revokeObjectURL(url);
    },
    1000
  );


  setStatus(
    "Downloaded " + currentFile
  );

}


tap(
  document.getElementById("downloadBtn"),
  downloadCurrentFile
);


/* ================================
   NEW FILE
================================ */

function newFile() {

  showFileDialog();

}


tap(
  document.getElementById("newFileBtn"),
  newFile
);


/* ================================
   FILE DIALOG
================================ */

function showFileDialog() {

  /*
    We use our own dialog instead
    of window.prompt().
  */

  const overlay =
    document.createElement("div");


  overlay.style.position =
    "fixed";

  overlay.style.inset =
    "0";

  overlay.style.background =
    "rgba(0,0,0,.7)";

  overlay.style.display =
    "flex";

  overlay.style.alignItems =
    "center";

  overlay.style.justifyContent =
    "center";

  overlay.style.zIndex =
    "9999";

  overlay.style.padding =
    "20px";


  const box =
    document.createElement("div");


  box.style.width =
    "min(400px, 100%)";

  box.style.background =
    "#171b23";

  box.style.border =
    "1px solid #303642";

  box.style.borderRadius =
    "12px";

  box.style.padding =
    "20px";


  const title =
    document.createElement("div");


  title.textContent =
    "Create New File";


  title.style.fontWeight =
    "700";

  title.style.marginBottom =
    "12px";


  const input =
    document.createElement("input");


  input.type =
    "text";

  input.placeholder =
    "example.js";


  input.style.width =
    "100%";

  input.style.padding =
    "12px";

  input.style.borderRadius =
    "8px";

  input.style.border =
    "1px solid #39404d";

  input.style.background =
    "#0b0d12";

  input.style.color =
    "white";

  input.style.fontSize =
    "16px";


  const actions =
    document.createElement("div");


  actions.style.display =
    "flex";

  actions.style.gap =
    "8px";

  actions.style.marginTop =
    "12px";


  const cancel =
    document.createElement("button");


  cancel.textContent =
    "Cancel";


  const create =
    document.createElement("button");


  create.textContent =
    "Create";


  [cancel, create].forEach(
    button => {

      button.style.flex =
        "1";

      button.style.padding =
        "12px";

      button.style.border =
        "0";

      button.style.borderRadius =
        "8px";

      button.style.background =
        "#29303a";

      button.style.color =
        "white";

      button.style.fontWeight =
        "700";

    }
  );


  create.style.background =
    "#2563eb";


  actions.appendChild(
    cancel
  );

  actions.appendChild(
    create
  );


  box.appendChild(
    title
  );

  box.appendChild(
    input
  );

  box.appendChild(
    actions
  );


  overlay.appendChild(
    box
  );


  document.body.appendChild(
    overlay
  );


  setTimeout(
    () => input.focus(),
    100
  );


  tap(
    cancel,
    () => {
      overlay.remove();
    }
  );


  tap(
    create,
    () => {

      const filename =
        input.value.trim();


      if (!filename) {
        return;
      }


      if (
        files.hasOwnProperty(
          filename
        )
      ) {

        alert(
          "That file already exists."
        );

        return;
      }


      files[filename] =
        "";


      createFileButton(
        filename
      );


      overlay.remove();


      openFile(
        filename
      );

    }
  );


  input.addEventListener(
    "keydown",
    event => {

      if (event.key === "Enter") {

        event.preventDefault();

        create.click();

      }

    }
  );

}


/* ================================
   CREATE FILE BUTTON
================================ */

function createFileButton(
  filename
) {

  /*
    Don't duplicate buttons.
  */

  if (
    document.querySelector(
      `[data-file="${CSS.escape(filename)}"]`
    )
  ) {
    return;
  }


  const container =
    document.querySelector(
      ".files"
    );


  const button =
    document.createElement(
      "button"
    );


  button.type =
    "button";

  button.className =
    "file";

  button.dataset.file =
    filename;


  let icon =
    "📄";


  if (
    filename.endsWith(".css")
  ) {
    icon = "🎨";
  }

  else if (
    filename.endsWith(".js")
  ) {
    icon = "⚡";
  }


  button.textContent =
    icon + " " + filename;


  container.appendChild(
    button
  );


  tap(
    button,
    () => {
      openFile(filename);
    }
  );

}


/* ================================
   AI MESSAGE
================================ */

function addMessage(
  type,
  text
) {

  const message =
    document.createElement(
      "div"
    );


  message.className =
    "message " + type;


  message.textContent =
    text;


  messages.appendChild(
    message
  );


  messages.scrollTop =
    messages.scrollHeight;


  return message;

}


/* ================================
   ASK AI
================================ */

async function askAI() {

  const prompt =
    promptBox.value.trim();


  if (!prompt) {

    addMessage(
      "ai",
      "Type something for me to build first."
    );

    return;

  }


  files[currentFile] =
    editor.value;


  addMessage(
    "user",
    prompt
  );


  promptBox.value =
    "";


  const responseMessage =
    addMessage(
      "ai",
      "Thinking..."
    );


  try {

    const result =
      await callAI(
        prompt
      );


    responseMessage.textContent =
      result;


  } catch (error) {

    responseMessage.textContent =
      "AI error: " +
      error.message;

  }

}


tap(
  document.getElementById("askBtn"),
  askAI
);


/* ================================
   FIX CODE
================================ */

async function fixCode() {

  files[currentFile] =
    editor.value;


  if (
    !editor.value.trim()
  ) {

    addMessage(
      "ai",
      "There is no code to fix."
    );

    return;

  }


  addMessage(
    "user",
    "Fix my current code."
  );


  const responseMessage =
    addMessage(
      "ai",
      "Checking the code..."
    );


  const prompt = `
Fix the current ${currentFile}.

Return ONLY the complete corrected file.
Do not use markdown code fences.
Do not explain the answer.

CURRENT CODE:

${editor.value}
`;


  try {

    const result =
      await callAI(
        prompt
      );


    const cleaned =
      cleanCode(
        result
      );


    editor.value =
      cleaned;


    files[currentFile] =
      cleaned;


    responseMessage.textContent =
      "Done — I updated the code in the editor.";


    setStatus(
      "AI updated " +
      currentFile
    );


  } catch (error) {

    responseMessage.textContent =
      "AI error: " +
      error.message;

  }

}


tap(
  document.getElementById("fixBtn"),
  fixCode
);


/* ================================
   GROQ BACKEND
================================ */

async function callAI(
  userPrompt
) {

  /*
    CHANGE THIS to your existing
    Groq backend endpoint.

    Do NOT put the Groq secret
    directly into this file.
  */

  const AI_ENDPOINT =
    "/api/groq";


  const context = `
CURRENT FILE:
${currentFile}


--- index.html ---

${files["index.html"] || ""}


--- style.css ---

${files["style.css"] || ""}


--- script.js ---

${files["script.js"] || ""}


USER REQUEST:

${userPrompt}
`;


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
                "You are NOVA AI, an expert web coding assistant. Help the user create and debug HTML, CSS and JavaScript."
            },

            {
              role: "user",

              content:
                context
            }

          ]

        })
      }
    );


  if (!response.ok) {

    throw new Error(
      "AI server returned " +
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
    data.choices[0].message &&
    typeof data.choices[0].message.content ===
      "string"
  ) {

    return data.choices[0].message.content;

  }


  throw new Error(
    "Invalid AI response."
  );

}


/* ================================
   CLEAN CODE
================================ */

function cleanCode(
  code
) {

  return code
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


/* ================================
   KEYBOARD SHORTCUTS
================================ */

document.addEventListener(
  "keydown",
  event => {

    /*
      Save:
      Cmd + S on iPad keyboard
    */

    if (
      (event.metaKey ||
       event.ctrlKey) &&
      event.key.toLowerCase() === "s"
    ) {

      event.preventDefault();

      saveProject();

    }


    /*
      Run:
      Cmd + Enter
    */

    if (
      (event.metaKey ||
       event.ctrlKey) &&
      event.key === "Enter"
    ) {

      event.preventDefault();

      runProject();

    }

  }
);


/* ================================
   INITIALIZE
================================ */

loadProject();


editor.value =
  files[currentFile];


runProject();


setStatus(
  "NOVA Code ready"
);
