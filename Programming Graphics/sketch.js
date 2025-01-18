function setup() {
  createCanvas(windowWidth, windowHeight);
}

function draw() {
  background(250);

  /* Example 1: Green rectangle with blank cirlce and blank square */

  strokeWeight(1); //thickness of lines 
  stroke(0, 255, 0);
  fill(100, 255, 0);
  rect(4, 6, 125, 70);

  stroke(0);
  fill(250);
  ellipse(35, 40, 55, 55);
  square(70, 15, 50);

  /* Example 2: 3 overlapping circles, red, blue, green */

  strokeWeight(0);
  fill(0, 0, 255, 90);
  ellipse(50, 150, 80, 80);
  fill(0, 255, 0, 90);
  ellipse(100, 150, 80, 80);
  fill(255, 0, 0, 90);
  ellipse(75, 125, 80, 80);

  /* Example 3: black rectangle with yellow pacman and red ghost */

  strokeWeight(0);
  fill(0);
  rect(4, 200, 150, 80);
  fill(255, 0, 0); //red
  square(85, 210, 60, 30, 30, 0, 0);
  fill(255);
  ellipse(100, 240, 22, 22);
  ellipse(130, 240, 22, 22);
  fill(0, 0, 255); //blue
  ellipse(100, 240, 12, 12);
  ellipse(130, 240, 12, 12);
  fill(255, 255, 0);
  arc(45, 240, 60, 60, 450, 184.5);

  /* Example 4: large blue square, green circle, with red star inside of it */

  fill(0, 0, 150);
  rect(4, 300, 180, 180);
  strokeWeight(2);
  stroke(255);
  fill(0, 150, 0);
  ellipse(95, 390, 80, 80);
  fill(255, 0, 0);
  redstar(95, 390, 15, 40, 5);
}

function redstar(x, y, radius1, radius2, npoints) {
  let angle = TWO_PI / npoints;
  let halfAngle = angle / 2.0;
  let rotation = -PI / 2; 
  beginShape();
  for (let a = 0; a < TWO_PI; a += angle) {
    let sx = x + cos(a + rotation) * radius2;
    let sy = y + sin(a + rotation) * radius2;
    vertex(sx, sy);
    sx = x + cos(a + halfAngle + rotation) * radius1;
    sy = y + sin(a + halfAngle + rotation) * radius1;
    vertex(sx, sy);
  }
  endShape(CLOSE);
}
