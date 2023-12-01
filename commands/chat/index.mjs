// chat.mjs
import { clear, parse } from "../../util/screens.js";
import { prompt, type } from "../../util/io.js";

const API_URL = 'https://oracle.thematrixhasyou.tech/chat';

// Define a list of available commands
const availableCommands = ['logout', 'help', 'joke', /* other commands */];

export default async function chat() {
  while(true) {
    const input = await prompt('You: ');

    if(input === 'exit') break;

    // Check if the input exactly matches a command
    if (availableCommands.includes(input)) {
      try {
        await parse(input); // Execute the command
      } catch (error) {
        type(`Error: ${error.message}`);
      }
    } else {
      // Handle as a normal chat message
      const response = await fetch(API_URL, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({message: input})
      });

      const responseData = await response.json(); // Assuming the response is JSON
      type(`Assistant: ${responseData.message}`); // Replace 'message' with the actual property name of the response message
    }
  }
}
