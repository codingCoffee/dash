const express = require("express");
const app = express();
const server = require("http").Server(app);
const io = require("socket.io")(server);

const pkg = require("./package.json");

APP_HOST = process.env.APP_HOST || "127.0.0.1";
APP_PORT = process.env.APP_PORT || 3000;

app.get("/", (req, res) => {
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

app.get("/room/:roomid", (req, res) => {
  console.log(req.params.roomid);
  res.json({ access: "denied" });
});

server.listen(APP_PORT, APP_HOST);
