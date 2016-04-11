'use strict';

const os = require('os');
const dialog = require('electron').remote.dialog;
const exec = require('child_process').exec;

const videoClip = {
  video: '',
  initWidth: 0,
  initHeight: 0,
  width: 0,
  height: 0,
  start: 0,
  end: 0,
  initEnd: 0,
  Duration: function() {
    return this.end - this.start;
  },
  mirror: false,
  scale: '',
  fps: 0.0,
  initFps: 0.0,
  speed: 1.0,
  ratio: 0.0, // initWidth / initHeight.
  initRatio: 0.0,
  platform: os.platform(),
  ffprobe: os.platform() === 'win32' ? '.\\bin\\ffprobe.exe' : './bin/ffprobe',
  ffmpeg: os.platform() === 'win32' ? '.\\bin\\ffmpeg.exe' : './bin/ffmpeg',
  LoadVideo: function (path) {
    this.video = path;
    this.GetVideoInfo();
  },
  GetVideoInfo: function(){
    // Get detailed video info by calling ffprobe.
    const _this = this;

    exec(this.ffprobe + ' -v quiet -print_format json -show_format -show_streams ' + this.video,
      function callback(error, stdout, stderr){
        if (error) {
          alert("Please select a video file.");
          console.log(error);
        } else {
          const videoStream = JSON.parse(stdout).streams[0];
          _this.width = videoStream.width;
          _this.height = videoStream.height;
          _this.initWidth = videoStream.width;
          _this.initHeight = videoStream.height;
          _this.ratio = _this.initWidth / _this.initHeight;
          _this.initRatio = _this.initWidth / _this.initHeight;
          _this.start = eval(videoStream.start_time).toFixed(3);
          _this.end = eval(videoStream.duration).toFixed(3);
          _this.initEnd = _this.end;
          _this.fps = eval(videoStream.r_frame_rate).toFixed(2);
          _this.initFps = _this.fps;
        }
        return;
      });
  },
  SetWidth: function(w) {
    // Set width to w and keep aspect ratio unchanged.
    this.width = w;
    this.height = this.width / this.ratio;
    return this;
  },
  SetHeight: function(h) {
    // Set Height to h and keep aspect ratio unchanged.
    this.height = h;
    this.weight = this.height * this.ratio;
    return this;
  },
  SetScale: function(s) {
    this.scale = s;
    this.width = this.initWidth * this.scale;
    this.height = this.initHeight * this.scale;
    return this;
  },
  UpdateWithScale: function(){
    if (this.scale) {
      this.width = this.initWidth * this.scale;
      this.height = this.initHeight * this.scale;
    }
    return this;
  },
  Reset: function(){
    this.height = this.initHeight;
    this.width = this.initWidth;
    this.end = this.initEnd;
    this.ratio = this.initRatio;
    this.fps = this.initFps;
    this.mirror = false;
    this.scale = '';
    this.speed = 1;
  },
  MakeGIF: function(callback) {
    // ffmpeg
    // -ss [start] -t [duration]
    // -i [input video]
    // -vf fps=[fps],scale=[width]:[height]:flags=lanczos,setpts=1/[speed]*PTS
    // output.gif
    const _this = this;
    dialog.showSaveDialog({
      title: 'hehe',
      defaultPath: 'C:\\',
      filters: [
      {name: 'GIFs', extensions: ['gif']},
      {name: 'All Files', extensions: ['*']}
      ],
    }, function(gifname) {
      const options = ' -y -ss ' + _this.start + ' -t ' + _this.Duration()
        + ' -i ' + _this.video + ' -vf ' + 'fps=' + _this.fps + ',scale='
        + _this.width + ':' + _this.height + ':flags=lanczos,'
        + 'setpts=1/' + _this.speed + '*PTS ' + gifname;
      exec(_this.ffmpeg + options, function (error, stdout, stderr) {
        console.log('GIF convert finished!');
        if (typeof callback === "function") {
          callback(gifname);
        }
      });
    });
  },
};

module.exports = videoClip;
