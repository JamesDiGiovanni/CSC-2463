function setup() {
  let canvas = createCanvas(windowWidth, 400);
  canvas.parent("p5-container");
}

function draw() {
  background(240);
  fill(50);
  textSize(32);
  textAlign(CENTER, CENTER);
  text("Hello from p5.js", width / 2, height / 2);
}
