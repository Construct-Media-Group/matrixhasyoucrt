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

    type(`Assistant: ${response}`);
  }
}
