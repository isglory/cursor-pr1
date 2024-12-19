const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const WIDTH = 800;
const HEIGHT = 800;
const TILE_SIZE = 20;
const ROWS = HEIGHT / TILE_SIZE;
const COLS = WIDTH / TILE_SIZE;

// Initialize 2D array map
let map = Array.from({ length: ROWS }, () => Array(COLS).fill(0));

// Directions for moving in the maze
const directions = [
    { x: -1, y: 0 },
    { x: 1, y: 0 },
    { x: 0, y: -1 },
    { x: 0, y: 1 }
];

// Circle unit properties
const unit = {
    x: 0,
    y: 0,
    radius: TILE_SIZE / 2,
    color: '#FFD700', // Yellow color
    speed: 0.1, // Speed of movement
    scale: 1, // Scale for animation
    scaleDirection: 1, // 1 for growing, -1 for shrinking
};

// Function to generate maze using Prim's algorithm
function generateMaze() {
    // Start with a grid of walls
    map = Array.from({ length: ROWS }, () => Array(COLS).fill(0));

    // Randomly select a starting point
    let startX = Math.floor(Math.random() * ROWS);
    let startY = Math.floor(Math.random() * COLS);
    map[startX][startY] = 1; // Mark the starting point as a path

    // List of walls to be added
    let walls = [];

    // Add initial walls around the starting point
    for (let dir of directions) {
        let newX = startX + dir.x;
        let newY = startY + dir.y;

        if (newX >= 0 && newX < ROWS && newY >= 0 && newY < COLS) {
            walls.push({ x: newX, y: newY, dir });
        }
    }

    // While there are walls to process
    while (walls.length > 0) {
        // Randomly select a wall
        let wallIndex = Math.floor(Math.random() * walls.length);
        let wall = walls[wallIndex];
        walls.splice(wallIndex, 1); // Remove the wall from the list

        // Check if the wall can be turned into a path
        let count = 0;
        for (let dir of directions) {
            let newX = wall.x + dir.x;
            let newY = wall.y + dir.y;

            if (newX >= 0 && newX < ROWS && newY >= 0 && newY < COLS && map[newX][newY] === 1) {
                count++;
            }
        }

        // If only one adjacent cell is a path, make the wall a path
        if (count === 1) {
            map[wall.x][wall.y] = 1; // Make the wall a path

            // Add the neighboring walls to the list
            for (let dir of directions) {
                let newX = wall.x + dir.x;
                let newY = wall.y + dir.y;

                if (newX >= 0 && newX < ROWS && newY >= 0 && newY < COLS && map[newX][newY] === 0) {
                    walls.push({ x: newX, y: newY, dir });
                }
            }
        }
    }

    // Ensure start and end points are path
    map[0][0] = 1; // Start point
    map[ROWS - 1][COLS - 1] = 1; // End point
}

// A* algorithm to find the shortest path
function aStar(start, end) {
    let openSet = [start];
    let cameFrom = {};
    let gScore = Array.from({ length: ROWS }, () => Array(COLS).fill(Infinity));
    let fScore = Array.from({ length: ROWS }, () => Array(COLS).fill(Infinity));

    gScore[start.x][start.y] = 0;
    fScore[start.x][start.y] = heuristic(start, end);

    while (openSet.length > 0) {
        // Get the node in openSet with the lowest fScore
        let current = openSet.reduce((prev, curr) => (fScore[curr.x][curr.y] < fScore[prev.x][prev.y] ? curr : prev));

        if (current.x === end.x && current.y === end.y) {
            return reconstructPath(cameFrom, current);
        }

        openSet = openSet.filter(node => node !== current);

        for (let dir of directions) {
            let neighbor = { x: current.x + dir.x, y: current.y + dir.y };

            if (neighbor.x >= 0 && neighbor.x < ROWS && neighbor.y >= 0 && neighbor.y < COLS && map[neighbor.x][neighbor.y] === 1) {
                let tentativeGScore = gScore[current.x][current.y] + 1;

                if (tentativeGScore < gScore[neighbor.x][neighbor.y]) {
                    cameFrom[`${neighbor.x},${neighbor.y}`] = current;
                    gScore[neighbor.x][neighbor.y] = tentativeGScore;
                    fScore[neighbor.x][neighbor.y] = gScore[neighbor.x][neighbor.y] + heuristic(neighbor, end);

                    if (!openSet.some(node => node.x === neighbor.x && node.y === neighbor.y)) {
                        openSet.push(neighbor);
                    }
                }
            }
        }
    }

    return []; // No path found
}

// Heuristic function for A* (Manhattan distance)
function heuristic(a, b) {
    return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
}

// Reconstruct the path from the cameFrom map
function reconstructPath(cameFrom, current) {
    let totalPath = [current];
    while (`${current.x},${current.y}` in cameFrom) {
        current = cameFrom[`${current.x},${current.y}`];
        totalPath.push(current);
    }
    return totalPath.reverse();
}

// Function to draw the map and the unit
function drawMap() {
    for (let x = 0; x < ROWS; x++) {
        for (let y = 0; y < COLS; y++) {
            if (map[x][y] === 1) {
                ctx.fillStyle = '#8FBC8F'; // Path color
            } else {
                ctx.fillStyle = '#2F4F4F'; // Wall color
            }
            ctx.fillRect(y * TILE_SIZE, x * TILE_SIZE, TILE_SIZE, TILE_SIZE);
        }
    }

    // Highlight start and end points
    ctx.fillStyle = '#FFD700'; // Start color
    ctx.fillRect(0, 0, TILE_SIZE, TILE_SIZE);

    ctx.fillStyle = '#FF4500'; // End color
    ctx.fillRect((COLS - 1) * TILE_SIZE, (ROWS - 1) * TILE_SIZE, TILE_SIZE, TILE_SIZE);

    // Draw the unit with scaling effect
    ctx.fillStyle = unit.color;
    ctx.beginPath();
    ctx.arc(unit.y * TILE_SIZE + TILE_SIZE / 2, unit.x * TILE_SIZE + TILE_SIZE / 2, unit.radius * unit.scale, 0, Math.PI * 2);
    ctx.fill();
}

// Function to update the unit's position and animate it
function updateUnit(path) {
    if (path.length > 0) {
        // Move towards the target position
        const target = path[0];
        const dx = target.x - unit.x;
        const dy = target.y - unit.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        // If the unit is close enough to the target, move to the next target
        if (distance < unit.speed) {
            unit.x = target.x;
            unit.y = target.y;
            path.shift(); // Remove the first element of the path
        } else {
            // Move the unit towards the target
            unit.x += (dx / distance) * unit.speed;
            unit.y += (dy / distance) * unit.speed;
        }

        // Animate the unit's scale with smaller changes
        unit.scale += unit.scaleDirection * 0.02; // Change scale (smaller change)
        if (unit.scale >= 1.05 || unit.scale <= 0.95) { // Adjusted scale limits
            unit.scaleDirection *= -1; // Reverse direction
        }
    }
}

// Animation loop using requestAnimationFrame
function animate(path) {
    updateUnit(path);
    drawMap();
    requestAnimationFrame(() => animate(path)); // Pass the path to the next frame
}

// Initialize game
function init() {
    generateMaze();
    const path = aStar({ x: 0, y: 0 }, { x: ROWS - 1, y: COLS - 1 });
    animate(path); // Start the animation loop with the path
}

init();