// chat.mjs

import { getScreen, clear } from "../../util/screens.js";

async function chat() {
  clear();

  return new Promise((resolve) => {
    let container = getScreen();
    container.setAttribute("contenteditable", true);
    container.focus();

    // Create WebSocket connection
    const socket = new WebSocket("ws://cdeg.constructdiversitygroups.com:5543");

    // Connection opened
    socket.addEventListener("open", (event) => {
      console.log("WebSocket connection opened:", event);
    });

    // Listen for messages from the server
    socket.addEventListener("message", (event) => {
      const messageData = JSON.parse(event.data);
      receiveMessage(container, { role: "assistant", text: messageData.text });
    });

    // Connection closed
    socket.addEventListener("close", (event) => {
      console.log("WebSocket connection closed:", event);
    });

    // Connection error
    socket.addEventListener("error", (event) => {
      console.log("WebSocket error:", event);
    });

    container.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        event.preventDefault();
        const text = container.textContent.trim();
        if (text === "") return;

        // Display user message
        receiveMessage(container, { role: "user", text });

        // Send message to the server
        socket.send(JSON.stringify({ text }));

        // Clear input
        container.textContent = "";
      }
    });

    const remove = (event) => {
      event.preventDefault();
      container.remove();
      resolve();
    };

    container.addEventListener("keypress", remove);
    container.addEventListener("click", remove);
  });
}

// Receive message and display in the container
function receiveMessage(container, message) {
  const messageElement = document.createElement("div");
  messageElement.className = "chat-message";

  if (message.role === "user") {
    messageElement.innerHTML = `<strong>You:</strong> ${message.text}`;
  } else {
    messageElement.innerHTML = `<strong>The Oracle:</strong> ${message.text}`;
  }

  container.appendChild(messageElement);
  container.scrollTop = container.scrollHeight;
}

export default chat;
