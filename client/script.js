async function createRoom() {
  const url = "/createroom";
  const response = await fetch(url);
  return response.json();
}
createRoom().then((room) => {
  console.log(room.roomid);
});
