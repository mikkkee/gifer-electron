'use strict';

const videoClip = require('./movie.js');
let video;

function init() {
  video = document.querySelector('video');
  bindEvents();
  const abc = new Bind({clip: videoClip}, {
    'clip.video': 'input#video-input',
    'clip.start': 'input#start-input',
    'clip.end': 'input#end-input',
    'clip.width': 'input#width-input',
    'clip.height': 'input#height-input',
    'clip.scale': 'input#scale-input',
    'clip.fps': 'input#fps-input',
    'clip.speed': 'input#speed-input'});
}

function bindEvents() {
  // Drag and Drop holder.
  const holder = document.getElementById('holder');
  // Placehold text in holder.
  const dragText = document.getElementById('drag-text');
  // Disable drag and drop event for document.
  document.addEventListener('dragover', idle, false);
  document.addEventListener('drop', idle, false);

  holder.ondragover = idle;
  holder.ondragleave = holder.ondragend = idle;
  holder.ondrop = loadVideo;
}

function idle(e) {
  e.preventDefault();
  return false;
}

function videoError(msg) {
  console.log(msg);
}

function loadVideo(e) {
  e.preventDefault();

  const dragText = document.getElementById('drag-text');
  const file = e.dataTransfer.files[0];

  console.log('File you dragged here is ', file.path);
  videoClip.loadVideo(file.path);

  video.src = file.path;
  dragText.className += ' hidden';
  video.classList.remove('hidden');
  setTimeout(function() {
    if (!video.videoWidth) videoError('Cannot play video');
  }, 200);
}

function reset() {
  // Reset options to values of video file.
}

window.onload = init;
