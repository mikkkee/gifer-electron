'use strict';

const videoClip = require('./movie.js');

function bindUI() {
  // Bind options to videoClip file.
}

function reset() {
  // Reset options to values of video file.
}

function init() {
  // Disable drag + drop event for document.
  document.addEventListener('dragover', function(event) {
    event.preventDefault();
    return false;
  }, false);
  document.addEventListener('drop', function(event) {
    event.preventDefault();
    return false;
  }, false);
  // Drag and Drop holder.
  const holder = document.getElementById('holder');
  // Placehold text in holder.
  const dragText = document.getElementById('drag-text');

  holder.ondragover = function() {
    return false;
  };

  holder.ondragleave = holder.ondragend = function() {
    return false;
  };

  holder.ondrop = function(e) {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    console.log('File you dragged here is', file.path);
    videoClip.video = file.path;
    // Remove exitng video.
    const existingVideo = holder.getElementsByTagName('video')[0];
    if (existingVideo) { existingVideo.remove(); };

    dragText.className += ' hidden';

    const video = document.createElement("video");
    video.setAttribute('controls', '');
    video.setAttribute("width", '100%');
    video.setAttribute('height', '100%');
    const source = document.createElement("source");
    source.setAttribute('src', file.path);
    video.appendChild(source);
    holder.appendChild(video);
    return true;
  };
}

window.onload = init;
