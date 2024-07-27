class JSE2 {
  constructor() {
    this.time;
    this.screen;
    this.scene;
    this.renderer;
    this.assetHandler;
    this.imageHandler;
    this.audioHandler;
    this.fontHandler;
    this.inputHandler;

    const jse2 = this;

    this.Vector2 = class {
      constructor(x = 0, y = 0) {
        this.x = x;
        this.y = y;
      }

      clone() {
        return new jse2.Vector2(this.x, this.y);
      }

      copy(other) {
        this.x = other.x;
        this.y = other.y;
      }

      add(other) {
        return new jse2.Vector2(this.x + other.x, this.y + other.y);
      }

      addScaler(other) {
        return new jse2.Vector2(this.x + other, this.y + other);
      }

      subtract(other) {
        return new jse2.Vector2(this.x - other.x, this.y - other.y);
      }

      subtractScaler(other) {
        return new jse2.Vector2(this.x - other, this.y - other);
      }

      multiply(other) {
        return new jse2.Vector2(this.x * other.x, this.y * other.y);
      }

      multiplyScaler(other) {
        return new jse2.Vector2(this.x * other, this.y * other);
      }

      divide(other) {
        return this.multiply(other.reciprocal());
      }

      divideScaler(other) {
        return this.multiplyScaler(1 / other);
      }

      reciprocal() {
        return new jse2.Vector2(1 / this.x, 1 / this.y);
      }

      length2() {
        return this.x * this.x + this.y * this.y;
      }

      normal() {
        let inverseLength = 1 / Math.sqrt(this.length2());
        return new jse2.Vector2(this.x * inverseLength, this.y * inverseLength);
      }

      getAngle() {
        let angle = Math.atan2(this.y, this.x);
        if (angle < 0) {
          angle += 2 * Math.PI;
        };
        return angle;
      }

      static zero() {
        return new jse2.Vector2();
      }
    }

    this.Ray = class {
      constructor(position, direction) {
        this.position = position;
        this.direction = direction;
      }
    }

    this.HitBox = class {
      constructor(position, scale) {
        this.position = position;
        this.scale = scale;
      }

      getMin() {
        return this.position;
      }

      getMax() {
        return this.position.add(this.scale);
      }

      intersectsPoint(other) {
        return this.position.x < other.x && this.position.x + this.scale.x > other.x
          && this.position.y < other.y && this.position.y + this.scale.y > other.y;
      }

      intersectsHitbox(other) {
        return this.position.x < other.position.x + other.scale.x && this.position.x + this.scale.x > other.position.x + other.scale.x
          && this.position.y < other.position.y + other.scale.y && this.position.y + this.scale.y > other.position.y + other.scale.y;
      }

      intersectsRay(other) {
        // https://tavianator.com/2011/ray_box.html
        let inverseDirection = other.direction.reciprocal();
        let t1 = (this.getMin().x - other.position.x) * inverseDirection.x;
        let t2 = (this.getMax().x - other.position.x) * inverseDirection.x;
        let tmin = Math.min(t1, t2);
        let tmax = Math.max(t1, t2);
        t1 = (this.getMin().y - other.position.y) * inverseDirection.y;
        t2 = (this.getMax().y - other.position.y) * inverseDirection.y;
        tmin = Math.max(tmin, Math.min(t1, t2));
        tmax = Math.min(tmax, Math.max(t1, t2));

        if (tmax >= Math.max(tmin, 0))
          return tmin;

        return false;
      }
    }

    this.Time = class {
      constructor() {
        this.lastTime;
        this.currentTime;
        this.deltaTime;
      }

      getTime() {
        return Date.now();
      }

      start() {
        this.lastTime = this.getTime();
      }

      update() {
        this.currentTime = this.getTime();
        this.deltaTime = this.currentTime - this.lastTime;
        this.lastTime = this.currentTime;
      }
    }

    this.Screen = class {
      constructor() {
        this.scale;
        this.canvas;
        this.aspect;
        this.renderScale;
        this.renderStart;
        this.minRenderScale;
        this.pixelScale;
        this.ctx;
        this.background;
      }

      setScale(width, height) {
        this.scale.x = width;
        this.scale.y = height;
        this.canvas.width = this.scale.x * this.pixelScale;
        this.canvas.height = this.scale.y * this.pixelScale;
        this.canvas.style.width = `${this.scale.x}px`;
        this.canvas.style.height = `${this.scale.y}px`;

        let sqrtAspect = Math.sqrt(this.aspect);
        let aspectWidth = this.scale.x / sqrtAspect;
        let aspectHeight = this.scale.y * sqrtAspect;
        let side = aspectWidth < aspectHeight;
        let scale = side ? this.scale.x : this.scale.y;
        this.renderScale = new jse2.Vector2(scale, scale);
        if (side)
          this.renderScale.y /= this.aspect;
        else
          this.renderScale.x *= this.aspect;
        this.minRenderScale = Math.min(this.renderScale.x, this.renderScale.y);
        this.renderStart = this.scale.subtract(this.renderScale).multiplyScaler(0.5);

        this.ctx.imageSmoothingEnabled = false;
      }

      init(canvas, width, height, aspect) {
        this.canvas = canvas;
        this.canvas.style.cssText = `
          display: block;
          image-rendering: pixelated;
          image-rendering: crisp-edges;
        `;
        this.scale = new jse2.Vector2();
        this.ctx = this.canvas.getContext('2d');
        this.background = '#000';
        this.aspect = aspect;
        this.pixelScale = window.devicePixelRatio;
        this.setScale(width, height);
      }

      setSizeToWindow() {
        this.setScale(window.innerWidth, window.innerHeight);
      }
    }

    this.Scene = class {
      constructor() {
        this.sprites = [];
      }

      add(sprite) {
        this.sprites.push(sprite);
      }

      remove(sprite) {
        this.sprites.splice(this.sprites.indexOf(sprite), 1);
      }

      moveToFront(sprite) {
        this.remove(sprite);
        this.sprites.push(sprite);
      }

      moveToBack(sprite) {
        this.remove(sprite);
        this.sprites.unshift(sprite);
      }
    }

    this.Renderer = class {
      getPositionFromUv(position) {
        return position.addScaler(1).multiplyScaler(.5).multiplyScaler(jse2.screen.minRenderScale).add(jse2.screen.renderStart).add(jse2.screen.renderScale.subtractScaler(jse2.screen.minRenderScale).multiplyScaler(0.5));
      }

      getScaleFromUv(scale) {
        return scale.multiplyScaler(jse2.screen.minRenderScale).multiplyScaler(0.5);
      }

      renderImage(image, position, scale, rotation, rotationAxis) {
        position = this.getPositionFromUv(position);
        scale = this.getScaleFromUv(scale);
        rotationAxis = this.getScaleFromUv(rotationAxis);

        jse2.screen.ctx.save();
        jse2.screen.ctx.translate(((position.x + rotationAxis.x) * jse2.screen.pixelScale), ((position.y + rotationAxis.y) * jse2.screen.pixelScale));
        jse2.screen.ctx.rotate(rotation);
        jse2.screen.ctx.drawImage(image, (-rotationAxis.x * jse2.screen.pixelScale), (-rotationAxis.y * jse2.screen.pixelScale), (scale.x * jse2.screen.pixelScale), (scale.y * jse2.screen.pixelScale));
        jse2.screen.ctx.restore();
      }

      renderText(value, position, color, size, font) {
        position = this.getPositionFromUv(position);
        size = size * jse2.screen.minRenderScale * 0.005;

        jse2.screen.ctx.font = `${size}px ${font}`;
        jse2.screen.ctx.fillStyle = color;
        jse2.screen.ctx.fillText(value, (position.x * jse2.screen.pixelScale), (position.y * jse2.screen.pixelScale) + jse2.screen.ctx.measureText(value).fontBoundingBoxAscent);
      }

      render() {
        jse2.screen.ctx.fillStyle = jse2.screen.background;
        jse2.screen.ctx.fillRect(0, 0, jse2.screen.scale.x * jse2.screen.pixelScale, jse2.screen.scale.y * jse2.screen.pixelScale);
        jse2.scene.sprites.forEach(i => {
          i.render();
        });
      }
    }

    this.AssetHandler = class {
      constructor() {
        this.assets;

        this.init();
      }

      init() {
        this.assets = {
          toLoad: 0,
          loaded: 0,
          onLoad: undefined,
          imageExtensions: ["png", "jpg", "gif", "webp"],
          fontExtensions: ["ttf", "otf", "ttc", "woff"],
          audioTrackExtensions: ["mp3", "ogg", "wav", "webm"],

          load: function (sources) {
            const self = this;

            const images = [];
            const fonts = [];
            const audioTracks = [];

            if (sources.length > 0) {
              sources.forEach(i => {
                let extension = i.split('.').pop();
                if (self.imageExtensions.indexOf(extension) != -1) {
                  images.push(i);
                }
                else if (self.fontExtensions.indexOf(extension) != -1) {
                  fonts.push(i);
                }
                else if (self.audioTrackExtensions.indexOf(extension) != -1) {
                  audioTracks.push(i);
                }
              });

              self.toLoad = (images.length != 0 ? 1 : 0) + (fonts.length != 0 ? 1 : 0) + (audioTracks.length != 0 ? 1 : 0);

              if (images.length > 0) {
                jse2.imageHandler.images.load(images);
                jse2.imageHandler.images.onLoad = () => {
                  self.loaded++;
                  if (self.loaded == self.toLoad) {
                    self.loaded = 0;
                    self.toLoad = 0;
                    if (self.onLoad)
                      self.onLoad();
                  }
                }
              }
              if (fonts.length > 0) {
                jse2.fontHandler.fonts.load(fonts);
                jse2.fontHandler.fonts.onLoad = () => {
                  self.loaded++;
                  if (self.loaded == self.toLoad) {
                    self.loaded = 0;
                    self.toLoad = 0;
                    if (self.onLoad)
                      self.onLoad();
                  }
                }
              }
              if (audioTracks.length > 0) {
                jse2.audioHandler.audioTracks.load(audioTracks);
                jse2.audioHandler.audioTracks.onLoad = () => {
                  self.loaded++;
                  if (self.loaded == self.toLoad) {
                    self.loaded = 0;
                    self.toLoad = 0;
                    if (self.onLoad)
                      self.onLoad();
                  }
                }
              }
            } else {
              if (self.onLoad)
                self.onLoad();
            }
          },

          get: function (source) {
            const self = this;
            let extension = source.split('.').pop();
            if (self.imageExtensions.indexOf(extension) != -1) {
              return jse2.imageHandler.images[source];
            }
            else if (self.fontExtensions.indexOf(extension) != -1) {
              const fontName = source.replaceAll('/', '-').replaceAll('.', '-');
              return jse2.fontHandler.fonts[fontName];
            }
            else if (self.audioTrackExtensions.indexOf(extension) != -1) {
              return jse2.audioHandler.audioTracks[source];
            }
          }
        }
      }
    }

    this.ImageHandler = class {
      constructor() {
        this.images;
        this.init();
      }

      init() {
        this.images = {
          toLoad: 0,
          loaded: 0,
          onLoad: undefined,
          load: function (sources) {
            const self = this;
            self.toLoad = sources.length;
            sources.forEach(i => {
              const image = new Image();
              image.onload = () => {
                self[i] = image;
                self.loaded++;
                if (self.toLoad === self.loaded) {
                  self.toLoad = 0;
                  self.loaded = 0;
                  if (self.onLoad)
                    self.onLoad();
                }
              }, false;
              image.src = i;
            });
          }
        }
      }
    }

    this.AudioHandler = class {
      constructor() {
        this.audioContext;
        this.audioTracks;
        this.init();
      }

      init() {
        const audioHandler = this;

        this.audioContext = new AudioContext();
        this.audioTracks = {
          toLoad: 0,
          loaded: 0,
          onLoad: undefined,
          load: function (sources) {
            const self = this;
            self.toLoad = sources.length;
            sources.forEach(function (source) {
              var audio = audioHandler.createAudio(source);
              self[source] = audio;
            });
          }
        };
      }

      createAudio(source) {
        const audioHandler = this;

        var audio = {};
        audio.volumeNode = audioHandler.audioContext.createGain();
        audio.soundNode = null;
        audio.buffer = null;
        audio.source = source;
        audio.loop = false;
        audio.playing = false;
        audio.volumeValue = 1;
        audio.startTime = 0;
        audio.startOffset = 0;

        audio.play = (value = false) => {
          if (!audio.playing) {
            audio.soundNode = audioHandler.audioContext.createBufferSource();
            audio.soundNode.buffer = audio.buffer;
            audio.soundNode.connect(audio.volumeNode);
            audio.volumeNode.connect(audioHandler.audioContext.destination);
            audio.soundNode.loop = audio.loop;
            audio.startTime = audioHandler.audioContext.currentTime;
            if (value != false)
              audio.startOffset = value;
            audio.soundNode.start(0, audio.startOffset % audio.buffer.duration);
            audio.playing = true;
          }
        };

        audio.stop = () => {
          if (audio.playing) {
            audio.soundNode.stop(0);
            audio.startOffset += audioHandler.audioContext.currentTime - audio.startTime;
            audio.playing = false;
          }
        };

        audio.setVolume = (volume) => {
          audio.volumeNode.gain.value = volume;
          audio.volumeValue = volume;
        }

        const request = new XMLHttpRequest();
        request.open("GET", source, true);
        request.responseType = "arraybuffer";
        request.onload = () => {
          audioHandler.audioContext.decodeAudioData(
            request.response,
            function (buffer) {
              audio.buffer = buffer;
              audioHandler.audioTracks.loaded++;
              if (audioHandler.audioTracks.toLoad == audioHandler.audioTracks.loaded) {
                audioHandler.audioTracks.toLoad = 0;
                audioHandler.audioTracks.loaded = 0;
                if (audioHandler.audioTracks.onLoad)
                  audioHandler.audioTracks.onLoad();
              }
            },
          );
        }
        request.send();

        return audio;
      }
    }

    this.FontHandler = class {
      constructor() {
        this.init();
      }

      init() {
        this.fonts = {
          toLoad: 0,
          loaded: 0,
          onLoad: undefined,
          load: function (sources) {
            const self = this;
            self.toLoad = sources.length;
            sources.forEach(i => {
              const fontName = i.replaceAll('/', '-').replaceAll('.', '-');
              let fontFace = new FontFace(fontName, `url(${i})`);
              fontFace.load().then(() => {
                document.fonts.add(fontFace);
                self[fontName] = fontName;
                self.loaded++;
                if (self.loaded == self.toLoad) {
                  self.toLoad = 0;
                  self.loaded = 0;
                  if (self.onLoad)
                    self.onLoad();
                }
              });
            })
          }
        }
      }
    }

    this.Animation = class {
      constructor(frames, time) {
        this.frames = frames;
        this.currentFrame = 0;
        this.time = time;
        this.counter = 0;
      }

      get() {
        return this.frames[this.currentFrame];
      }

      reset() {
        this.counter = 0;
        this.currentFrame = 0;
      }

      update() {
        if (this.time != 0) {
          this.counter += jse2.time.deltaTime / 1000;
          if (this.counter > this.time) {
            this.counter = 0;
            this.currentFrame++;

            if (this.currentFrame >= this.frames.length)
              this.currentFrame = 0;
          }
        }
      }
    }

    this.ImageSprite = class {
      constructor(animations, position, scale) {
        this.animations = animations;
        this.position = position;
        this.scale = scale;
        this.currentAnimation = 0;
        this.rotation = 0;
        this.rotationAxis = new jse2.Vector2();
        this.visible = true;

        jse2.scene.add(this);
      }

      update() {
        this.animations[this.currentAnimation].update();
      }

      resetAnimation(index) {
        this.animations[index].reset();
      }

      render() {
        let image = this.animations[this.currentAnimation].get();
        if (this.visible && image != null) {
          jse2.renderer.renderImage(image, this.position, this.scale, this.rotation, this.rotationAxis);
        }
      }
    }

    this.TextSprite = class {
      constructor(value, position, font, size, color) {
        this.value = value;
        this.position = position;
        this.font = font;
        this.size = size;
        this.color = color;

        jse2.scene.add(this);
      }

      update() {

      }

      render() {
        jse2.renderer.renderText(this.value, this.position, this.color, this.size, this.font);
      }
    }

    this.InputHandler = class {
      constructor() {
        this.keys = {};
        this.mouse = {
          position: new jse2.Vector2(),
          acceleration: new jse2.Vector2(),
          wheel: new jse2.Vector2(),
          down: false
        };

        this.requests = {
          pointerLock: false,
          exitPointerLock: false,
          fullScreen: false,
          exitFullScreen: false,
          hideCursor: false,
          exitHideCursor: false
        };

        this.settings = {
          isPointerLock: false,
          isFullScreen: false,
          isHideCursor: false
        };

        window.addEventListener('keydown', e => {
          if (!this.keys[e.code])
            this.keys[e.code] = true;
        });
        window.addEventListener('keyup', e => {
          this.keys[e.code] = false;

          this.activateRequests();
        });
        jse2.screen.canvas.addEventListener('mousedown', e => {
          this.mouse.down = true;
        });
        jse2.screen.canvas.addEventListener('mouseup', e => {
          this.mouse.down = false;

          this.activateRequests();
        });
        jse2.screen.canvas.addEventListener('mousemove', e => {
          var rect = jse2.screen.canvas.getBoundingClientRect();
          this.mouse.position.x = Math.floor(e.clientX - rect.left);
          this.mouse.position.y = Math.floor(e.clientY - rect.top);

          this.mouse.position = this.mouse.position.subtract(jse2.screen.renderScale.subtractScaler(jse2.screen.minRenderScale).multiplyScaler(0.5)).subtract(jse2.screen.renderStart).divideScaler(jse2.screen.minRenderScale).multiplyScaler(2).subtractScaler(1);

          this.mouse.acceleration.x = e.movementX;
          this.mouse.acceleration.y = e.movementY;
        });
        addEventListener("wheel", e => {
          this.mouse.wheel.x = e.deltaX;
          this.mouse.wheel.y = e.deltaY;
        });
      }

      activateRequests() {
        if (this.requests.pointerLock) {
          document.body.requestPointerLock();
          this.requests.pointerLock = false;
          this.settings.isPointerLock = true;
        } else if (this.requests.exitPointerLock) {
          document.exitPointerLock();
          this.requests.exitPointerLock = false;
          this.settings.isPointerLock = false;
        }
        if (this.requests.fullScreen) {
          document.body.requestFullscreen();
          this.requests.fullScreen = false;
          this.settings.isFullScreen = true;
        } else if (this.requests.exitFullScreen) {
          document.exitFullscreen();
          this.requests.exitFullScreen = false;
          this.settings.isFullScreen = false;
        }
        if (this.requests.hideCursor) {
          jse2.screen.canvas.style.cursor = 'none';
          this.requests.hideCursor = false;
          this.settings.isHideCursor = true;
        } else if (this.requests.exitHideCursor) {
          jse2.screen.canvas.style.cursor = 'default';
          this.requests.exitHideCursor = false;
          this.settings.isHideCursor = false;
        }
      }

      pointerLock() {
        this.requests.pointerLock = true;
      }

      exitPointerLock() {
        this.requests.exitPointerLock = true;
      }

      isPointerLock() {
        return this.settings.isPointerLock;
      }

      fullScreen() {
        this.requests.fullScreen = true;
      }

      exitFullScreen() {
        this.requests.exitFullScreen = true;
      }

      isFullScreen() {
        return this.settings.isFullScreen;
      }

      hideCursor() {
        this.requests.hideCursor = true;
      }

      exitHideCursor() {
        this.requests.exitHideCursor = true;
      }

      isHideCursor() {
        return this.settings.isHideCursor;
      }

      update() {
        this.mouse.acceleration = this.mouse.acceleration.multiplyScaler(0);
        this.mouse.wheel = this.mouse.wheel.multiplyScaler(0);
      }
    }

    this.GameLoop = class {
      constructor() {
        this.running = false;
        this.onUpdate = undefined;
        this.gameLoop;
        this.initialized = false;
      }

      start() {
        if (!this.initialized) {
          this.initalized = true;
          jse2.time.start();
          this.run();
          this.running = true;
        } else {
          this.running = true;
        }
      }

      pause() {
        this.running = false;
      }

      run() {
        requestAnimationFrame(() => this.run());
        if (this.running) {
          jse2.time.update();
          jse2.scene.sprites.forEach(i => i.update());
          if (this.onUpdate)
            this.onUpdate();
          jse2.inputHandler.update();
          jse2.renderer.render();
        }
      }
    }
  }

  init(canvas, width, height, aspect) {
    this.time = new this.Time();
    this.screen = new this.Screen();
    this.screen.init(canvas, width, height, aspect);
    this.scene = new this.Scene();
    this.renderer = new this.Renderer();
    this.assetHandler = new this.AssetHandler();
    this.imageHandler = new this.ImageHandler();
    this.audioHandler = new this.AudioHandler();
    this.fontHandler = new this.FontHandler();
    this.inputHandler = new this.InputHandler();
    this.gameLoop = new this.GameLoop();
  }
}