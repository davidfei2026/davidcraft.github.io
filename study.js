const WORKER_URL =
  "https://davidcraft-ai.feidavid81022.workers.dev";

const chatForm = document.querySelector("#chat-form");
const messageInput = document.querySelector("#message-input");
const messagesElement = document.querySelector("#messages");
const suggestionButtons =
  document.querySelectorAll(".suggestions button");

let waitingForReply = false;

let conversation = JSON.parse(
  localStorage.getItem("davidcraft-study-chat")
) || [];

function saveConversation() {
  localStorage.setItem(
    "davidcraft-study-chat",
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
      ? "Study Assistant"
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
  if (!Array.isArray(conversation)) {
    conversation = [];
    saveConversation();
    return;
  }

  conversation = conversation.filter((item) => {
    return (
      item &&
      (item.role === "user" || item.role === "assistant") &&
      typeof item.content === "string"
    );
  });

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
        messages: conversation
      })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "The request failed.");
    }

    loadingMessage.remove();

    addMessage(
      data.reply || "The Study Assistant returned no response.",
      "assistant"
    );
  } catch (error) {
    console.error(error);

    loadingMessage.querySelector("p").textContent =
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

messageInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter" && !event.shiftKey) {
    event.preventDefault();
    chatForm.requestSubmit();
  }
});

restoreConversation();
