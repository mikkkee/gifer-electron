'use strict';

const os = require('os');
const exec = require('child_process').exec;

const videoClip = {
  video: '',
  initWidth: 0,
  initHeight: 0,
  width: 0,
  height: 0,
  start: 0,
  end: 0,
  duration: function() {
    return this.end - this.start;
  },
  mirror: false,
  scale: 1.0,
  fps: 0.0,
  speed: 1.0,
  ratio: 0.0, // initWidth / initHeight.
  platform: os.platform(),
  loadVideo: function (path) {
    this.video = path;
    this.getVideoInfo();
  },
  getVideoInfo: function(){
    // Get detailed video info by calling ffprobe.
    const _this = this;
    let ffprobe = './bin/ffprobe';
    if (this.platform === 'win32') ffprobe = '.\\bin\\ffprobe.exe';
    exec(ffprobe + ' -v quiet -print_format json -show_format -show_streams ' + this.video,
      function callback(error, stdout, stderr){
        if (error) {
          console.log(error);
        } else {
          const videoStream = JSON.parse(stdout).streams[0];
          _this.width = videoStream.width;
          _this.height = videoStream.height;
          _this.start = videoStream.start_time;
          _this.end = videoStream.duration;
          _this.fps = eval(videoStream.r_frame_rate).toFixed(2);
        }
        return;
      });
  },
  setWidth: function(w) {
    // Set width to w and keep aspect ratio unchanged.
    this.width = w;
    this.height = this.width / this.ratio;
    return this;
  },
  setHeight: function(h) {
    // Set Height to h and keep aspect ratio unchanged.
    this.height = h;
    this.weight = this.height * this.ratio;
    return this;
  },
  setScale: function(s) {
    this.scale = s;
    this.width = this.initWidth * this.scale;
    this.height = this.initHeight * this.scale;
    return this;
  }
};

module.exports = videoClip;
