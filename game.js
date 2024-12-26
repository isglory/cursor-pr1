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

let isMoving = true; // Track if the unit is moving

// 적군 유닛 배열 추가
let enemies = [];

// 적군 유닛 생성 함수
function createEnemies() {
    while (enemies.length < 2) { // 2개의 적군 유닛 생성
        let enemyX = Math.floor(Math.random() * ROWS);
        let enemyY = Math.floor(Math.random() * COLS);
        
        // 적군 유닛이 경로에 위치해야 함
        if (map[enemyX][enemyY] === 1 && !(enemyX === 0 && enemyY === 0) && !(enemyX === ROWS - 1 && enemyY === COLS - 1)) {
            enemies.push({ 
                x: enemyX, 
                y: enemyY, 
                color: '#FF0000', // 빨간색 적군 유닛
                currentPath: [] // 적군의 현재 경로
            });
        }
    }
}

// 적군 유닛의 이동 속도
const enemySpeed = 0.05; // 적군의 이동 속도

// A* 알고리즘 관련 함수들
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

        openSet = openSet.filter(node => !(node.x === current.x && node.y === current.y));

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

    // Draw enemies
    for (let enemy of enemies) {
        ctx.fillStyle = enemy.color;
        ctx.beginPath();
        ctx.arc(enemy.y * TILE_SIZE + TILE_SIZE / 2, enemy.x * TILE_SIZE + TILE_SIZE / 2, TILE_SIZE / 2, 0, Math.PI * 2); // 원 그리기
        ctx.fill();
    }
}

// Function to update the unit's position and animate it
function updateUnit(currentPath) {
    if (isMoving && currentPath.length > 0) { // Check if the unit should move
        // Move towards the target position
        const target = currentPath[0];
        const dx = target.x - unit.x;
        const dy = target.y - unit.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        // If the unit is close enough to the target, move to the next target
        if (distance < unit.speed) {
            unit.x = target.x;
            unit.y = target.y;
            currentPath.shift(); // Remove the first element of the path
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

// Function to update enemies' positions along their current paths
function updateEnemiesMovement() {
    for (let enemy of enemies) {
        if (enemy.currentPath.length > 0) {
            const target = enemy.currentPath[0];
            const dx = target.x - enemy.x;
            const dy = target.y - enemy.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < enemySpeed) {
                enemy.x = target.x;
                enemy.y = target.y;
                enemy.currentPath.shift(); // Remove the reached position
            } else {
                enemy.x += (dx / distance) * enemySpeed;
                enemy.y += (dy / distance) * enemySpeed;
            }
        }
    }
}

// Function to update the enemies' paths towards the player's current position every 3 seconds
function updateEnemiesPaths() {
    for (let enemy of enemies) {
        const start = { x: Math.floor(enemy.x), y: Math.floor(enemy.y) };
        const end = { x: Math.floor(unit.x), y: Math.floor(unit.y) };
        const newPath = aStar(start, end);
        if (newPath.length > 1) { // Ensure there is a path beyond the current position
            enemy.currentPath = newPath.slice(1); // Exclude the current position
        }
    }
}

// Handle mouse right-click to toggle movement
canvas.addEventListener('contextmenu', (event) => {
    event.preventDefault(); // Prevent the default context menu
    isMoving = !isMoving; // Toggle the moving state
});

// Add a new event listener for left-click to move the unit to the clicked position
canvas.addEventListener('click', (event) => {
    const rect = canvas.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;

    const targetY = Math.floor(mouseX / TILE_SIZE);
    const targetX = Math.floor(mouseY / TILE_SIZE);

    // Check if the clicked position is a path
    if (map[targetX][targetY] === 1) {
        const start = { x: Math.floor(unit.x), y: Math.floor(unit.y) };
        const end = { x: targetX, y: targetY };
        const newPath = aStar(start, end);
        if (newPath.length > 0) {
            path.length = 0; // Clear the current path
            path.push(...newPath.slice(1)); // Set the new path excluding the current position
            isMoving = true; // Ensure the unit is moving
        }
    }
});

// Animation loop using requestAnimationFrame
function animate() {
    updateUnit(path);
    updateEnemiesMovement(); // 적군 유닛의 이동
    drawMap();
    requestAnimationFrame(animate); // Continue the animation loop
}

// Initialize game
function init() {
    generateMaze();
    createEnemies(); // 적군 유닛 생성
    updateEnemiesPaths(); // 초기 경로 설정
    path = aStar({ x: 0, y: 0 }, { x: ROWS - 1, y: COLS - 1 });
    animate(); // Start the animation loop with the initial path

    // Set interval to update enemies' paths every 3초
    setInterval(updateEnemiesPaths, 3000);
}

init();