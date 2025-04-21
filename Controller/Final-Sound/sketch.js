let spriteSheet;
let walkingAnimation;
let spriteSheetFilenames = ['bugg.png']
let spriteSheets = [];
let animations = [];
let bgMusic;
let squishSound;
let gameOverSound;


const GameState = {
  Start: 'Start',
  Playing: 'Playing',
  GameOver: 'GameOver',
};

let game = {
  score: 0,
  maxScore: 0,
  maxTime: 30,
  elapsedTime: 0,
  totalSprites: 15,
  state: GameState.Start,
};

function preload() 
{
  soundFormats('mp3', 'ogg'); 


  bgMusic = loadSound('sounds/background.mp3');
  squishSound = loadSound('sounds/squishy.mp3');
  gameOverSound = loadSound('sounds/gameover.wav');

  for (let i = 0; i < spriteSheetFilenames.length; i++) {
    spriteSheets[i] = loadImage('bugs/' + spriteSheetFilenames[i]);
  }
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  bgMusic.loop();
  imageMode(CENTER);
  angleMode(DEGREES);
  reset();
}

function reset() {
  game.elapsedTime = 0;
  game.score = 0;
  game.totalSprites = random(10, 30);

  animations = [];
  for (let i = 0; i < game.totalSprites; i++) {
    animations[i] = new WalkingAnimation(
      spriteSheets[0],
      37.1,
      25,
      random(100, width - 100),
      random(100, height - 100),
      4,
      random(0.5, 1),
      6,
      random([0, 1])
    );
  }
}

function draw() {
  switch (game.state) {
    case GameState.Playing:
      background(220);
      
      // Adjust music playback rate based on time
      let speedMultiplier = map(game.elapsedTime, 0, game.maxTime, 1, 1.5);
      bgMusic.rate(speedMultiplier);

      for (let i = 0; i < animations.length; i++) {
        animations[i].draw();
      }

      fill(0);
      textSize(40);
      text(`Score: ${game.score}`, 100, 40);
      let currentTime = game.maxTime - game.elapsedTime;
      text(`Time: ${ceil(currentTime)}`, width - 200, 40);
      game.elapsedTime += deltaTime / 1000;

      if (currentTime < 0) {
        game.state = GameState.GameOver;
        bgMusic.stop();
        gameOverSound.play();
      }
      break;
    case GameState.GameOver:
      game.maxScore = max(game.score, game.maxScore);
      background(0);
      fill(255);
      textSize(40);
      textAlign(CENTER);
      text('Game Over!', width / 2, height / 2 - 50);
      textSize(35);
      text(`Score: ${game.score}`, width / 2, height / 2 + 20);
      text('Press [R] to restart', width / 2, height / 2 + 80);
      break;
    case GameState.Start:
      background(0);
      fill(255);
      textSize(50);
      textAlign(CENTER);
      text('Bug Squish', width / 2, height / 2 - 50);
      textSize(30);
      text('Press Any Key to Start', width / 2, height / 2 + 20);
      break;
  }
}


function keyPressed() {
  switch (game.state) {
    case GameState.Start:
      game.state = GameState.Playing;
      if (!bgMusic.isPlaying()) {
        bgMusic.loop();
        bgMusic.setVolume(0.5);
      }
      break;
    case GameState.GameOver:
      if (key === 'r' || key === 'R') {
        reset();
        game.state = GameState.Playing;
        if (!bgMusic.isPlaying()) {
          bgMusic.loop();
        }
      }
      break;
  }
}

function mousePressed() {
  if (game.state === GameState.Playing) {
    let bugSquished = false;
    for (let i = animations.length - 1; i >= 0; i--) {
      if (animations[i].contains(mouseX, mouseY)) {
        if (animations[i].moving !== 0) {
          animations[i].stop();
          game.score++;
          increaseBugSpeed();
          squishSound.play();
          bugSquished = true;
          break;
        }
      }
    }
    if (!bugSquished) {
      missSound.play();
    }
    if (!bgMusic.isPlaying()) {
      bgMusic.loop();
  }
  }
}


function increaseBugSpeed() {
  for (let i = 0; i < animations.length; i++) {
    if (animations[i].moving !== 0) {
      animations[i].speed *= 1.1;
    }
  }
  if (random() < 0.3) {  
    frenzySound.play();
  }
}


class WalkingAnimation {
  constructor(
    spritesheet,
    sw,
    sh,
    dx,
    dy,
    animationLength,
    speed,
    framerate,
    vertical = false,
    offsetX = 0,
    offsetY = 0
  ) {
    this.spritesheet = spritesheet;
    this.sw = sw;
    this.sh = sh;
    this.dx = dx;
    this.dy = dy;
    this.u = 0;
    this.v = 0;
    this.animationLength = animationLength;
    this.currentFrame = 0;
    this.moving = 1;
    this.xDirection = 1;
    this.offsetX = offsetX;
    this.offsetY = offsetY;
    this.speed = speed;
    this.framerate = framerate * speed;
    this.vertical = vertical;
  }

  draw() {
    this.u =
      this.moving !== 0 ? this.currentFrame % this.animationLength : this.u;
    push();
    translate(this.dx, this.dy);
    if (this.vertical) rotate(90);
    scale(this.xDirection, 1);

    image(
      this.spritesheet,
      0,
      0,
      this.sw,
      this.sh,
      this.u * this.sw + this.offsetX,
      this.v * this.sh + this.offsetY,
      this.sw,
      this.sh
    );
    pop();

    let proportionalFramerate = round(frameRate() / this.framerate);
    if (frameCount % proportionalFramerate === 0) {
      this.currentFrame++;
    }

    if (this.vertical) {
      this.dy += this.moving * this.speed;
      this.move(this.dy, this.sw / 4, height - this.sw / 4);
    } else {
      this.dx += this.moving * this.speed;
      this.move(this.dx, this.sw / 4, width - this.sw / 4);
    }
  }

  move(position, lowerBounds, upperBounds) {
    if (position > upperBounds) {
      this.moveLeft();
    } else if (position < lowerBounds) {
      this.moveRight();
    }
  }

  moveRight() {
    this.moving = 1;
    this.xDirection = 1;
    this.v = 0;
  }

  moveLeft() {
    this.moving = -1;
    this.xDirection = -1;
    this.v = 0;
  }

  contains(x, y) {
    let insideX = x >= this.dx - this.sw / 2 && x <= this.dx + this.sw / 2;
    let insideY = y >= this.dy - this.sh / 2 && y <= this.dy + this.sh / 2;
    return insideX && insideY;
  }

  stop() {
    this.moving = 0;
    this.u = 7;
    this.v = 8;
  }
}