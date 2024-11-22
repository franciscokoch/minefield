const canvas = document.getElementById('game');

const ctx = canvas.getContext('2d');

var tiles = [];
let nTilesX = 10; // Changed from const to let
let nTilesY = 10; // Changed from const to let
let nBombs = 10;  // Changed from const to let

class Tile {
    constructor(l, c) {
        this.l = l;
        this.c = c;
        this.Bomb = false;
        this.Open = false;
        this.bombsAround = 0;
        this.Flag = false;
        this.openedAround = false;
        this.marked = false;
    }
}

function generateTile() {
    tiles = []; // Clear existing tiles
    for (let l = 0; l < nTilesX; l++) {
        for (let c = 0; c < nTilesY; c++) {
            const tile = new Tile(l, c);
            tiles.push(tile);
        }
    }
}


function placeBombs() {
    for (let l = 0; l < nBombs; l++) {
        let random = Math.floor(Math.random() * tiles.filter(t => !t.Bomb).length);
        tiles.filter(t => !t.Bomb) [random].Bomb = true;
    }
}

function generateNBombs() {
    tiles.map(t => {
        const nBombs = calculateNBombsAround(t);
        t.bombsAround = nBombs;
    })
}

function calculateNBombsAround(tile) {
    let bombCounter = 0;
    for (let l = tile.l -1; l <= tile.l + 1; l++) {
        for (let c = tile.c - 1; c <= tile.c + 1; c++) {
            if (l != tile.l || c != tile.c) {
                if (getTile(l, c)?.Bomb) bombCounter += 1;
            }
        }
    }
    return bombCounter;
}

function getTile(l, c) {
    return tiles.find(t => t.l == l && t.c == c);
}

generateTile();

function draw() {
    ctx.clearRect(0, 0, 511, 511);
    tiles.map(t => {
        drawTile(t);
    })
}

function drawTile(tile) {
    let x = (tile.l * 51) + 1;
    let y = (tile.c * 51) + 1;
    ctx.strokeStyle = "#000";
    ctx.lineWidth = 1;
    ctx.strokeRect(x, y, 50, 50);

    if (tile.Open) {
        if (tile.Bomb) {
            ctx.fillStyle = "#ff0000";
            ctx.fillRect(x, y, 50, 50); // Bomb tile
        } else {
            ctx.fillStyle = "#999999";
            ctx.fillRect(x, y, 50, 50); // Open tile background
            if (tile.bombsAround > 0) {
                ctx.fillStyle = "black";
                ctx.font = "20px Arial";
                ctx.textAlign = "center";
                ctx.fillText(tile.bombsAround, x + 25, y + 35); // Bomb count text
            }
        }
    } else {
        if (tile.marked) {
            ctx.fillStyle = "#0000ff";
            ctx.fillRect(x, y, 50, 50); // Flagged tile
            ctx.fillStyle = "#fff";
            ctx.font = "20px Arial";
            ctx.fillText("F", x + 25, y + 35); // Display 'F' for flag
        } else {
            ctx.fillStyle = "#aaaaaa";
            ctx.fillRect(x, y, 50, 50); // Closed tile
        }
    }
}

function openTile(tile) {
    if (tile.Open || tile.marked) return;
    tile.Open = true;

    if (tile.Bomb) {
        alert("Game Over!");
        stopTimer(); // Stop the timer on game over
        revealAllBombs(); // Reveal all bombs
        return; // Exit if a bomb is clicked
    }

    if (!tile.openedAround && tile.bombsAround === 0) openAround(tile);

    checkWin(); // Check for a win after opening a tile
}


function revealAllBombs() {
    tiles.forEach(t => {
        if (t.Bomb) t.Open = true;
    });
    draw();
}


function openAround(tile) {
    tile.openAround = true;
    for (let l = tile.l - 1; l <= tile.l + 1; l++) {
        for (let c = tile.c - 1; c <= tile.c + 1; c++) {
            if (l != tile.l || c != tile.c) {
                const currentTile = getTile(l, c);
                if (currentTile && !currentTile?.Bomb) openTile(currentTile);
            }
        }
    }
}

placeBombs();
generateNBombs();
draw();

document.addEventListener("click", e => {
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const l = Math.floor((mouseX / canvas.width) * nTilesX);
    const c = Math.floor((mouseY / canvas.height) * nTilesY);

    let tile = getTile(l, c);
    if (tile) openTile(tile);
    draw();
});

document.addEventListener("contextmenu", e => {
    e.preventDefault();
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const l = Math.floor((mouseX / canvas.width) * nTilesX);
    const c = Math.floor((mouseY / canvas.height) * nTilesY);
    let tile = getTile(l, c);
    if (tile) {
        tile.marked = !tile.marked;
        flags(); // Update flags count
        draw();
    }
});

function startGame() {
    tiles.map(t => {
        t.Open = false;
        t.marked = false;
        t.openedAround = false;
    })
    placeBombs();
    generateNBombs();
    draw();
    timer();
    flags();
}

function restartGame() {
    startGame();
    document.getElementById("timer").innerText = "Tempo: 0";
    document.getElementById("flags").innerText = "Flags: 0/" + nBombs;
}

function timer() {
    let seconds = 0;
    timerInterval = setInterval(() => {
        document.getElementById("timer").innerText = "Tempo: " + seconds;
        seconds++;
    }, 1000);
}

function stopTimer() {
    clearInterval(timerInterval);
}


function flags() {
    let flaggedBombs = tiles.filter(t => t.Bomb && t.marked).length;
    document.getElementById("flags").innerText = "Flags: " + flaggedBombs + "/" + nBombs;
}

function checkWin() {
    const nonBombTiles = tiles.filter(t => !t.Bomb);
    const openedTiles = tiles.filter(t => t.Open);
    if (openedTiles.length === nonBombTiles.length) {
        alert("You Win!");
        stopTimer();
    }
}

function setDifficulty(rows, cols, bombs) {
    nTilesX = rows;
    nTilesY = cols;
    nBombs = bombs;
    
    // Adjust canvas size dynamically
    canvas.width = rows * 51 + 1;
    canvas.height = cols * 51 + 1;
    
    // Reset game variables
    tiles = [];
    generateTile();
    placeBombs();
    generateNBombs();
    draw();

    // Reset UI
    document.getElementById("timer").innerText = "Tempo: 0";
    document.getElementById("flags").innerText = "Flags: 0/" + nBombs;

    // Start new timer
    stopTimer();
    timer();
}

function checkWin() {
    const nonBombTiles = tiles.filter(t => !t.Bomb);
    const openedTiles = tiles.filter(t => t.Open);

    // Check if all non-bomb tiles are opened
    if (openedTiles.length === nonBombTiles.length) {
        stopTimer(); // Stop the timer
        alert("You Win!");
    }
}
