'use strict';

const videoClip = require('./movie.js');
const remote = require('electron').remote;
const dialog = remote.dialog;
const Menu = remote.Menu;
const MenuItem = remote.MenuItem;
const video = document.querySelector('video');

function Init() {
  CreateMenu();
  BindEvents();
}

function CreateMenu() {
  const template = [
  {
    label: 'File',
    submenu: [
    {
        label: 'Open Video',
        accelerator: 'CmdOrCtrl+O',
        click: function(item, win) {LoadVideo();},
    }]}];

  if (process.platform == 'darwin') {
  const name = require('electron').remote.app.getName();
  template.unshift({
    label: name,
    submenu: [
      {
        label: 'About ' + name,
        role: 'about'
      },
      {
        type: 'separator'
      },
      {
        label: 'Services',
        role: 'services',
        submenu: []
      },
      {
        type: 'separator'
      },
      {
        label: 'Hide ' + name,
        accelerator: 'Command+H',
        role: 'hide'
      },
      {
        label: 'Hide Others',
        accelerator: 'Command+Alt+H',
        role: 'hideothers'
      },
      {
        label: 'Show All',
        role: 'unhide'
      },
      {
        type: 'separator'
      },
      {
        label: 'Quit',
        accelerator: 'Command+Q',
        click: function() { app.quit(); }
      },
    ]
  });
  }

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
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
  document.addEventListener('dragleave', Idle, false);
  document.addEventListener('dragend', Idle, false);
  document.addEventListener('drop', Idle, false);

  holder.ondragover = Idle;
  holder.ondragleave = holder.ondragend = Idle;
  holder.ondrop = LoadVideoFromDrop;

  doScale.onchange = ToggleScale;

  makeBtn.addEventListener('click', function(){videoClip.MakeGIF(UpdateGIF);});
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

function UpdateGIF(gifFile) {
  const gif = document.querySelector('#gif');
  const gv = document.querySelector('#gif-video-switch');
  gif.innerHTML = '';
  gif.innerHTML = '<img src="' + gifFile + '?' + new Date().getTime() + '" height=100%>';
  if (gv.checked) gv.click();
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

function LoadVideo() {
  videoClip.OpenVideoDialog(AfterLoadingVideo);
}

function AfterLoadingVideo(videoFile){
  const dragText = document.getElementById('drag-text');
  const video = document.querySelector('video');
  video.src = videoFile;
  // Hide text if haven't.
  if (! dragText.classList.contains('hidden')) {
    dragText.className += 'hidden';
  }
  // Show video if haven't.
  if (video.classList.contains('hidden')) {
    video.classList.remove('hidden');
  }
  setTimeout(function() {
    if (!video.videoWidth) VideoError('Cannot play video');
  }, 500);
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
  }, 500);
}

function Reset() {
  // Reset options to values of video file.
  const doScale = document.querySelector('input#do-scale');
  doScale.checked = false;
  ToggleScale();
  videoClip.Reset();
}

window.onload = Init;
