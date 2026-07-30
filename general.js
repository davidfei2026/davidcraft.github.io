const WORKER_URL =
  "https://davidcraft-ai.feidavid81022.workers.dev";

const STORAGE_KEY = "davidcraft-general-chat";

const chatForm = document.querySelector("#chat-form");
const messageInput = document.querySelector("#message-input");
const messagesElement = document.querySelector("#messages");
const suggestionButtons =
  document.querySelectorAll(".suggestions button");

let waitingForReply = false;

function loadConversation() {
  try {
    const saved = JSON.parse(
      localStorage.getItem(STORAGE_KEY)
    );

    if (!Array.isArray(saved)) {
      return [];
    }

    return saved.filter((item) => {
      return (
        item &&
        typeof item === "object" &&
        ["user", "assistant"].includes(item.role) &&
        typeof item.content === "string" &&
        item.content.trim().length > 0
      );
    });
  } catch (error) {
    console.error(
      "Could not load the saved conversation:",
      error
    );

    return [];
  }
}

let conversation = loadConversation();

function saveConversation() {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(conversation)
  );
}

function addMessage(text, sender, save = true) {
  const message = document.createElement("div");
  message.className = `message ${sender}`;

  const name = document.createElement("div");
  name.className = "message-name";
  name.textContent =
    sender === "assistant"
      ? "General Assistant"
      : "You";

  const paragraph = document.createElement("p");
  paragraph.textContent = text;

  message.append(name, paragraph);
  messagesElement.appendChild(message);
  messagesElement.scrollTop =
    messagesElement.scrollHeight;

  if (save) {
    conversation.push({
      role:
        sender === "assistant"
          ? "assistant"
          : "user",
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
      item.role === "assistant"
        ? "assistant"
        : "user",
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
  messageInput.disabled = true;

  addMessage(cleanText, "user");
  messageInput.value = "";

  const loadingMessage = addMessage(
    "Thinking…",
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
        assistant: "general",
        messages: conversation
      })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.error || "The request failed."
      );
    }

    loadingMessage.remove();
    addMessage(data.reply, "assistant");
  } catch (error) {
    console.error(error);

    loadingMessage
      .querySelector("p")
      .textContent =
        `Connection error: ${error.message}`;
  } finally {
    waitingForReply = false;
    messageInput.disabled = false;
    messageInput.focus();
  }
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

messageInput.addEventListener(
  "keydown",
  (event) => {
    if (
      event.key === "Enter" &&
      !event.shiftKey
    ) {
      event.preventDefault();
      chatForm.requestSubmit();
    }
  }
);

restoreConversation();
