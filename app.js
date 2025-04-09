// Import required modules
const express = require('express');
const path = require('path');
const EventEmitter = require('events');

// Set up port for the server
const port = process.env.PORT || 3000;

// Create Express application
const app = express();

// Set up static file serving for the public directory
app.use(express.static(__dirname + '/public'));

// Create event emitter for chat functionality
const chatEmitter = new EventEmitter();

/**
 * Responds with plain text
 * 
 * @param {http.IncomingMessage} req
 * @param {http.ServerResponse} res
 */
function respondText(req, res) {
  res.setHeader('Content-Type', 'text/plain');
  res.end('hi');
}

/**
 * Responds with JSON
 * 
 * @param {http.IncomingMessage} req
 * @param {http.ServerResponse} res
 */
function respondJson(req, res) {
  // Using Express's built-in json method
  res.json({
    text: 'hi',
    numbers: [1, 2, 3]
  });
}

/**
 * Responds with a 404 not found
 * 
 * @param {http.IncomingMessage} req
 * @param {http.ServerResponse} res
 */
function respondNotFound(req, res) {
  res.writeHead(404, { 'Content-Type': 'text/plain' });
  res.end('Not Found');
}

/**
 * Responds with the input string in various formats
 * 
 * @param {http.IncomingMessage} req
 * @param {http.ServerResponse} res
 */
function respondEcho(req, res) {
  // Using Express's built-in query parsing
  const { input = '' } = req.query;

  res.json({
    normal: input,
    shouty: input.toUpperCase(),
    charCount: input.length,
    backwards: input.split('').reverse().join('')
  });
}

/**
 * Serves up the chat.html file
 * 
 * @param {http.IncomingMessage} req
 * @param {http.ServerResponse} res
 */
function chatApp(req, res) {
  res.sendFile(path.join(__dirname, '/chat.html'));
}

/**
 * Processes incoming chat messages and broadcasts them
 * 
 * @param {http.IncomingMessage} req
 * @param {http.ServerResponse} res
 */
function respondChat(req, res) {
  const { message } = req.query;
  
  // Emit the message to all connected clients
  chatEmitter.emit('message', message);
  res.end();
}

/**
 * This endpoint will respond to the client with a stream of server sent events
 * 
 * @param {http.IncomingMessage} req
 * @param {http.ServerResponse} res
 */
function respondSSE(req, res) {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Connection': 'keep-alive'
  });

  // Function to handle new messages
  const onMessage = message => res.write(`data: ${message}\n\n`);
  
  // Register the message handler
  chatEmitter.on('message', onMessage);

  // Clean up when connection closes
  res.on('close', () => {
    chatEmitter.off('message', onMessage);
  });
}

// Set up routes
app.get('/', chatApp);
app.get('/text', respondText);  // Added an additional route for text response
app.get('/json', respondJson);
app.get('/echo', respondEcho);
app.get('/chat', respondChat);
app.get('/sse', respondSSE);

// Start the server
app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});