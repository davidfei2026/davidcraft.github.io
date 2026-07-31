const WORKER_URL =
  "https://davidcraft-ai.feidavid81022.workers.dev";

const STORAGE_KEY = "davidcraft-writing-chat";

const chatForm = document.querySelector("#chat-form");
const messageInput = document.querySelector("#message-input");
const messagesElement = document.querySelector("#messages");
const suggestionButtons =
  document.querySelectorAll(".suggestions button");

let waitingForReply = false;
let conversation = loadConversation();

function loadConversation() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));

    if (!Array.isArray(saved)) {
      return [];
    }

    return saved
      .filter((item) => {
        return (
          item &&
          (item.role === "user" || item.role === "assistant") &&
          typeof item.content === "string"
        );
      })
      .slice(-20);
  } catch (error) {
    console.error("Could not load saved conversation:", error);
    return [];
  }
}

function saveConversation() {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(conversation.slice(-20))
  );
}

function addMessage(text, sender, save = true) {
  const message = document.createElement("div");
  message.className = `message ${sender}`;

  const name = document.createElement("div");
  name.className = "message-name";
  name.textContent =
    sender === "assistant"
      ? "Writing Assistant"
      : "You";

  const paragraph = document.createElement("p");
  paragraph.textContent = text;

  message.append(name, paragraph);
  messagesElement.appendChild(message);

  messagesElement.scrollTop = messagesElement.scrollHeight;

  if (save) {
    conversation.push({
      role: sender === "assistant" ? "assistant" : "user",
      content: text
    });

    conversation = conversation.slice(-20);
    saveConversation();
  }

  return message;
}

function restoreConversation() {
  if (conversation.length === 0) {
    return;
  }

  messagesElement.innerHTML = "";

  conversation.forEach((item) => {
    addMessage(
      item.content,
      item.role === "assistant" ? "assistant" : "user",
      false
    );
  });
}

async function sendMessage(text) {
  const cleanText = text.trim();

  if (!cleanText || waitingForReply) {
    return;
  }

  waitingForReply = true;

  const submitButton = chatForm.querySelector(
    'button[type="submit"]'
  );

  messageInput.disabled = true;
  submitButton.disabled = true;

  addMessage(cleanText, "user");

  messageInput.value = "";

  const loadingMessage = addMessage(
    "Thinking...",
    "assistant",
    false
  );

  try {
    const response = await fetch(WORKER_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        assistant: "writing",
        messages: conversation
      })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.error || "The Writing Assistant could not respond."
      );
    }

    const reply =
      typeof data.reply === "string" && data.reply.trim()
        ? data.reply.trim()
        : "The Writing Assistant returned an empty response.";

    loadingMessage.remove();
    addMessage(reply, "assistant");
  } catch (error) {
    console.error(error);

    const paragraph = loadingMessage.querySelector("p");

    paragraph.textContent =
      `Connection error: ${error.message}`;
  } finally {
    waitingForReply = false;
    messageInput.disabled = false;
    submitButton.disabled = false;
    messageInput.focus();
  }
}

chatForm.addEventListener("submit", (event) => {
  event.preventDefault();
  sendMessage(messageInput.value);
});

suggestionButtons.forEach((button) => {
  button.addEventListener("click", () => {
    messageInput.value = button.textContent.trim();
    messageInput.focus();
  });
});

messageInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter" && !event.shiftKey) {
    event.preventDefault();
    chatForm.requestSubmit();
  }
});

restoreConversation();
