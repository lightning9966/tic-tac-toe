
let game = {
  width: 640,
  height: 360,
  move: undefined,
  movePosition: [],
  scoreImages: [],
  winsMoves: ['123', '456', '789', '147', '258', '369', '159', '357'],
  cordsY: [90, 170, 250],
  cordsX: [235, 310, 385],
  bordersY: [[70, 143], [147, 220], [224, 300],],
  bordersX: [[210, 283], [287, 359], [363, 435],],
  sprites: {
    grid: undefined,
    circle: undefined,
    cross: undefined,
    scoreImage: undefined,
    scoreImageWin: undefined,
  },

  init: function () {
    let canvas = document.getElementById('canvas');
    this.message = document.getElementById('message');
    this.ctx = canvas.getContext("2d");
  },

  loadImage: function () {
    let counter = 0
      , amountImage = Object.keys(game.sprites).length;

    for (let key in this.sprites) {
      this.sprites[key] = new Image()
      this.sprites[key].src = `Images/${key}.png`
      this.sprites[key].onload = () => {
        counter++;
        if (counter === amountImage) game.render();
      }
    }
  },

  initTime: function () {
    this.ctx.beginPath();
    this.ctx.fillStyle = "black";
    this.ctx.font = "18px Verdana";
    this.timePosition = {
      x: (canvas.width / 2) - 27,
      y: 25,
    };
    this.timeMark = [];
    this.renderTime();
  },

  initAutoMove: function () {
    this.autoMovePosition = [];
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        let position = {
          x: i,
          y: j
        }
        this.autoMovePosition.push(position)
      }
    }
  },

  renderTime: function() {
    this.ctx.clearRect((canvas.width / 2) - 40, 0, 70, 30);
    this.ctx.fillText(`00:30`, this.timePosition.x, this.timePosition.y);

    let counter = 29;
    let cycle = setInterval(() => {
      this.ctx.clearRect((canvas.width / 2) - 40, 0, 70, 30);
      if (counter >= 10) {
        this.ctx.fillText(`00:${counter}`, this.timePosition.x, this.timePosition.y);
      } else if (counter < 10 && counter > 0) {
        this.ctx.fillText(`00:0${counter}`, this.timePosition.x, this.timePosition.y);
      } else if (counter === 0) {
        this.ctx.fillText(`00:00`, this.timePosition.x, this.timePosition.y);
        clearInterval(cycle);
        this.autoMove();
      }
      counter--;
    }, 1000);

    if(this.timeMark.length) this.timeMark.forEach(item => clearTimeout(item))
    this.timeMark.push(cycle);
  },

  renderScore: function () {
    let playerScore = this.player.scorePosition
      , emptyScore = this.empty.scorePosition

    for(let i = 0; i < playerScore.length; i++) {
      this.ctx.drawImage(this.sprites.scoreImage, playerScore[i], 12);
      this.ctx.drawImage(this.sprites.scoreImage, emptyScore[i], 12);
    }
  },

  watchForMove: function () {
    canvas.addEventListener('click', game.checkMove);
  },

  checkMove: function (e) {
    let mouse = {
      x: e.clientX,
      y: e.clientY
    };

    let positionForDraw = game.fieldMatching(mouse);
    game.basicMechanics(positionForDraw)
  },

  basicMechanics: function (positionForDraw) {
    if (!positionForDraw) return;
    if (!game.checkOldMove(positionForDraw)) return;

    game.rememberMove(positionForDraw);
    game.drawingMove(positionForDraw);

    let rules = game.rules();
    if (game.player.score === 3 || game.empty.score === 3) {
        this.player.score = 0;
        this.empty.score = 0;
        game.rerender(`Победил ${this.move.name}. Ты властелин этой игры. Сыграй еще раз и докажи свое превосходство`);
        return
      }
    game.showMassage(rules);

    if (!rules) {
      game.renderTime();
      game.changeMove(positionForDraw);
    }
  },

  fieldMatching: function (mouse) {
    let positionForDraw = {};

    for (let i = 0; i < 3; i++) {
      if (mouse.y > game.bordersY[i][0] && mouse.y < game.bordersY[i][1]) {
        positionForDraw.y = i;
      };
      if (mouse.x > game.bordersX[i][0] && mouse.x < game.bordersX[i][1]) {
        positionForDraw.x = i;
      };
    }
    if (positionForDraw.x !== undefined && positionForDraw.y !== undefined) {
      return positionForDraw;
    };
    return;
  },

  checkOldMove: function(positionForDraw) {
    for(let i = 0; i < this.movePosition.length; i++) {
      if (this.movePosition[i].x === positionForDraw.x && this.movePosition[i].y === positionForDraw.y) {
        return;
      };
    }
    return positionForDraw;
  },

  drawingMove: function(positionForDraw) {
    this.ctx.drawImage(this.move.figure, this.cordsX[positionForDraw.x], this.cordsY[positionForDraw.y]);
  },

  rememberMove: function (positionForDraw) {
    let positionForCheckRule = (positionForDraw.x + 1) + (positionForDraw.y * 3)
    this.movePosition.push(positionForDraw);
    this.move.movePosition.push(positionForCheckRule);
  },

  rules: function() {
    let move = this.move.movePosition.sort( (a, b) => a - b).join('')
      , win = false

    this.winsMoves.forEach( (item) => {
      let regular = new RegExp(`[${item}]`, 'g');
      let coincidences = (move.match(regular)) ? move.match(regular).join('') : 0;
      if (coincidences === item) {
        win = true;
        this.move.score++;
        return win;
      }
    });

    if (this.movePosition.length === 9 && win === false) win = null;
    return win;
  },

  showMassage: function(result) {
    if (result) {
      game.rerender(`Спасибо за игру, победил ${game.move.name}`);
    } else if (result === null) {
      game.rerender('Спасибо за игру, у вас ничья ;-)');
    };
  },

  changeMove: function() {
    this.move = (this.move === this.player) ? this.empty : this.player;
  },

  autoMove: function() {
    let autoMove = game.autoMovePosition
      , move = game.movePosition;

    for (let i = 0; i < autoMove.length; i++) {
      for (let j = 0; j < move.length; j++) {
        if (autoMove[i].x === move[j].x && autoMove[i].y === move[j].y) {
          game.autoMovePosition.splice(i, 1);
          i--;
        }
      }
    }

    // Закончить здесь
    let random  = Math.floor(Math.random() * (game.autoMovePosition.length - 1) + 0);
    game.basicMechanics(game.autoMovePosition[random]);
  },

  initGamers: function() {
    this.player = {
      score: 0,
      name: 'cross',
      movePosition: [],
      scorePosition: [210, 236, 262],
      figure: this.sprites.cross,
    };
    this.empty = {
      score: 0,
      name: 'circle',
      movePosition: [],
      scorePosition: [414, 388, 362],
      figure: this.sprites.circle,
    }
    this.move = this.player;
  },

  render: function() {
    this.ctx.drawImage(this.sprites.grid, 210, 70);
    this.initTime();
    this.initAutoMove();
    this.renderScore();
    this.watchForMove();
  },

  rerender: function(message) {
    setTimeout(() => {
      alert(message)
      this.ctx.clearRect(0, 0, 640, 360);
      this.ctx.drawImage(this.sprites.grid, 210, 70);
      this.movePosition = [];
      this.initAutoMove();
      this.player.movePosition = [];
      this.empty.movePosition = [];
      this.rerenderScore();
      this.renderTime();
      this.move = game.player;
    }, 150)
  },

  rerenderScore: function() {
    this.player.scorePosition.forEach((item, count) => {
      if(this.player.score > count) {
        this.ctx.drawImage(this.sprites.scoreImageWin, item, 12);
      } else {
        this.ctx.drawImage(this.sprites.scoreImage, item, 12);
      }
    });
    this.empty.scorePosition.forEach((item, count) => {
      if (this.empty.score > count) {
        this.ctx.drawImage(this.sprites.scoreImageWin, item, 12);
      } else {
        this.ctx.drawImage(this.sprites.scoreImage, item, 12);
      }
    });
  },

  start: function () {
    this.init();
    this.loadImage();
    this.initGamers();
  },
}

window.addEventListener('load', function () {
  game.start()
});
