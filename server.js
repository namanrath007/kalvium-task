// server.js
const express = require("express");
const http = require("http");
const socketIo = require("socket.io");

// Initialize express and http server
const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Static files (for the PDF and front-end assets)
app.use(express.static("public"));

// Keep track of connected clients and their roles
let clients = [];

io.on("connection", (socket) => {
  console.log("New client connected");

  // Assign default role as viewer
  let role = clients.length === 0 ? "admin" : "viewer";
  let pageNum = 1;

  // Add the client to the clients array
  clients.push({ socket, role, pageNum });

  // Send current page to the new client
  socket.emit("setRole", role);
  socket.emit("changePage", pageNum);

  // Handle role assignment
  socket.on("setRole", (assignedRole) => {
    role = assignedRole;
    const client = clients.find((client) => client.socket === socket);
    if (client) client.role = role;
    socket.emit("setRole", role);
  });

  // Handle page change from admin
  socket.on("changePage", (newPage) => {
    if (role === "admin") {
      pageNum = newPage;
      // Broadcast the new page number to all clients
      io.emit("changePage", pageNum);
    }
  });

  // Handle client disconnection
  socket.on("disconnect", () => {
    console.log("Client disconnected");
    clients = clients.filter((client) => client.socket !== socket);
  });
});

// Start the server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
