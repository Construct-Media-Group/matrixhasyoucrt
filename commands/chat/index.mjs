// chat.mjs
import { clear, parse } from "../../util/screens.js";
import { prompt, type } from "../../util/io.js";

const API_URL = 'https://oracle.thematrixhasyou.tech/chat';

// Define a list of available commands
const availableCommands = ['logout', 'help', 'joke', /* other commands */];

export default async function chat() {
  while(true) {
    const message = await prompt('You: ');
    console.log(`Simulant: ${message}`)
    if(message === 'exit') break;

    type('WAITING...');

    const response = await fetch(API_URL, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({message: message})  // sessionId will be automatically included because credentials are set to 'include'
    });
    // Parse the JSON response body

    const responseData = await response.json();
const assistantResponse = JSON.stringify(responseData.message)
  .replace(/\\n/g, ' ')
  .replace(/\n/g, ' ')
  .replace(/\\'/g, "'")
  .replace(/\\"/g, '"')
  .replace(/\\&/g, '&')
  .replace(/\\r/g, '\r')
  .replace(/\\t/g, '\t')
  .replace(/\\b/g, '\b')
  .replace(/\\f/g, '\f');

    console.log(`Oracle: ${assistantResponse}`);
    await type(`Assistant: ${assistantResponse}`);  
  }
} 
