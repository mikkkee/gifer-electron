const videoClip = {
      video: '',
      initWidth: 0,
      initHeight: 0,
      width: 0,
      height: 0,
      start: 0;
      end: 0;
      duration: function () {
        return this.end - this.start;
      };
      mirror: false,
      scale: 1.0,
      fps: 0.0,
      speed: 1.0,
      ratio: 0.0,    // initWidth / initHeight.
      updateWidth: function (h) {
        this.width = this.ratio * h;
        return this;
      },
      updateHeight: function (w) {
        this.height = w / this.ratio;
        return this;
      },
      updateWidthAndHeight: function (s) {
        this.width = this.initWidth * s;
        this.height = this.initHeight * s;
        return this;
      }
    };

module.exports = videoClip;