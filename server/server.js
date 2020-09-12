const express = require("express");
const app = express();
const server = require("http").Server(app);
const io = require("socket.io")(server);
const { v4: uuidv4 } = require("uuid");
const path = require("path");

const pkg = require("./package.json");

APP_HOST = process.env.APP_HOST || "127.0.0.1";
APP_PORT = process.env.APP_PORT || 3000;

// TODO: temporary hack to server client, needs to be separated out
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname + "/../client/index.html"));
});
app.get("/script.js", (req, res) => {
  res.sendFile(path.join(__dirname + "/../client/script.js"));
});

app.get("/info", (req, res) => {
  res.json({
    author: pkg.author,
    description: pkg.description,
    license: pkg.license,
  });
});

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

app.get("/lobby", (req, res) => {
  res.json({ users: ["u1", "u2"] });
});

app.get("/createroom", (req, res) => {
  // TODO: use redis later for speed and ephimeral storage
  res.json({ roomid: uuidv4() });
});

app.get("/room/:roomid", (req, res) => {
  console.log(req.params.roomid);
  res.json({ access: "denied" });
});

io.on("connection", (socket) => {
  socket.on("join-room", (roomid, userid) => {
    console.log(roomid, userid);
    socket.join(roomid);
    socket.to(roomid).broadcast.emit("user-connected", userid);
  });
});

server.listen(APP_PORT, APP_HOST);
