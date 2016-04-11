'use strict';

const videoClip = require('./movie.js');
const remote = require('electron').remote;
const Menu = require('electron').remote.Menu;
const MenuItem = require('electron').remote.MenuItem;
let video;

function Init() {
  video = document.querySelector('video');
  BindEvents();
}

function BindEvents() {
  // Drag and Drop holder.
  const holder = document.getElementById('holder');
  // Placehold text in holder.
  const dragText = document.getElementById('drag-text');
  const doScale = document.querySelector('#do-scale');
  const makeBtn = document.querySelector('#make-gif');
  const resetBtn = document.querySelector('#reset');
  const gvSwitch = document.querySelector('#gif-video-switch');
  // Disable drag and drop event for document.
  document.addEventListener('dragover', Idle, false);
  document.addEventListener('drop', Idle, false);

  holder.ondragover = Idle;
  holder.ondragleave = holder.ondragend = Idle;
  holder.ondrop = LoadVideoFromDrop;

  doScale.onchange = ToggleScale;

  makeBtn.addEventListener('click', function(){videoClip.MakeGIF();});
  resetBtn.addEventListener('click', Reset);
  gvSwitch.addEventListener('click', function(){ToggleGV(event);});

  const bind = new Bind({clip: videoClip}, {
    'clip.video': 'input#video-input',
    'clip.start': {
      dom: 'input#start-input',
      callback: CalDuration,
    },
    'clip.end': {
      dom: 'input#end-input',
      callback: CalDuration,
    },
    'clip.width': 'input#width-input',
    'clip.height': 'input#height-input',
    'clip.scale': {
      dom: 'input#scale-input',
      callback: videoClip.UpdateWithScale,
    },
    'clip.fps': 'input#fps-input',
    'clip.speed': 'input#speed-input',
    'clip.mirror': 'input#do-mirror'
    });
}

function ToggleGV(event) {
  const video = document.querySelector('video');
  const gif = document.querySelector('#gif');
  const dragText = document.getElementById('drag-text');
  if (event.target.checked) {
    video.classList.remove('hidden');
    gif.className += ' hidden';
    dragText.className += ' hidden';
  } else {
    video.className += ' hidden';
    gif.classList.remove('hidden');
    dragText.className += ' hidden';
  }
}

function ToggleScale() {
  const doScale = document.querySelector('#do-scale');
  const scaleInput = document.querySelector('input#scale-input');
  const heightInput = document.querySelector('input#height-input');
  const widthInput = document.querySelector('input#width-input');
  if (doScale.checked) {
    scaleInput.removeAttribute('disabled');
    heightInput.setAttribute('disabled', '');
    widthInput.setAttribute('disabled', '');
  } else {
    scaleInput.setAttribute('disabled', '');
    heightInput.removeAttribute('disabled');
    widthInput.removeAttribute('disabled');
  }
}

function CalDuration() {
  const duration = document.querySelector('input#duration-input');
  duration.value = videoClip.Duration();
}

function Idle(e) {
  e.preventDefault();
  return false;
}

function VideoError(msg) {
  console.log(msg);
}

function LoadVideo(videoFile) {
  videoClip.LoadVideo(videoFile);
}

function LoadVideoFromDrop(e) {
  e.preventDefault();

  const dragText = document.getElementById('drag-text');
  const file = e.dataTransfer.files[0];

  videoClip.LoadVideo(file.path);

  video.src = file.path;
  dragText.className += ' hidden';
  video.classList.remove('hidden');
  setTimeout(function() {
    if (!video.videoWidth) VideoError('Cannot play video');
  }, 200);
}

function Reset() {
  // Reset options to values of video file.
  const doScale = document.querySelector('input#do-scale');
  doScale.checked = false;
  ToggleScale();
  videoClip.Reset();
}

window.onload = Init;
