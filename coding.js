const chatForm = document.querySelector("#chat-form");
const messageInput = document.querySelector("#message-input");
const messages = document.querySelector("#messages");
const suggestionButtons = document.querySelectorAll(".suggestions button");

function addMessage(text, sender) {
  const message = document.createElement("div");

  message.className = `message ${sender}`;

  if (sender === "assistant") {
    message.innerHTML = `
      <div class="message-name">Coding Assistant</div>
      <p></p>
    `;
  } else {
    message.innerHTML = `
      <div class="message-name">You</div>
      <p></p>
    `;
  }

  message.querySelector("p").textContent = text;

  messages.appendChild(message);
  messages.scrollTop = messages.scrollHeight;
}

function createReply(question) {
  const text = question.toLowerCase();

  if (text.includes("html")) {
    return "HTML gives a webpage its structure. It uses elements such as headings, paragraphs, links, images, buttons, and sections.";
  }

  if (text.includes("css")) {
    return "CSS controls how the webpage looks. It handles colors, spacing, fonts, layouts, animations, and mobile design.";
  }

  if (text.includes("javascript")) {
    return "JavaScript adds behavior to a website. It can react to clicks, update content, validate forms, create games, and communicate with APIs.";
  }

  if (text.includes("python")) {
    return "Python is a programming language commonly used for automation, data science, AI, websites, and many other applications.";
  }

  if (text.includes("github pages")) {
    return "GitHub Pages publishes static website files from a GitHub repository. It works well with HTML, CSS, and browser-based JavaScript.";
  }

  if (text.includes("link")) {
    return 'An HTML link uses the anchor element. Example: <a href="about.html">About</a>.';
  }

  if (text.includes("error") || text.includes("fix")) {
    return "Paste the code and the exact error message. A good debugging process is to check spelling, file names, browser console errors, and whether every opening tag or bracket has a matching closing one.";
  }

  if (text.includes("hello") || text.includes("hi")) {
    return "Hello! What are you trying to build?";
  }

  return "I am currently a local demo with a limited set of answers. Try asking about HTML, CSS, JavaScript, Python, links, errors, or GitHub Pages.";
}

function sendMessage(text) {
  const cleanText = text.trim();

  if (!cleanText) {
    return;
  }

  addMessage(cleanText, "user");
  messageInput.value = "";

  window.setTimeout(() => {
    addMessage(createReply(cleanText), "assistant");
  }, 400);
}

chatForm.addEventListener("submit", (event) => {
  event.preventDefault();
  sendMessage(messageInput.value);
});

suggestionButtons.forEach((button) => {
  button.addEventListener("click", () => {
    sendMessage(button.textContent);
  });
});

messageInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter" && !event.shiftKey) {
    event.preventDefault();
    chatForm.requestSubmit();
  }
});
