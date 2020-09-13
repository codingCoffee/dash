const express = require("express");
const { ExpressPeerServer } = require('peer');

const app = express();
const server = require("http").Server(app);
const io = require("socket.io")(server);
const { v4: uuidv4 } = require("uuid");
const path = require("path");

const pkg = require("./package.json");

APP_HOST = process.env.APP_HOST || "127.0.0.1";
APP_PORT = process.env.APP_PORT || 3000;

app.get("/api/info", (req, res) => {
  res.json({
    author: pkg.author,
    description: pkg.description,
    license: pkg.license,
  });
});

app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

app.get("/api/lobby", (req, res) => {
  res.json({ users: ["u1", "u2"] });
});

app.get("/api/createroom", (req, res) => {
  // TODO: use redis later for speed and ephimeral storage
  res.json({ roomid: uuidv4() });
});

app.get("/api/room/:roomid", (req, res) => {
  console.log(req.params.roomid);
  res.json({ access: "denied" });
});

io.on("connection", (socket) => {
  socket.on("join-room", (roomid, userid) => {
    console.log(`RoomID: ${roomid} UserID: ${userid}`);
    socket.join(roomid);
    socket.to(roomid).broadcast.emit("user-connected", userid);

    socket.on("disconnect", () => {
      socket.to(roomid).broadcast.emit("user-disconnected", userid)
    })
  });
});

server.listen(APP_PORT, APP_HOST);

const peerServer = ExpressPeerServer(server, {allow_discovery: true});
app.use('/peerjs', peerServer);

