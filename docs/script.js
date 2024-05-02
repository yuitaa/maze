let position,
  mazeArray = new Array();
let angle = 3;
let frame = 0;
let floor = 1;

// スプライトの読み込み
const tiles = new Image();
tiles.src = "./images/tiles.png";

const character = new Image();
character.src = "./images/pipo-charachip022c.png";

function* range(start, end, step = 1) {
  if (arguments.length === 1) {
    end = start;
    start = 0;
  }

  for (let i = start; i < end; i += step) {
    yield i;
  }
}

function generateMaze(mazeWidth, mazeHeight) {
  const height = mazeHeight * 2 + 1;
  const width = mazeWidth * 2 + 1;

  let maze = new Array(height);
  for (let i of range(height)) {
    maze[i] = new Array(width).fill(0);
  }

  for (let x of range(mazeWidth - 2, mazeWidth + 3)) {
    for (let y of range(mazeHeight - 2, mazeHeight + 3)) {
      maze[y][x] = 1;
    }
  }
  maze[mazeHeight - 3][mazeWidth] = 1;

  let farthestPoint = [mazeWidth, mazeHeight - 4];
  let farthestDistance = -1;
  let distance = new Array(height);
  for (let i of range(height)) {
    distance[i] = new Array(width);
  }
  distance[mazeHeight - 4][mazeWidth] = 0;

  let startPos = new Set();
  startPos.add(JSON.stringify([mazeWidth, mazeHeight - 4]));

  function carvePath(x, y) {
    startPos.add(JSON.stringify([x, y]));
    maze[y][x] = 1;

    let directions = [
      [0, -2],
      [0, 2],
      [-2, 0],
      [2, 0],
    ];

    directions.sort(() => Math.random() - 0.5);

    for (let dir of directions) {
      let newX = x + dir[0];
      let newY = y + dir[1];

      if (
        newX > 0 &&
        newX < width - 1 &&
        newY > 0 &&
        newY < height - 1 &&
        maze[newY][newX] === 0
      ) {
        maze[y + dir[1] / 2][x + dir[0] / 2] = 1;
        let newDistance = distance[y][x] + 1;
        distance[newY][newX] = newDistance;

        if (newDistance === farthestDistance && Math.random < 0.5) {
          farthestPoint = [newX, newY];
          farthestDistance = newDistance;
        } else if (newDistance > farthestDistance) {
          farthestPoint = [newX, newY];
          farthestDistance = newDistance;
        }

        carvePath(newX, newY);
        break;
      }
    }
  }

  while (startPos.size < mazeHeight * mazeWidth - 9) {
    carvePath(
      ...JSON.parse(
        Array.from(startPos)[Math.floor(Math.random() * startPos.size)]
      )
    );
  }
  maze[farthestPoint[1]][farthestPoint[0]] = 2;

  return maze;
}

function updateStats() {
  const stats = document.getElementById("stats");
  stats.children[0].textContent = `地下 ${floor} 階`;
}

function getValueAtCoordinates(array, x, y) {
  if (x < 0 || y < 0 || y >= array.length || x >= array[y].length) {
    return null;
  }
  return array[y][x];
}

function closePopup() {
  document.getElementById("popup").classList.add("hidden");
}

function openPopup() {
  document.getElementById("popup").classList.remove("hidden");
}

function drowTile(ctx, sprite, spritex, spritey, x, y) {
  const spriteSize = 160;
  ctx.drawImage(
    sprite,
    spritex * spriteSize,
    spritey * spriteSize,
    spriteSize,
    spriteSize,
    128 * x,
    128 * y,
    128,
    128
  );
}

function drowCharacter(ctx, sprite, spritex, spritey, x, y) {
  const spriteSize = 160;
  ctx.drawImage(
    sprite,
    spritex * spriteSize,
    spritey * spriteSize,
    spriteSize,
    spriteSize,
    128 * x - 32,
    128 * y - 64,
    192,
    192
  );
}

