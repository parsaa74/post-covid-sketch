let people = [];
const avoidanceRadius = 50; // Renamed from socialDistancingRadius
const personalSpaceRadius = 25; // New constant
let interactionRadius = 70; // Redefined value, also diameter for bubble

function setup() {
  createCanvas(800, 600);
  textAlign(CENTER, CENTER);
}

function draw() {
  background(220);

  // Reset interaction states for all people at the beginning of each frame
  for (let person of people) {
    person.isInteracting = false;
  }

  for (let person of people) {
    person.move();
    person.display();
    person.interact(); // Interactions (lines and bubbles) are processed/drawn
  }

  displayLonelinessMetric();
}

function mousePressed() {
  people.push(new Person(mouseX, mouseY));
}

class Person {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.speed = random(1, 3);
    this.direction = p5.Vector.random2D();
    this.interactionTimer = 0; // Still useful for cumulative tracking
    this.isInteracting = false; // Tracks interaction state per frame
  }

  move() {
    this.x += this.direction.x * this.speed;
    this.y += this.direction.y * this.speed;

    if (this.x < 0 || this.x > width) this.direction.x *= -1;
    if (this.y < 0 || this.y > height) this.direction.y *= -1;
  }

  display() {
    noStroke(); // Prevent interaction line's stroke from affecting ellipse
    fill(0, 150, 255);
    ellipse(this.x, this.y, 20, 20);
  }

  interact() {
    this.isInteracting = false; // Reset for this person for current frame's check

    for (let other of people) {
      if (other !== this) {
        let d = dist(this.x, this.y, other.x, other.y);

        if (d < personalSpaceRadius) {
          let angle = atan2(this.y - other.y, this.x - other.x);
          this.direction = p5.Vector.fromAngle(angle);
        } else if (d < interactionRadius) {
          this.interactionTimer++;
          this.isInteracting = true;
          other.isInteracting = true;

          // Draw interaction line
          push(); // Isolate line style
          stroke(255, 0, 0);
          strokeWeight(2);
          line(this.x, this.y, other.x, other.y);
          pop(); // Restore style after line

          // Draw interaction bubble (once per pair)
          if (this.x < other.x) { // Condition to draw bubble once per pair
            push(); // Isolate bubble style
            let midX = (this.x + other.x) / 2;
            let midY = (this.y + other.y) / 2;
            noStroke();
            fill(0, 255, 0, 50); // Semi-transparent green
            ellipse(midX, midY, interactionRadius, interactionRadius); // Diameter is interactionRadius
            pop(); // Restore style after bubble
          }
        }
      }
    }
  }
}

function displayLonelinessMetric() {
  let interactingPeopleCount = people.filter(p => p.isInteracting).length;
  let interactingProportion = people.length > 0 ? interactingPeopleCount / people.length : 0;
  let lonelinessScore = map(interactingProportion, 0, 1, 100, 0); 

  noStroke();
  fill(0);
  textSize(16);
  text(`Loneliness Score: ${lonelinessScore.toFixed(2)}`, width / 2, 20);
  text(`Interacting: ${(interactingProportion * 100).toFixed(0)}%`, width / 2, 40);
  text(`People: ${people.length}`, width / 2, 60);
}
