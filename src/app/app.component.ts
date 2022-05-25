import { Component } from '@angular/core';
import { BestScoreManager } from './app.storage.service';
import { CONTROLS, COLORS, BOARD_SIZE, GAME_MODES } from './app.constants';

@Component({
  selector: 'ngx-snake',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  host: { '(document:keydown)': 'handleKeyboardEvents($event)' }
})
export class AppComponent {
  interval: number = 0;
  private tempDirection: number = 0;
  private default_mode = 'classic';
  private isGameOver = false;

  public all_modes: any = GAME_MODES;
  public getKeys: any = Object.keys;
  public board: any = [];
  public obstacles: any = [];
  public score = 0;
  public showMenuChecker = false;
  public gameStarted = false;
  public newBestScore = false;
  public best_score = this.bestScoreService.retrieve();

  private snake = {
    direction: CONTROLS.LEFT,
    parts: [
      {
        x: -1,
        y: -1
      }
    ]
  };

  private fruit = {
    x: -1,
    y: -1
  };

  colorSnake: any;
  colorBody: any;
  colorFruit: any;
  constructor(private bestScoreService: BestScoreManager) {
    this.setTrablero();
  }

  handleKeyboardEvents(e: KeyboardEvent) {
    if (e.keyCode === CONTROLS.LEFT && this.snake.direction !== CONTROLS.RIGHT) {
      this.tempDirection = CONTROLS.LEFT;
    } else if (e.keyCode === CONTROLS.UP && this.snake.direction !== CONTROLS.DOWN) {
      this.tempDirection = CONTROLS.UP;
    } else if (e.keyCode === CONTROLS.RIGHT && this.snake.direction !== CONTROLS.LEFT) {
      this.tempDirection = CONTROLS.RIGHT;
    } else if (e.keyCode === CONTROLS.DOWN && this.snake.direction !== CONTROLS.UP) {
      this.tempDirection = CONTROLS.DOWN;
    }
  }

  establecerColores(col: number, row: number): string {
    if (this.isGameOver) {
      return COLORS.GAME_OVER;
    } else if (this.fruit.x === row && this.fruit.y === col) {
    const colorReturn = this.colorFruit === null || this.colorFruit === undefined ? COLORS.FRUIT : this.colorFruit;
    return colorReturn;
    } else if (this.snake.parts[0].x === row && this.snake.parts[0].y === col) {
      const colorReturn = this.colorSnake === null || this.colorSnake === undefined ? COLORS.HEAD : this.colorSnake;
      return colorReturn;
    } else if (this.board[col][row] === true) {
      const colorReturn = this.colorSnake === null || this.colorSnake === undefined ? COLORS.BODY : this.colorSnake;
      return colorReturn;
    } else if (this.default_mode === 'obstacles' && this.checkObstacles(row, col)) {
      return COLORS.OBSTACLE;
    }

    const colorReturn = this.colorBody === null || this.colorBody === undefined ? COLORS.BOARD : this.colorBody;
    return colorReturn;
  };

  actualizarPosiciones(): void {
    let newHead = this.repositionHead();
    let me = this;

    if (this.default_mode === 'classic' && this.boardCollision(newHead)) {
      return this.gameOver();
    } else if (this.default_mode === 'no_walls') {
      this.noWallsTransition(newHead);
    } else if (this.default_mode === 'obstacles') {
      this.noWallsTransition(newHead);
      if (this.obstacleCollision(newHead)) {
        return this.gameOver();
      }
    }

    if (this.selfCollision(newHead)) {
      return this.gameOver();
    } else if (this.fruitCollision(newHead)) {
      this.eatFruit();
    }

    let oldTail: any = this.snake.parts.pop();
    this.board[oldTail.y][oldTail.x] = false;

    this.snake.parts.unshift(newHead);
    this.board[newHead.y][newHead.x] = true;

    this.snake.direction = this.tempDirection;

    setTimeout(() => {
      me.actualizarPosiciones();
    }, this.interval);
  }

  repositionHead(): any {
    let newHead = Object.assign({}, this.snake.parts[0]);

    if (this.tempDirection === CONTROLS.LEFT) {
      newHead.x -= 1;
    } else if (this.tempDirection === CONTROLS.RIGHT) {
      newHead.x += 1;
    } else if (this.tempDirection === CONTROLS.UP) {
      newHead.y -= 1;
    } else if (this.tempDirection === CONTROLS.DOWN) {
      newHead.y += 1;
    }

    return newHead;
  }

