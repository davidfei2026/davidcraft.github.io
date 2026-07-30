const WORKER_URL =
  "https://davidcraft-ai.feidavid81022.workers.dev";

const chatForm = document.querySelector("#chat-form");
const messageInput = document.querySelector("#message-input");
const messages = document.querySelector("#messages");
const suggestionButtons =
  document.querySelectorAll(".suggestions button");

let waitingForReply = false;

function addMessage(text, sender) {
  const message = document.createElement("div");
  message.className = `message ${sender}`;

  const name = document.createElement("div");
  name.className = "message-name";
  name.textContent =
    sender === "assistant"
      ? "Coding Assistant"
      : "You";

  const paragraph = document.createElement("p");
  paragraph.textContent = text;

  message.append(name, paragraph);
  messages.appendChild(message);
  messages.scrollTop = messages.scrollHeight;

  return message;
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
    "assistant"
  );

  try {
    const response = await fetch(WORKER_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        message: cleanText
      })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.error || "The request failed."
      );
    }

    loadingMessage.querySelector("p").textContent =
      data.reply;
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
