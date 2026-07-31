const API_URL =
  "https://davidcraft-ai.feidavid81022.workers.dev";

const STORAGE_KEY = "davidcraft-writing-chat";

const chatForm = document.getElementById("chat-form");
const messageInput = document.getElementById("message-input");
const chatMessages = document.getElementById("chat-messages");
const sendButton = document.getElementById("send-button");
const themeButton = document.getElementById("theme-button");
const promptButtons = document.querySelectorAll("[data-prompt]");

let conversation = loadConversation();

function loadConversation() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));

    if (!Array.isArray(saved)) {
      return [];
    }

    return saved.filter((message) => {
      return (
        message &&
        (message.role === "user" || message.role === "assistant") &&
        typeof message.content === "string"
      );
    });
  } catch {
    return [];
  }
}

function saveConversation() {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(conversation.slice(-20))
  );
}

function addMessage(role, content) {
  const message = document.createElement("article");

  message.className =
    role === "user"
      ? "message user-message"
      : "message assistant-message";

  const label = document.createElement("strong");
  label.textContent =
    role === "user" ? "You" : "Writing Assistant";

  const paragraph = document.createElement("p");
  paragraph.textContent = content;

  message.append(label, paragraph);
  chatMessages.appendChild(message);

  chatMessages.scrollTop = chatMessages.scrollHeight;

  return message;
}

async function sendMessage(text) {
  const cleanText = text.trim();

  if (!cleanText) {
    return;
  }

  addMessage("user", cleanText);

  conversation.push({
    role: "user",
    content: cleanText
  });

  saveConversation();

  messageInput.value = "";
  messageInput.disabled = true;
  sendButton.disabled = true;
  sendButton.textContent = "Writing...";

  const temporaryMessage = addMessage(
    "assistant",
    "Thinking..."
  );

  try {
    const response = await fetch(API_URL, {
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

    temporaryMessage.remove();

    if (!response.ok) {
      throw new Error(
        data.error || "The Writing Assistant could not respond."
      );
    }

    const reply =
      typeof data.reply === "string"
        ? data.reply
        : "The Writing Assistant returned an empty response.";

    addMessage("assistant", reply);

    conversation.push({
      role: "assistant",
      content: reply
    });

    saveConversation();
  } catch (error) {
    temporaryMessage.remove();

    addMessage(
      "assistant",
      `Connection error: ${error.message}`
    );

    console.error(error);
  } finally {
    messageInput.disabled = false;
    sendButton.disabled = false;
    sendButton.textContent = "Send";
    messageInput.focus();
  }
}

chatForm.addEventListener("submit", (event) => {
  event.preventDefault();
  sendMessage(messageInput.value);
});

promptButtons.forEach((button) => {
  button.addEventListener("click", () => {
    messageInput.value = button.dataset.prompt || "";
    messageInput.focus();
  });
});

messageInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter" && !event.shiftKey) {
    event.preventDefault();
    chatForm.requestSubmit();
  }
});

if (themeButton) {
  themeButton.addEventListener("click", () => {
    document.body.classList.toggle("dark-theme");
  });
}
