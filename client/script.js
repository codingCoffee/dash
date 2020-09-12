// TODO: enable console.log only in DEBUG mode, also debug on Peer conn
// TODO: cleanup script.js
// TODO: handle listening on original room
// TODO: console log all connections to server (will be helpful for paranoid mode)
const socket = io("/");
// TODO: ssl on peer server
const myPeer = new Peer(undefined, {
  // debug: 1,
  host: "/",
  port: "3001",
});

const peers = {}

const videoGrid = document.getElementById("video-grid");
const myVideo = document.createElement("video");
myVideo.muted = true;

navigator.mediaDevices
  .getUserMedia({
    video: true,
    audio: true,
  })
  .then((stream) => {
    addVideoStream(myVideo, stream);

    myPeer.on("call", (call) => {
      call.answer(stream);

      const video = document.createElement("video");
      call.on("stream", (userVideoStream) => {
        addVideoStream(video, userVideoStream);
      });
    });

    socket.on("user-connected", (userid) => {
      console.log(`Server Event: New user with UserID ${userid} connected`);
      connectToNewUser(userid, stream);
    });
  });

socket.on("user-disconnected", (userid) => {
  console.log(`Server Event: New user with UserID ${userid} disconnected`);
  if (peers[userid]){
    peers[userid].close();
  }
});


async function createRoom() {
  const url = "/createroom";
  const response = await fetch(url);
  return response.json();
}

function addVideoStream(video, stream) {
  console.log("Appending new video stream");
  video.srcObject = stream;
  video.addEventListener("loadedmetadata", () => {
    video.play();
  });
  videoGrid.append(video);
}

let PIN;
document.getElementById("joinroom").onclick = function joinRoom() {
  roomid = document.getElementById("roomid").value;
  console.log(`Joining room ${roomid}`);
  socket.emit("join-room", roomid, PIN);
};

myPeer.on("open", (id) => {
  console.log("Connected to peer server");
  createRoom().then((room) => {
    document.getElementById("roomid").value = room.roomid;
    console.log(`RoomID: ${room.roomid} UserID: ${id}`);
    PIN = id;
    socket.emit("join-room", room.roomid, id);
  });
});

function connectToNewUser(userid, stream) {
  console.log(`Client Event: Calling using with userid ${userid} `);
  const call = myPeer.call(userid, stream);
  const video = document.createElement("video");

  call.on("stream", (userVideoStream) => {
    addVideoStream(video, userVideoStream);
  });

  call.on("close", () => {
    video.remove();
  });

  peers[userid] = call
}
