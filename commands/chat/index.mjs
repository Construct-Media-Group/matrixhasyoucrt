// chat.mjs

import { prompt, type } from "../../util/io.js"; 

export default async function chat() {

  const socket = new WebSocket("ws://cdeg.constructdiversitygroups.com:5543");

  socket.addEventListener('open', () => {
    type('Connected to chat server!');
  });

  socket.addEventListener('message', e => {
    type(`Assistant: ${e.data}`);
  });

  socket.addEventListener('close', () => {
    type('Disconnected from server.');
  });

  while(true) {
    
    const message = await prompt('You: ');

    if(message === 'exit') break;

    socket.send(message);

  }

  socket.close();

}