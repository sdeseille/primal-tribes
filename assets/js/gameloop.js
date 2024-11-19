// Parameters
const GRID_SIZE = 50;  // 20x20 grid
const CELL_SIZE = 15;  // Each cell is 20px
const PREY_COUNT = 50; // Initial prey
const PREDATOR_COUNT = 20; // Initial predators
const MAX_PREY = 500;
const MAX_PREDATOR = MAX_PREY / 10;

// Prey-Predator dynamics
const alpha = 0.1;  // Prey birth rate
const beta = 0.02;  // Predation rate
const gamma = 0.125;  // Predator death rate
const delta = 0.01; // Predator reproduction rate

// Time step
const deltaT = 0.1;
const { Sprite, SpriteSheet, GameLoop, init } = kontra;

// Initialize canvas
const canvas = init('game');
canvas.width = GRID_SIZE * CELL_SIZE;
canvas.height = GRID_SIZE * CELL_SIZE;

// Helper function to generate random positions
function getRandomPosition() {
  return {
    x: Math.floor(Math.random() * GRID_SIZE) * CELL_SIZE,
    y: Math.floor(Math.random() * GRID_SIZE) * CELL_SIZE,
  };
}

// Create prey and predators
let prey = [];
for (let i = 0; i < PREY_COUNT; i++) {
  let pos = getRandomPosition();
  prey.push(Sprite({
    x: pos.x,
    y: pos.y,
    width: CELL_SIZE,
    height: CELL_SIZE,
    color: 'green',
    birthRate: alpha, // Prey-specific property
  }));
}

let predators = [];
for (let i = 0; i < PREDATOR_COUNT; i++) {
  let pos = getRandomPosition();
  predators.push(Sprite({
    x: pos.x,
    y: pos.y,
    width: CELL_SIZE,
    height: CELL_SIZE,
    color: 'red',
    energy: 10, // Energy for predators
  }));
}
const loop = GameLoop({
  update() {
    // Modify prey movement based on predator proximity
    prey.forEach(p => {
      let nearbyPredator = predators.some(pred =>
        Math.abs(pred.x - p.x) < CELL_SIZE * 2 && Math.abs(pred.y - p.y) < CELL_SIZE * 2
      );

      // Adjust speed based on stimulus (predator presence)
      let speedMultiplier = nearbyPredator ? 2 : 0.5; // Faster when near predators, slower otherwise
      p.x += (Math.random() - 0.5) * CELL_SIZE * speedMultiplier;
      p.y += (Math.random() - 0.5) * CELL_SIZE * speedMultiplier;

      // Keep within boundaries
      p.x = Math.max(0, Math.min(canvas.width - CELL_SIZE, p.x));
      p.y = Math.max(0, Math.min(canvas.height - CELL_SIZE, p.y));
    });

    // Move predators and check interactions
    predators.forEach(predator => {
      let nearbyPreyCount = prey.filter(p =>
        Math.abs(p.x - predator.x) < CELL_SIZE * 3 && Math.abs(p.y - predator.y) < CELL_SIZE * 3
      ).length;
    
      // Adjust speed: faster when fewer prey, slower when prey are nearby
      let speedMultiplier = nearbyPreyCount > 3 ? 0.5 : 2;
      predator.x += (Math.random() - 0.5) * CELL_SIZE * speedMultiplier;
      predator.y += (Math.random() - 0.5) * CELL_SIZE * speedMultiplier;
    
      // Keep within boundaries
      predator.x = Math.max(0, Math.min(canvas.width - CELL_SIZE, predator.x));
      predator.y = Math.max(0, Math.min(canvas.height - CELL_SIZE, predator.y));

      // Lose energy every step
      predator.energy -= deltaT;

      // Check for nearby prey
      prey = prey.filter(p => {
        if (Math.abs(predator.x - p.x) < CELL_SIZE && Math.abs(predator.y - p.y) < CELL_SIZE) {
          predator.energy += 5; // Gain energy
          return false; // Prey is eaten
        }
        return true; // Prey survives
      });

      // Reproduce if enough energy
      if (predator.energy > 15 && predators.length < MAX_PREDATOR) {
        predators.push(Sprite({
          x: predator.x,
          y: predator.y,
          width: CELL_SIZE,
          height: CELL_SIZE,
          color: 'red',
          energy: predator.energy / 1.8,
        }));
        predator.energy /= 2;
      }

      // Predator dies if energy is too low
      if (predator.energy <= 0) {
        predators = predators.filter(p => p !== predator);
      }
    });

    // Reproduce prey
    prey.forEach(p => {
      if (Math.random() < deltaT * alpha && prey.length < MAX_PREY) {
        let pos = getRandomPosition();
        prey.push(Sprite({
          x: pos.x,
          y: pos.y,
          width: CELL_SIZE,
          height: CELL_SIZE,
          color: 'green',
        }));
      }
    });
  },
  render() {
    prey.forEach(p => p.render());
    predators.forEach(p => p.render());
  }
});

// Start the game loop
loop.start();
