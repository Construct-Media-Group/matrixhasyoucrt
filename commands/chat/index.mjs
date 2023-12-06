// chat.mjs
import { clear } from "../../util/screens.js";
import { prompt, type } from "../../util/io.js";

const API_URL = 'https://oracle.thematrixhasyou.tech/chat';

export default async function chat() {
  while(true) {
    const message = await prompt('You: ');

    if(message === 'exit') break;
      
    const response = await fetch(API_URL, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({message})  // sessionId will be automatically included because credentials are set to 'include'
    });
    // Parse the JSON response body
    const data = await response.json();

    // Extract the 'message' field from the JSON response
    const assistantResponse = data.message;

    console.log({assistantResponse});
    type(`Assistant: ${assistantResponse}`);  
  }
} 
