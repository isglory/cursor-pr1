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

// Function to shuffle an array using Fisher-Yates algorithm
function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

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
    ctx.fillRect(0, 0, TILE_SIZE, TILE_SIZE);

    ctx.fillStyle = '#FF4500'; // End color
    ctx.fillRect((COLS - 1) * TILE_SIZE, (ROWS - 1) * TILE_SIZE, TILE_SIZE, TILE_SIZE);
}

// Initialize game
function init() {
    generateMaze();
    drawMap();
}

init();