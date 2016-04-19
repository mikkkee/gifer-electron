'use strict';

const os = require('os');
const dialog = require('electron').remote.dialog;
const exec = require('child_process').exec;
const path = require('path');

const videoExtensions = [
  "3g2",
  "3gp",
  "aaf",
  "asf",
  "avchd",
  "avi",
  "drc",
  "flv",
  "m2v",
  "m4p",
  "m4v",
  "mkv",
  "mng",
  "mov",
  "mp2",
  "mp4",
  "mpe",
  "mpeg",
  "mpg",
  "mpv",
  "mxf",
  "nsv",
  "ogg",
  "ogv",
  "qt",
  "rm",
  "rmvb",
  "roq",
  "svi",
  "vob",
  "webm",
  "wmv",
  "yuv"
]

const videoClip = {
  video: '',
  initWidth: 0,
  initHeight: 0,
  width: 0,
  height: 0,
  start: '0',
  initStart: '0',
  end: '0',
  initEnd: '0',
  Duration: function() {
    return this.ParseTimeToSeconds(this.end) - this.ParseTimeToSeconds(this.start);
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
  lastGIFPath: '.',
  lastVideoPath: '.',
  LoadVideo: function (path) {
    this.video = path;
    if (this.platform === 'win32') {this.video = '"' + this.video + '"';}
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
          _this.start = _this.ParseSecondsToTime(eval(videoStream.start_time).toFixed(3));
          _this.initStart = _this.start;
          _this.end = _this.ParseSecondsToTime(eval(videoStream.duration).toFixed(3));
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
    this.start = this.initStart;
    this.end = this.initEnd;
    this.ratio = this.initRatio;
    this.fps = this.initFps;
    this.mirror = false;
    this.scale = '';
    this.speed = 1;
  },
  OpenVideoDialog: function(callback) {
    const _this = this;
    dialog.showOpenDialog({
      title: 'Select Video',
      defaultPath: _this.lastVideoPath,
      filters: [
      {name: 'Videos', extensions: videoExtensions},
      {name: 'All Files', extensions: ['*']}
      ]
    }, function(videoName){
      if (!videoName) return;
      _this.lastVideoPath = path.dirname(videoName);
      _this.LoadVideo(videoName);
      if (typeof callback === "function") {
        callback(videoName);
      }
    });
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
      defaultPath: _this.lastGIFPath,
      filters: [
      {name: 'GIFs', extensions: ['gif']},
      {name: 'All Files', extensions: ['*']}
      ],
    }, function(gifname) {
      if (!gifname) {return;}
      _this.lastGIFPath = path.dirname(gifname);
      // gifname may contain spaces. Need to wrap quotes around it.
      let gifnameCMD;
      if (_this.platform == 'win32') {gifnameCMD = '"' + gifname + '"';}
      const options = ' -y -ss ' + _this.start + ' -t ' + _this.Duration()
        + ' -i ' + _this.video + ' -vf ' + 'fps=' + _this.fps + ',scale='
        + _this.width + ':' + _this.height + ':flags=lanczos,'
        + 'setpts=1/' + _this.speed + '*PTS ' + gifnameCMD;
      console.log(options);
      exec(_this.ffmpeg + options, function (error, stdout, stderr) {
        console.log('ERROR: ', error);
        console.log('STDOUT: ', stdout);
        console.log('STDERR: ', stderr);
        console.log('GIF convert finished!');
        if (typeof callback === "function") {
          callback(gifname);
        }
      });
    });
  },
  ParseTimeToSeconds: function(t){
    const ts = t.toString();
    const tsList = ts.split(':');
    let seconds = 0;
    for (let i=tsList.length-1; i>=0; --i) {
      seconds += tsList[i] * Math.pow(60, tsList.length - 1 - i);
    }
    return seconds;
  },
  ParseSecondsToTime: function(t){
    let seconds = 0;
    let minutes = 0;
    let hours = 0;
    seconds = (t % 60).toFixed(3);
    minutes = Math.floor(t / 60) % 60;
    hours = Math.floor(t / 60 / 60) % 60;
    if (hours) {
      return hours + ':' + minutes + ':' + seconds;
    } else if (minutes) {
      return minutes + ':' + seconds;
    } else {
      return seconds;
    }
  },
};

module.exports = videoClip;
