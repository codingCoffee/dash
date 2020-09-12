// TODO: enable console.log only in DEBUG mode, also debug on Peer conn
const socket = io('/')
// TODO: ssl on peer server
const myPeer = new Peer(undefined, {
  // debug: 1,
  host: "/",
  port: "3001"
})

async function createRoom() {
  const url = "/createroom";
  const response = await fetch(url);
  return response.json();
}

myPeer.on('open', id => {
  console.log("Connected to peer server")
  createRoom().then((room) => {
    socket.emit('join-room', room.roomid, id)
  });
})

socket.on("user-connected", userid => {
  console.log("User connected: " + userid)
})

