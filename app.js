/** @type {HTMLCanvasElement} */

window.addEventListener("load", () => {
  const canvas = document.getElementById("canvas");
  const ctx = canvas.getContext("2d");
  canvas.width = 800;
  canvas.height = 700;

  let enemyArr = [];
  let score = 0;

  class InputHandler {
    constructor() {
      this.keys = [];
      window.addEventListener("keydown", (e) => {
        if (
          (e.key === "ArrowUp" ||
            e.key === "ArrowDown" ||
            e.key === "ArrowLeft" ||
            e.key === "ArrowRight") &&
          this.keys.indexOf(e.key) === -1
        ) {
          this.keys.push(e.key);
        }
      });
      window.addEventListener("keyup", (e) => {
        if (
          e.key === "ArrowUp" ||
          e.key === "ArrowDown" ||
          e.key === "ArrowLeft" ||
          e.key === "ArrowRight"
        ) {
          this.keys.splice(this.keys.indexOf(e.key), 1);
        }
      });
    }
  }

  class Player {
    constructor(gameWidth, gameHeight) {
      this.gameWidth = gameWidth;
      this.gameHeight = gameHeight;
      this.spriteWidth = 200;
      this.spriteHeight = 200;
      this.width = this.spriteWidth * 0.8;
      this.height = this.spriteHeight * 0.8;
      this.frameX = 0;
      this.frameY = 0;
      this.speed = 0;
      this.vy = 0;
      this.x = 0;
      this.y = this.gameHeight - this.height;
      this.image = player_1;
      this.weight = 1;
      this.fps = 20;
      this.frameTimer = 0;
      this.frameInterval = 1000 / this.fps;
      this.maxFrames = 8;
    }
    update(input, deltaTime) {
      //sprite animation

      if (this.frameTimer > this.frameInterval) {
        if (this.frameX >= this.maxFrames) this.frameX = 0;
        else this.frameX++;
        this.frameTimer = 0;
      } else {
        this.frameTimer += deltaTime;
      }

      // player movemnt updates
      if (input.keys.indexOf("ArrowRight") > -1) {
        this.speed = 5;
      } else if (input.keys.indexOf("ArrowLeft") > -1) {
        this.speed = -5;
      } else if (input.keys.indexOf("ArrowUp") > -1 && this.onGround()) {
        this.vy = -30;
      } else {
        this.speed = 0;
      }
      // horizontal Movement
      this.x += this.speed;
      if (this.x < 0) this.x = 0;
      else if (this.x > this.gameWidth - this.width)
        this.x = this.gameWidth - this.width;
      // vertical movement
      this.y += this.vy;
      if (!this.onGround()) {
        this.vy += this.weight;
        this.maxFrames = 5;
        this.frameY = 1;
      } else {
        this.vy = 0;
        this.maxFrames = 8;
        this.frameY = 0;
      }
      if (this.y > this.gameHeight - this.height)
        this.y = this.gameHeight - this.height;
    }

    draw(context) {
      context.drawImage(
        this.image,
        this.frameX * this.spriteWidth,
        this.frameY * this.spriteHeight,
        this.spriteWidth,
        this.spriteHeight,
        this.x,
        this.y,
        this.width,
        this.height
      );
    }
    onGround() {
      return this.y >= this.gameHeight - this.height;
    }
  }

  class Background {
    constructor(gameWidth, gameHeight) {
      this.gameWidth = gameWidth;
      this.gameHeight = gameHeight;
      this.x = 0;
      this.y = 0;
      this.width = 2400;
      this.height = 720;
      this.speed = 10;
      this.image = background_single;
    }
    update() {
      this.x -= this.speed;
      if (this.x < -this.width) this.x = 0;
    }
    draw(context) {
      context.drawImage(this.image, this.x, this.y, this.width, this.height);
      context.drawImage(
        this.image,
        this.x + this.width - this.speed,
        this.y,
        this.width,
        this.height
      );
    }
  }

  class Enemy {
    constructor(gameWidth, gameHeight) {
      this.gameWidth = gameWidth;
      this.gameHeight = gameHeight;
      this.spriteWidth = 160;
      this.spriteHeight = 119;
      this.width = this.spriteWidth * 0.8;
      this.height = this.spriteHeight * 0.8;
      this.frameX = 0;
      this.speed = 5;
      this.image = enemy_1;
      this.x = this.gameWidth;
      this.y = this.gameHeight - this.height;
      this.maxFrames = 5;
      this.frameTimer = 0;
      this.fps = 20;
      this.frameInterval = 1000 / this.fps;
      this.markedForDeletion = false;
    }

    update(deltaTime) {
      if (this.frameTimer > this.frameInterval) {
        if (this.frameX >= this.maxFrames) this.frameX = 0;
        else this.frameX++;
        this.frameTimer = 0;
      } else {
        this.frameTimer += deltaTime;
      }
      this.x -= this.speed;
      if (this.x + this.width < 0) {
        this.markedForDeletion = true;
        score++;
      }
    }

    draw(context) {
      context.drawImage(
        this.image,
        this.frameX * this.spriteWidth,
        0,
        this.spriteWidth,
        this.spriteHeight,
        this.x,
        this.y,
        this.width,
        this.height
      );
    }
  }

  function handleEnemies(deltaTime) {
    if (enemyTimer > enemyinterval + randomEnemyInterval) {
      enemyArr.push(new Enemy(canvas.width, canvas.height));
      randomEnemyInterval = Math.random() * 1000 + 500;
      enemyTimer = 0;
    } else {
      enemyTimer += deltaTime;
    }

    enemyArr.forEach((enemy) => {
      enemy.draw(ctx);
      enemy.update(deltaTime);
    });

    enemyArr = enemyArr.filter((e) => !e.markedForDeletion);
  }

  function displayStatusText(context) {
    context.font = "40px Helvetica";
    context.fillStyle = "black";
    context.fillText("Score: " + score, 22, 52);
    context.fillStyle = "white";
    context.fillText("Score: " + score, 20, 50);
  }

  const input = new InputHandler();
  const player = new Player(canvas.width, canvas.height);
  const bg = new Background(canvas.width, canvas.height);

  let lastTime = 0;
  let enemyTimer = 0;
  let enemyinterval = 1000;
  let randomEnemyInterval = Math.random() * 1000 + 500;

  function animate(timestamp) {
    const deltaTime = timestamp - lastTime;
    lastTime = timestamp;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    bg.update();
    bg.draw(ctx);
    player.update(input, deltaTime);
    player.draw(ctx);
    handleEnemies(deltaTime);
    displayStatusText(ctx);
    requestAnimationFrame(animate);
  }
  animate(0);
});
