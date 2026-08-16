/*
  NOVA CODE EDITOR
  ----------------

  IMPORTANT:
  Do NOT put your Groq secret API key in this file
  when hosting this on GitHub Pages.

  Instead, configure your existing backend endpoint.

  Example:

  POST /api/groq

  Body:
  {
    "messages": [
      {
        "role": "user",
        "content": "..."
      }
    ]
  }

  The endpoint should return:

  {
    "content": "AI response here"
  }
*/


const files = {
  "index.html": `<!DOCTYPE html>
<html>
<head>
  <title>My Website</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>

  <h1>Hello World!</h1>
  <p>Start building something awesome.</p>

  <script src="script.js"><\/script>
</body>
</html>`,

  "style.css": `body {
  font-family: Arial, sans-serif;
  padding: 40px;
}

h1 {
  color: #2563eb;
}`,

  "script.js": `console.log("NOVA Code is running!");`
};


let currentFile = "index.html";

const editor = document.getElementById("editor");
const preview = document.getElementById("preview");
const currentTab = document.getElementById("currentTab");
const messages = document.getElementById("messages");
const promptBox = document.getElementById("prompt");
const status = document.getElementById("status");


/* ---------------------------
   FILE MANAGEMENT
---------------------------- */

function openFile(filename) {

  saveCurrentFile();

  currentFile = filename;

  editor.value = files[filename];

  currentTab.textContent = filename;

  document.querySelectorAll(".file").forEach(button => {
    button.classList.toggle(
      "active",
      button.dataset.file === filename
    );
  });

  setStatus(`Editing ${filename}`);
}


function saveCurrentFile() {
  files[currentFile] = editor.value;
}


document.querySelectorAll(".file").forEach(button => {

  button.addEventListener("click", () => {
    openFile(button.dataset.file);
  });

});


/* ---------------------------
   EDITOR
---------------------------- */

editor.addEventListener("input", () => {

  files[currentFile] = editor.value;

  setStatus("Unsaved changes");

});


/* Tab key */

editor.addEventListener("keydown", event => {

  if (event.key === "Tab") {

    event.preventDefault();

    const start = editor.selectionStart;
    const end = editor.selectionEnd;

    editor.value =
      editor.value.substring(0, start) +
      "  " +
      editor.value.substring(end);

    editor.selectionStart =
      editor.selectionEnd =
      start + 2;

    files[currentFile] = editor.value;
  }

});


/* ---------------------------
   RUN WEBSITE
---------------------------- */

document.getElementById("runBtn").addEventListener(
  "click",
  runProject
);


function runProject() {

  saveCurrentFile();

  let html = files["index.html"];

  const css = files["style.css"];

  const js = files["script.js"];


  /*
    Insert CSS directly into the page.
  */

  if (css) {

    const styleTag =
      `<style>${css}</style>`;

    html = html.replace(
      "</head>",
      styleTag + "</head>"
    );

  }


  /*
    Insert JavaScript directly into the page.
  */

  if (js) {

    const scriptTag =
      `<script>${js.replace(/<\/script>/gi, "<\\/script>")}<\/script>`;

    html = html.replace(
      "</body>",
      scriptTag + "</body>"
    );

  }


  preview.srcdoc = html;

  setStatus("Running project");

}


/* ---------------------------
   SAVE
---------------------------- */

document.getElementById("saveBtn").addEventListener(
  "click",
  () => {

    saveCurrentFile();

    localStorage.setItem(
      "nova-code-project",
      JSON.stringify(files)
    );

    setStatus("Project saved");

  }
);


/* ---------------------------
   LOAD SAVED PROJECT
---------------------------- */

function loadProject() {

  const saved =
    localStorage.getItem("nova-code-project");

  if (!saved) return;

  try {

    const parsed = JSON.parse(saved);

    Object.assign(files, parsed);

    editor.value = files[currentFile];

  } catch (error) {

    console.error(error);

  }

}


/* ---------------------------
   DOWNLOAD CURRENT FILE
---------------------------- */

document.getElementById("downloadBtn").addEventListener(
  "click",
  () => {

    saveCurrentFile();

    const blob = new Blob(
      [files[currentFile]],
      {
        type: "text/plain"
      }
    );

    const url =
      URL.createObjectURL(blob);

    const link =
      document.createElement("a");

    link.href = url;

    link.download = currentFile;

    link.click();

    URL.revokeObjectURL(url);

    setStatus(`Downloaded ${currentFile}`);

  }
);


/* ---------------------------
   NEW FILE
---------------------------- */

document.getElementById("newFileBtn").addEventListener(
  "click",
  () => {

    const filename =
      prompt("Enter a file name:");

    if (!filename) return;

    if (files[filename]) {

      alert("That file already exists.");

      return;
    }

    files[filename] = "";

    addFileButton(filename);

    openFile(filename);

  }
);


function addFileButton(filename) {

  const container =
    document.querySelector(".files");

  const button =
    document.createElement("button");

  button.className = "file";

  button.dataset.file = filename;

  button.textContent =
    "📄 " + filename;

  button.addEventListener(
    "click",
    () => openFile(filename)
  );

  container.appendChild(button);

}


