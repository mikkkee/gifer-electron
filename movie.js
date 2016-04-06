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
      setWidth: function (w) {
        // Set width to w and keep aspect ratio unchanged.
        this.width = w;
        this.height = this.width / this.ratio;
        return this;
      },
      setHeight: function (h) {
        // Set Height to h and keep aspect ratio unchanged.
        this.height = h;
        this.weight = this.height * this.ratio;
        return this;
      },
      setScale: function (s) {
        this.scale = s;
        this.width = this.initWidth * this.scale;
        this.height = this.initHeight * this.scale;
        return this;
      }
    };

module.exports = videoClip;