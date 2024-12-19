const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const WIDTH = 800;
const HEIGHT = 800;
const TILE_SIZE = 20;
const ROWS = HEIGHT / TILE_SIZE;
const COLS = WIDTH / TILE_SIZE;

// Initialize 2D array map
let map = Array.from({ length: ROWS }, () => Array(COLS).fill(0));

// Directions for BFS (up, down, left, right)
const directions = [
    { x: -1, y: 0 },
    { x: 1, y: 0 },
    { x: 0, y: -1 },
    { x: 0, y: 1 }
];

// Start and end points
const start = { x: 0, y: 0 };
const end = { x: ROWS - 1, y: COLS - 1 };

// Function to generate maze using randomized DFS
function generateMaze(x, y) {
    map[x][y] = 1;

    // Shuffle directions
    let dirs = directions.sort(() => Math.random() - 0.5);

    for (let dir of dirs) {
        let newX = x + dir.x * 2;
        let newY = y + dir.y * 2;

        if (newX >= 0 && newX < ROWS && newY >= 0 && newY < COLS && map[newX][newY] === 0) {
            map[x + dir.x][y + dir.y] = 1;
            generateMaze(newX, newY);
        }
    }
}

// Ensure there's a path between start and end using BFS
function ensurePath() {
    let queue = [];
    let visited = Array.from({ length: ROWS }, () => Array(COLS).fill(false));
    queue.push(start);
    visited[start.x][start.y] = true;

    while (queue.length > 0) {
        let current = queue.shift();
        if (current.x === end.x && current.y === end.y) {
            return true;
        }

        for (let dir of directions) {
            let newX = current.x + dir.x;
            let newY = current.y + dir.y;

            if (
                newX >= 0 && newX < ROWS &&
                newY >= 0 && newY < COLS &&
                map[newX][newY] === 1 &&
                !visited[newX][newY]
            ) {
                queue.push({ x: newX, y: newY });
                visited[newX][newY] = true;
            }
        }
    }

    return false;
}

// Function to generate a visually pleasing map
function generateMap() {
    let attempts = 0;
    const maxAttempts = 10;

    while (attempts < maxAttempts) {
        // Reset map
        map = Array.from({ length: ROWS }, () => Array(COLS).fill(0));

        // Generate maze
        generateMaze(start.x, start.y);

        // Ensure there's a path from start to end
        if (ensurePath()) {
            console.log(`Map generated successfully on attempt ${attempts + 1}`);
            return;
        }

        attempts++;
        console.warn(`Attempt ${attempts} failed, retrying...`);
    }

    console.error('Failed to generate a valid map after maximum attempts.');
}

// Function to draw the map
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
    ctx.fillRect(start.y * TILE_SIZE, start.x * TILE_SIZE, TILE_SIZE, TILE_SIZE);

    ctx.fillStyle = '#FF4500'; // End color
    ctx.fillRect(end.y * TILE_SIZE, end.x * TILE_SIZE, TILE_SIZE, TILE_SIZE);
}

// Initialize game
function init() {
    generateMap();
    drawMap();
}

init();