/* ---------------------------
   AI CHAT
---------------------------- */

document.getElementById("askBtn").addEventListener(
  "click",
  askAI
);


async function askAI() {

  const prompt =
    promptBox.value.trim();

  if (!prompt) return;

  saveCurrentFile();

  addMessage("user", prompt);

  promptBox.value = "";

  const thinking =
    addMessage(
      "ai",
      "Thinking..."
    );

  try {

    const response =
      await callAI(prompt);

    thinking.textContent =
      response;

  } catch (error) {

    thinking.textContent =
      "AI error: " + error.message;

  }

}


/* ---------------------------
   FIX CODE
---------------------------- */

document.getElementById("fixBtn").addEventListener(
  "click",
  fixCode
);


async function fixCode() {

  saveCurrentFile();

  const code =
    editor.value;

  if (!code.trim()) {

    addMessage(
      "ai",
      "There is no code to fix."
    );

    return;
  }


  const prompt = `
Fix the following ${currentFile} code.

Return the complete corrected file.

Do not explain it.
Do not use markdown fences.

CODE:

${code}
`;


  addMessage(
    "user",
    "Fix my current code."
  );


  const thinking =
    addMessage(
      "ai",
      "Analyzing your code..."
    );


  try {

    const result =
      await callAI(prompt);


    /*
      If the model returns markdown
      fences, remove them.
    */

    const cleaned =
      cleanCode(result);


    editor.value =
      cleaned;

    files[currentFile] =
      cleaned;


    thinking.textContent =
      "I fixed the code. The changes are now in the editor.";


    setStatus(
      `${currentFile} updated by AI`
    );


  } catch (error) {

    thinking.textContent =
      "AI error: " + error.message;

  }

}


/* ---------------------------
   GROQ / AI BACKEND
---------------------------- */

async function callAI(userPrompt) {

  /*
    CHANGE THIS URL to your existing
    AI backend endpoint.

    Example:

    /api/groq

    Your backend should use your Groq API key.
  */

  const AI_ENDPOINT = "/api/groq";


  const projectContext = `
CURRENT FILE:
${currentFile}

PROJECT FILES:

--- index.html ---
${files["index.html"] || ""}

--- style.css ---
${files["style.css"] || ""}

--- script.js ---
${files["script.js"] || ""}

OTHER FILES:
${Object.keys(files)
  .filter(name =>
    !["index.html", "style.css", "script.js"].includes(name)
  )
  .map(name =>
    `--- ${name} ---\n${files[name]}`
  )
  .join("\n\n")}
`;


  const systemPrompt = `
You are NOVA AI, an expert web development assistant.

The user is working inside a browser code editor.

You can help with:
- HTML
- CSS
- JavaScript
- debugging
- UI design
- website functionality
- project architecture

Always consider the complete project context.

When the user asks for code changes, provide practical code
that can be placed directly into the project.

Project context:

${projectContext}
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
              content: systemPrompt
            },

            {
              role: "user",
              content: userPrompt
            }

          ]

        })
      }
    );


  if (!response.ok) {

    throw new Error(
      `AI server returned ${response.status}`
    );

  }


  const data =
    await response.json();


  /*
    Supports either:

    { content: "..." }

    or

    {
      choices: [
        {
          message: {
            content: "..."
          }
        }
      ]
    }
  */

  if (data.content) {

    return data.content;

  }


  if (
    data.choices &&
    data.choices[0] &&
    data.choices[0].message
  ) {

    return data.choices[0].message.content;

  }


  throw new Error(
    "Invalid AI response."
  );

}


/* ---------------------------
   MESSAGE UI
---------------------------- */

function addMessage(type, text) {

  const message =
    document.createElement("div");

  message.className =
    `message ${type}`;

  message.textContent =
    text;

  messages.appendChild(message);

  messages.scrollTop =
    messages.scrollHeight;

  return message;

}


/* ---------------------------
   CLEAN AI CODE
---------------------------- */

function cleanCode(code) {

  return code
    .replace(/^```[a-zA-Z0-9_-]*\s*/, "")
    .replace(/\s*```$/, "")
    .trim();

}


/* ---------------------------
   STATUS
---------------------------- */

function setStatus(text) {

  status.textContent =
    text;

}


/* ---------------------------
   KEYBOARD SHORTCUTS
---------------------------- */

document.addEventListener(
  "keydown",
  event => {

    /*
      Ctrl/Cmd + S
    */

    if (
      (event.ctrlKey || event.metaKey) &&
      event.key.toLowerCase() === "s"
    ) {

      event.preventDefault();

      saveCurrentFile();

      localStorage.setItem(
        "nova-code-project",
        JSON.stringify(files)
      );

      setStatus("Project saved");

    }


    /*
      Ctrl/Cmd + Enter
      = Run
    */

    if (
      (event.ctrlKey || event.metaKey) &&
      event.key === "Enter"
    ) {

      event.preventDefault();

      runProject();

    }

  }
);


/* ---------------------------
   INITIALIZE
---------------------------- */

loadProject();

editor.value =
  files[currentFile];

runProject();
