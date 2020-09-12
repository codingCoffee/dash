// TODO: enable console.log only in DEBUG mode, also debug on Peer conn
// TODO: cleanup script.js
// TODO: handle listening on original room
// TODO: console log all connections to server (will be helpful for paranoid mode)

// babel x_x
import 'regenerator-runtime/runtime'

// webrtc deps
import io from 'socket.io-client';
import Peer from 'peerjs';

// tf gesture deps
import * as handpose from '@tensorflow-models/handpose';
import * as tf from '@tensorflow/tfjs-core';
import '@tensorflow/tfjs-backend-webgl';
import '@tensorflow/tfjs-backend-cpu';

// canvas deps
import * as THREE from 'three';
import Stats from 'stats.js';


const socket = io("/");
// TODO: ssl on peer server
const myPeer = new Peer(undefined, {
  host: "/",
  port: window.location.hostname=="localhost" ? "8000":"443",
  path: "/peerjs",
  proxied: true,
});

let PIN;
let model;
const peers = {}

const VIDEO_WIDTH  = 300;
const VIDEO_HEIGHT = 300;
const mobile = isMobile();

const videoGrid = document.getElementById("peer-video-grid");
// const myVideo = document.createElement("video");
// myVideo.muted = true;

const stats = new Stats();
stats.showPanel(0);
document.body.appendChild(stats.dom);

let videoWidth, videoHeight, rafID, ctx, canvas, fingerLookupIndices = {
    thumb: [0, 1, 2, 3, 4],
    indexFinger: [0, 5, 6, 7, 8],
    middleFinger: [0, 9, 10, 11, 12],
    ringFinger: [0, 13, 14, 15, 16],
    pinky: [0, 17, 18, 19, 20]
  };  // for rendering each finger as a polyline


async function setupCamera() {
  console.log("Setting up camera...")
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    throw new Error('Browser API navigator.mediaDevices.getUserMedia not available');
  }
  navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;

  console.log("Requesting camera and microphone access...")
  const video = document.getElementById('video-grid');
  const stream = await navigator.mediaDevices.getUserMedia({
    audio: true,
    video: {
      facingMode: 'user',
      width: mobile ? undefined : VIDEO_WIDTH,
      height: mobile ? undefined : VIDEO_HEIGHT
    },
  })
  setupPeer(stream);
  video.srcObject = stream;
  video.muted = true;
  console.log("Camera accessible")

  return new Promise((resolve) => {
    video.onloadedmetadata = () => {
      resolve(video);
    };
  });
}

socket.on("user-disconnected", (userid) => {
  console.log(`Server Event: New user with UserID ${userid} disconnected`);
  if (peers[userid]){
    peers[userid].close();
  }
});


async function createRoom() {
  const url = "/api/createroom";
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

myPeer.on('open', id => {
  console.log("Connected to peer server")
  PIN = id;
})

document.getElementById("join-room").onclick = function joinRoom() {
  roomid = document.getElementById("roomid").value;
  console.log(`Joining room ${roomid}`);
  socket.emit("join-room", roomid, PIN);
};

document.getElementById("create-room").onclick = function newRoom() {
  createRoom().then((room) => {
    document.getElementById("roomid").value = room.roomid;
    console.log(`RoomID: ${room.roomid} UserID: ${PIN}`);
    socket.emit("join-room", room.roomid, PIN);
    console.log("Connected to peer server");
  });
}

function connectToNewUser(userid, stream) {
  console.log(`Client Event: Calling using with userid ${userid} `);
  const call = myPeer.call(userid, stream);
  console.log(`Creating a video element`);
  const video = document.createElement("video");

  call.on("stream", (userVideoStream) => {
    addVideoStream(video, userVideoStream);
  });

  call.on("close", () => {
    video.remove();
  });

  peers[userid] = call
}

function isMobile() {
  const isAndroid = /Android/i.test(navigator.userAgent);
  const isiOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);
  return isAndroid || isiOS;
}

function drawPoint(y, x, r) {
  ctx.beginPath();
  ctx.arc(x, y, r, 0, 2 * Math.PI);
  ctx.fill();
}

function drawKeypoints(keypoints) {
  const keypointsArray = keypoints;

  for (let i = 0; i < keypointsArray.length; i++) {
    const y = keypointsArray[i][0];
    const x = keypointsArray[i][1];
    drawPoint(x - 2, y - 2, 3);
  }

  const fingers = Object.keys(fingerLookupIndices);
  for (let i = 0; i < fingers.length; i++) {
    const finger = fingers[i];
    const points = fingerLookupIndices[finger].map(idx => keypoints[idx]);
    drawPath(points, false);
  }
}

function drawPath(points, closePath) {
  const region = new Path2D();
  region.moveTo(points[0][0], points[0][1]);
  for (let i = 1; i < points.length; i++) {
    const point = points[i];
    region.lineTo(point[0], point[1]);
  }

  if (closePath) {
    region.closePath();
  }
  ctx.stroke(region);
}

async function setupPeer(stream) {
  console.log("Setting up this browser as a peer...")
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
}

async function loadVideo() {
  const video = await setupCamera();
  video.play();
  return video;
}

const landmarksRealTime = async (video) => {
  async function frameLandmarks() {
    stats.begin();
    ctx.drawImage(video, 0, 0, videoWidth, videoHeight, 0, 0, canvas.width, canvas.height);
    const predictions = await model.estimateHands(video);
    if (predictions.length > 0) {
      const result = predictions[0].landmarks;
      drawKeypoints(result, predictions[0].annotations);
    }
    stats.end();
    rafID = requestAnimationFrame(frameLandmarks);
  };
  frameLandmarks();
};


async function main() {
  console.log("Loading handpose model...")
  await tf.setBackend('webgl');
  model = await handpose.load();
  let video;

  try {
    video = await loadVideo();
  } catch (e) {
    alert(e.message)
    throw e;
  }

  videoWidth  = video.videoWidth;
  videoHeight = video.videoHeight;

  console.log("Setting up canvas...")
  canvas = document.getElementById('canvas');
  canvas.width  = videoWidth;
  canvas.height = videoHeight;

  ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, videoWidth, videoHeight);
  ctx.strokeStyle = 'red';
  ctx.fillStyle   = 'red';

  ctx.translate(canvas.width, 0);
  ctx.scale(-1, 1);

  landmarksRealTime(video);
}

main()

