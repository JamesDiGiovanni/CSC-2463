let 
startContext, 
samples, 
sampler, 
button1, 
button2, 
button3, 
button4, 
delayEffect, 
delaySlider; 

function preload() {
  samples = new Tone.Players({
    dog: "media/dog.mp3",
    bird: "media/bird.mp3",
    cow: "media/cow.mp3",
    cat: "media/cat.mp3"
  }).toDestination();
}

function setup() {
  createCanvas(windowWidth, windowHeight);

  button1 = createButton("Play Dog Sample");
  button1.position(10, 30);
  button1.mousePressed(() => samples.player("dog").start());

  button2 = createButton("Play Bird Sample");
  button2.position(200, 30);
  button2.mousePressed(() => samples.player("bird").start());

  button3 = createButton("Play Cow Sample");
  button3.position(390, 30);
  button3.mousePressed(() => samples.player("cow").start());

  button4 = createButton("Play Cat Sample");
  button4.position(580, 30);
  button4.mousePressed(() => samples.player("cat").start());

  let startButton = createButton("Start Audio");
  startButton.position(10, 80);
  startButton.mousePressed(startAudioContext);

  delayEffect = new Tone.FeedbackDelay({
    delayTime: 0.5,
    feedback: 0.7,
    wet: 0.5 
  }).toDestination();

  samples.connect(delayEffect);
  delaySlider = createSlider(0, 1, 0.5, 0.01); 
  delaySlider.position(10, 130);
  delaySlider.input(() => {
    delayEffect.wet.value = delaySlider.value();
  });

  textSize(16);
  fill(0);
  text("Delay", 10, 120);
}

function draw() 
{
  background(220);
}

function startAudioContext() 
{
  if (Tone.context.state !== "running") {
    Tone.start();
    console.log("Audio Context Started");
  } else {
    console.log("Audio Context is already running");
  }
}