function walk(x, y, newAngle) {
  let floorCount = 0;
  const canvas = document.getElementById("game");
  const ctx = canvas.getContext("2d");
  if (mazeArray[position[1] + y][position[0] + x] != 0) {
    position[0] += x;
    position[1] += y;
  }
  angle = newAngle;
  // 階段
  if (mazeArray[position[1]][position[0]] === 2) {
    floor += 1;
    angle = 3;
    let mazeSize = Math.min(floor, 40) * 4 + 1;
    mazeArray = initMaze(mazeSize, mazeSize);
  }

  for (let offset of [[1,0],[-1,0],[0,1],[0,-1]]) {
    let floorToCheck = mazeArray[position[1] + offset[1]][position[0] + offset[0]]
    if (floorToCheck === 1 || floorToCheck === 2) {
      floorCount += 1;
    }
  }
  if (floorCount === 1) {
    mazeArray[position[1]][position[0]] = 3;
  }

  return drawMaze(ctx);
}

function drawMaze(ctx) {
  const frameNum = frame === 3 ? 1 : frame;
  ctx.clearRect(0, 0, 1152, 1152);

  for (let offsetY of range(-4, 5)) {
    for (let offsetX of range(-4, 5)) {
      let tile = getValueAtCoordinates(
        mazeArray,
        position[0] + offsetX,
        position[1] + offsetY
      );
      // キャラクターの描画s
      if (offsetX === 4 && offsetY === 0) {
        drowCharacter(ctx, character, frameNum, angle, 4, 4);
      }
      if (tile === null) {
        continue;
      }

      if (tile === 0) {
        // 壁
        drowTile(ctx, tiles, 2, 1, offsetX + 4, offsetY + 4);
        drowTile(ctx, tiles, 2, 0, offsetX + 4, offsetY + 3);
      } else if (tile === 1) {
        // 通路
        drowTile(ctx, tiles, 0, 0, offsetX + 4, offsetY + 4);
      } else if (tile === 2) {
        // 階段
        drowTile(ctx, tiles, 0, 1, offsetX + 4, offsetY + 4);
      } else if (tile === 3) {
        // 探索髄
        drowTile(ctx, tiles, 1, 0, offsetX + 4, offsetY + 4);
      }
    }
  }
}

function initMaze(mazeWidth, mazeHeight) {
  updateStats();
  position = [mazeWidth, mazeHeight];

  // 迷路を生成
  const mazeArray = generateMaze(mazeWidth, mazeHeight);
  return mazeArray;
}

// 画像の読み込み後
character.onload = () => {
  const canvas = document.getElementById("game");
  const ctx = canvas.getContext("2d");
  mazeArray = initMaze(5, 5);

  drawMaze(ctx);
  setInterval(() => {
    frame += 1;
    frame = frame % 4;
    drawMaze(ctx);
  }, 500);
};

window.onload = () => {
  const canvas = document.getElementById("game");
  const ctx = canvas.getContext("2d");

  // canvas をクリックしたときのイベント クリック位置を上下左右で
  canvas.addEventListener("click", function (event) {
    let elementWidth = this.offsetWidth;
    let elementHeight = this.offsetHeight;

    let clickX = event.clientX - this.getBoundingClientRect().left;
    let clickY = event.clientY - this.getBoundingClientRect().top;

    let relativeX = clickX / elementWidth;
    let relativeY = clickY / elementHeight;

    if (relativeX > relativeY) {
      if (relativeX > 1 - relativeY) {
        // 右
        walk(1, 0, 2);
      } else {
        // 下
        walk(0, -1, 3);
      }
    } else {
      if (relativeX > 1 - relativeY) {
        // 上
        walk(0, 1, 0);
      } else {
        // 左
        walk(-1, 0, 1);
      }
    }
  });

  // キー操作
  document.addEventListener("keydown", (event) => {
    if (event.key === "w") {
      walk(0, -1, 3);
    } else if (event.key === "a") {
      walk(-1, 0, 1);
    } else if (event.key === "s") {
      walk(0, 1, 0);
    } else if (event.key === "d") {
      walk(1, 0, 2);
    }
  });

  //メニュー
  document
    .getElementById("popup-background")
    .addEventListener("click", closePopup);
  document
    .getElementById("popup-close-button")
    .addEventListener("click", closePopup);
  document
    .getElementById("popup-open-button")
    .addEventListener("click", openPopup);
};
