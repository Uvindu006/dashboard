import { WebSocketServer, WebSocket } from 'ws';

const wss = new WebSocketServer({ port: 3001 });

const MAX_HISTORY = 4;  
const chatHistory = []; 
let clientCounter = 0;  
const clientNames = new Map(); 

console.log('WebSocket server started on ws://localhost:3001');

//  new WebSocket connections
wss.on('connection', function connection(ws) {
  clientCounter += 1;
  const clientName = `Client ${clientCounter}`;
  clientNames.set(ws, clientName);  //  client name
  
  console.log(`${clientName} connected`);

  // send chat history to new client
  ws.send(JSON.stringify({ type: 'history', messages: chatHistory }));

  // listen
  ws.on('message', function incoming(data) {
    console.log(`${clientName} sent:`, data.toString());

    // parse the received message
    try {
      const parsed = JSON.parse(data);
      if (parsed.message) {
        chatHistory.push(parsed.message);

        // limit the history 
        if (chatHistory.length > MAX_HISTORY) {
          chatHistory.splice(0, chatHistory.length - MAX_HISTORY); 
        }
      }
    } catch (e) {
      console.error('Error parsing message:', e);
    }

    // broadcast
    const historyPayload = JSON.stringify({ type: 'history', messages: chatHistory });
    wss.clients.forEach(function each(client) {
      if (client.readyState === WebSocket.OPEN) {
        client.send(historyPayload);
      }
    });
  });

  // Handling disconnections
  ws.on('close', () => {
    console.log(`${clientName} disconnected`);
    clientNames.delete(ws);  
  });

  // Handling errors
  ws.on('error', (error) => {
    console.error('WebSocket error:', error);
  });
});
