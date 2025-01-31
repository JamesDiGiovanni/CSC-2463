var colors = 
[
  'red', 
  'orange',
  'yellow', 
  'limegreen', 
  'cyan', 
  'blue', 
  'magenta', 
  'brown', 
  'white', 
  'black'
];
var currentColor = 'red';
var paletteWidth = 30;
var prevX, prevY;

function setup() 
{
  createCanvas(600, 400);
  background(255);
  drawPalette();
}

function drawPalette() 
{
  noStroke();
  for (let i = 0; i < colors.length; i++) 
    {
      fill(colors[i]);
      rect(0, i * 30, paletteWidth, 30);
    }
}

function mousePressed() 
{
  if (mouseX < paletteWidth) 
    {
      let index = floor(mouseY / 30);
      if (index >= 0 && index < colors.length) 
        {
          currentColor = colors[index];
        }
    } else 
    {
      prevX = mouseX;
      prevY = mouseY;
    }
}

function mouseDragged() 
{
  if (mouseX >= paletteWidth) 
    {
    stroke(currentColor);
    strokeWeight(8);
    line(prevX, prevY, mouseX, mouseY);
    prevX = mouseX;
    prevY = mouseY;
  }
}

function draw() 
{
  drawPalette();
}