'use strict';

const fs = require('fs');
const os = require('os');
const dialog = require('electron').remote.dialog;
const exec = require('child_process').exec;
const spawn = require('child_process').spawn;
const ipc = require('electron').ipcRenderer;
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
  highq: false,
  scale: '',
  fps: 0.0,
  initFps: 0.0,
  speed: 1.0,
  ratio: 0.0, // initWidth / initHeight.
  initRatio: 0.0,
  platform: os.platform(),
  ffmpeg: os.platform() === 'win32' ? path.join(__dirname, '.\\bin\\ffmpeg.exe') : path.join(__dirname, './bin/ffmpeg'),
  lastGIFPath: '.',
  lastVideoPath: '.',
  LoadVideo: function(path) {
    this.video = path;
    if (this.platform === 'win32') { this.video = '"' + this.video + '"'; }
    this.GetVideoInfo();
  },
  GetVideoInfo: function() {
    // Get detailed video info by calling ffmpeg.
    // STDERR example:
    // "  Duration: 03:09:49.62, start: 0.000000, bitrate: 1328 kb/s"
    // "    Stream #0:1(und): Video: h264 (High) (avc1 / 0x31637661), yuv420p(tv, bt709), 856x480 [SAR 1:1 DAR 107:60], 1199 kb/s, 29.97 fps, 29.97 tbr, 60k tbn, 59.94 tbc (default)"
    const _this = this;

    exec(this.ffmpeg + ' -i ' + this.video, function callback(error, stdout, stderr) {
      // console.log("error: ", error);
      // console.log("stdout: ", stdout);
      // console.log("stderr: ", stderr);
      const output = stderr.split('\n');
      let _width, _height, _fps, _start, _duration;

      for (let i = output.length - 1; i >= 0; --i) {
        // Find Video Stream description line.
        if (output[i].indexOf('Stream #') >= 0 &&
          output[i].indexOf('Video:') >= 0) {
          const whReg = /(\d{1,4})x(\d{1,4})/;
          const fpsReg = /(\d{1,4}|\d{1,4}\.\d{1,4})\s{1,2}fps/;
          const wh = output[i].match(whReg);
          const fps = output[i].match(fpsReg);
          _width = wh[1];
          _height = wh[2];
          _fps = fps[1];
        }
        // Find time details line.
        if (output[i].indexOf('Duration:') >= 0 &&
          output[i].indexOf('start:') >= 0) {
          console.log(output[i]);
          const timeDetails = output[i].split(',');
          const durationList = timeDetails[0].split(' ');
          const startList = timeDetails[1].split(' ');
          _start = startList[startList.length - 1];
          _duration = durationList[durationList.length - 1];
        }
      }
      _this.width = _width;
      _this.height = _height;
      _this.initWidth = _width;
      _this.initHeight = _height;
      _this.ratio = _this.initWidth / _this.initHeight;
      _this.initRatio = _this.initWidth / _this.initHeight;
      _this.start = _start;
      _this.initStart = _start;
      _this.end = _duration;
      _this.initEnd = _duration;
      _this.fps = _fps;
      _this.initFps = _fps;
    })
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
  UpdateWithScale: function() {
    if (this.scale) {
      this.width = this.initWidth * this.scale;
      this.height = this.initHeight * this.scale;
    }
    return this;
  },
  Reset: function() {
    this.height = this.initHeight;
    this.width = this.initWidth;
    this.start = this.initStart;
    this.end = this.initEnd;
    this.ratio = this.initRatio;
    this.fps = this.initFps;
    this.highq = false;
    this.scale = '';
    this.speed = 1;
  },
  OpenVideoDialog: function(callback) {
    const _this = this;
    dialog.showOpenDialog({
      title: 'Select Video',
      defaultPath: _this.lastVideoPath,
      filters: [
        { name: 'Videos', extensions: videoExtensions },
        { name: 'All Files', extensions: ['*'] }
      ]
    }).then(function(result) {
      if (!result.filePaths) return;
      var videoName = result.filePaths[0]
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
        { name: 'GIFs', extensions: ['gif'] },
        { name: 'All Files', extensions: ['*'] }
      ],
    }).then(function(results) {
      var gifname = results.filePath
      if (!gifname) {
        return;
      }
      _this.lastGIFPath = path.dirname(gifname);
      // gifname may contain spaces. Need to wrap quotes around it.
      let gifnameCMD = gifname;

      const filters = 'fps=' + _this.fps + ',scale=' + _this.width + ':' + _this.height + ':flags=lanczos,' + 'setpts=1/' + _this.speed + '*PTS';

      if (_this.highq) {
        // Generate high quality GIF.
        let _video = _this.video;
        if (_this.platform === 'win32') { _video = _this.video.slice(1, -1); }
        const palette = path.join(__dirname, './tmp.png');
        const createPalette = ['-y', '-ss', _this.start, '-t', _this.Duration(),
          '-i', _video, '-vf', filters+',palettegen', palette];
        const usePalette = ['-y', '-ss', _this.start, '-t', _this.Duration(),
          '-i', _video, '-i', palette,
          '-lavfi', filters+' [x]; [x][1:v] paletteuse', gifnameCMD];
        const paletteCreator = spawn(_this.ffmpeg, createPalette);
        let paletteConsumer;
        paletteCreator.on('exit', function(code, signal){
          console.log('This is the end of creating palette.', this);
          ipc.send('ffmpeg-end', paletteCreator.pid);

          paletteConsumer = spawn(_this.ffmpeg, usePalette);
          paletteConsumer.stdout.on('data', function(data){console.log(data.toString());});
          paletteConsumer.stderr.on('data', function(data){console.log(data.toString());});
          paletteConsumer.on('exit', function(code, signal){
            console.log('This is the end of creating gif.', this);
            if (typeof callback === "function") {
              callback(gifname);
            }
          });

        });
        paletteCreator.stdout.on('data', function(data){console.log(data.toString());});
        paletteCreator.stderr.on('data', function(data){console.log(data.toString());});
        ipc.send('ffmpeg-begin', paletteCreator.pid);
/*
        exec(_this.ffmpeg + createPalette, function(error, stdout, stderr) {
          console.log('CREATE PALETTE\n');
          console.log('ERROR: ', error);
          console.log('STDOUT: ', stdout);
          console.log('STDERR: ', stderr);
          exec(_this.ffmpeg + usePalette, function(error, stdout, stderr) {
            console.log('USE PALETTE\n');
            console.log('ERROR: ', error);
            console.log('STDOUT: ', stdout);
            console.log('STDERR: ', stderr);
            console.log('High Quality GIF convert finished!');
            fs.unlink(palette);
            if (typeof callback === "function") {
              callback(gifname);
            }
          });
        }); 
*/
      } else {
        // Generate low quality GIF.
        const options = ' -y -ss ' + _this.start + ' -t ' + _this.Duration() + ' -i ' + _this.video + ' -vf ' + '"' + filters + '"' + ' ' + gifnameCMD;
        exec(_this.ffmpeg + options, function(error, stdout, stderr) {
          console.log('ERROR: ', error);
          console.log('STDOUT: ', stdout);
          console.log('STDERR: ', stderr);
          console.log('Low Quality GIF convert finished!');
          if (typeof callback === "function") {
            callback(gifname);
          }
        });
      }
    });
  },
  ParseTimeToSeconds: function(t) {
    const ts = t.toString();
    const tsList = ts.split(':');
    let seconds = 0;
    for (let i = tsList.length - 1; i >= 0; --i) {
      seconds += tsList[i] * Math.pow(60, tsList.length - 1 - i);
    }
    return seconds;
  },
  ParseSecondsToTime: function(t) {
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
