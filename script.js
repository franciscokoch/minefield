const canvas = document.getElementById('game');

const ctx = canvas.getContext('2d');

var tiles = [];
const nTilesX = 10;
const nTilesY = 10;
var nBombs = 10;

class Tile {
    constructor(l, c) {
        this.l = l;
        this.c = c;
        this.Bomb = false;
        this.Open = false;
        this.bombsAround = 0;
        this.Flag = false;
        this.openedAround = false;
    }
}

function generateTile() {
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
    return tiles.find(t => t.l == l && t.c ==c);
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
    if (tile.Open) {
        if(tile.Bomb) {
            ctx.fillStyle = "#ff0000";
            ctx.fillRect(x, y, 50, 50);
        } else {
            ctx.fillStyle = "#999999";
            ctx.fillRect(x, y, 50, 50);
            if (tile.bombsAround) {
                ctx.fillStyle = "red";
                ctx.font = "30px Arial";
                ctx.textAlign = "center";
                ctx.fillText(tile.bombsAround, x + 25, y + 38);
            }
        }
    } else {
        if (tile.marked) {
            ctx.fillStyle = "#0000ff"
        } else {
            ctx.fillStyle = "#aaaaaa";
        }
        ctx.fillRect(x, y, 50, 50);
    }
}

function openTile(tile) {
    tile.Open = true;
    if (!tile.openedAround && tile.bombsAround == 0) openAround(tile);
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

    const l = Math.floor((mouseX / 511)*10);
    const c = Math.floor((mouseY / 511)*10);

    let tile = getTile(l, c);
    openTile(tile);
    draw();
})

document.addEventListener ("contextmenu", e => {
    e.preventDefault();
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const l = Math.floor((mouseX / 511)*10);
    const c = Math.floor((mouseY / 511)*10);
    let tile = getTile(l, c);
    tile.marked = !tile.marked;
    draw();
})