'use strict';

function init() {

    // Drag and Drop holder.
    const holder = document.getElementById('holder');
    const dragText = document.getElementById('drag-text');

    holder.ondragover = function() {
        return false; };

    holder.ondragleave = holder.ondragend = function() {
        return false;
    };

    holder.ondrop = function(e) {
        e.preventDefault();
        const file = e.dataTransfer.files[0];
        console.log('File you dragged here is', file.path);

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
        return false;
    };
};

window.onload = init;