  noWallsTransition(part: any): void {
    if (part.x === BOARD_SIZE) {
      part.x = 0;
    } else if (part.x === -1) {
      part.x = BOARD_SIZE - 1;
    }

    if (part.y === BOARD_SIZE) {
      part.y = 0;
    } else if (part.y === -1) {
      part.y = BOARD_SIZE - 1;
    }
  }

  addObstacles(): void {
    let x = this.randomNumber();
    let y = this.randomNumber();

    if (this.board[y][x] === true || y === 8) {
      return this.addObstacles();
    }

    this.obstacles.push({
      x: x,
      y: y
    });
  }

  checkObstacles(x: any, y: any): boolean {
    let res = false;

    this.obstacles.forEach((val: any) => {
      if (val.x === x && val.y === y) {
        res = true;
      }
    });

    return res;
  }

  obstacleCollision(part: any): boolean {
    return this.checkObstacles(part.x, part.y);
  }

  boardCollision(part: any): boolean {
    return part.x === BOARD_SIZE || part.x === -1 || part.y === BOARD_SIZE || part.y === -1;
  }

  selfCollision(part: any): boolean {
    return this.board[part.y][part.x] === true;
  }

  fruitCollision(part: any): boolean {
    return part.x === this.fruit.x && part.y === this.fruit.y;
  }

  resetFruit(): void {
    let x = this.randomNumber();
    let y = this.randomNumber();

    if (this.board[y][x] === true || this.checkObstacles(x, y)) {
      return this.resetFruit();
    }

    this.fruit = {
      x: x,
      y: y
    };
  }

  eatFruit(): void {
    this.score++;

    let tail = Object.assign({}, this.snake.parts[this.snake.parts.length - 1]);

    this.snake.parts.push(tail);
    this.resetFruit();

    if (this.score % 5 === 0) {
      this.interval -= 15;
    }
  }

  gameOver(): void {
    this.isGameOver = true;
    this.gameStarted = false;
    let me = this;

    if (this.score > this.best_score) {
      this.bestScoreService.store(this.score);
      this.best_score = this.score;
      this.newBestScore = true;
    }

    setTimeout(() => {
      me.isGameOver = false;
    }, 500);

    this.setTrablero();
  }

  randomNumber(): any {
    return Math.floor(Math.random() * BOARD_SIZE);
  }

  setTrablero(): void {
    this.board = [];

    for (let i = 0; i < BOARD_SIZE; i++) {
      this.board[i] = [];
      for (let j = 0; j < BOARD_SIZE; j++) {
        this.board[i][j] = false;
      }
    }
  }

  showMenu(): void {
    this.showMenuChecker = !this.showMenuChecker;
  }

  newGame(mode: string): void {
    this.default_mode = mode || 'classic';
    this.showMenuChecker = false;
    this.newBestScore = false;
    this.gameStarted = true;
    this.score = 0;
    this.tempDirection = CONTROLS.LEFT;
    this.isGameOver = false;
    this.interval = 100;
    this.snake = {
      direction: CONTROLS.LEFT,
      parts: []
    };

    for (let i = 0; i < 3; i++) {
      this.snake.parts.push({ x: 8 + i, y: 8 });
    }

    if (mode === 'obstacles') {
      this.obstacles = [];
      let j = 1;
      do {
        this.addObstacles();
      } while (j++ < 9);
    }

    this.resetFruit();
    this.actualizarPosiciones();
  }

  cambioColor(type: "Snake" | "Fruit" | "Background", color: string) {
    console.log('tipo' , type);
    if (type === "Snake") {
      this.colorSnake = color === 'empty' ? COLORS.BODY : color;
    } else if (type === "Fruit") {
      this.colorFruit = color === 'empty' ? COLORS.FRUIT : color;
    } else if (type === "Background") {
      this.colorBody = color === 'empty' ? COLORS.BOARD : color;
    } else {
      // TODO make something
    }
  }

  upSpeed(){
    if ( this.interval >= 1){
      this.interval =  this.interval=== 0 ? 1 : this.interval - 10;
    }
  }

  lowSpeed(){
    if ( this.interval >=0){
      this.interval = this.interval + 10;
    }
  }

}
