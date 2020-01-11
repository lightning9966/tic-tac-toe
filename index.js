
let game = {
  width: 640,
  height: 360,
  move: undefined,
  movePosition: [],
  cordsY: [90, 170, 250],
  cordsX: [235, 310, 385],
  bordersY: [[70, 143], [147, 220], [224, 300],],
  bordersX: [[210, 283], [287, 359], [363, 435],],
  sprites: {
    grid: undefined,
    circle: undefined,
    cross: undefined,
  },

  load: function () {
    for (let key in this.sprites) {
      this.sprites[key] = new Image();
      this.sprites[key].src = `Images/${key}.png`;
    };
  },

  init: function () {
    let canvas = document.getElementById('canvas');
    this.ctx = canvas.getContext("2d");
  },


  watchForMove: function() {
    canvas.addEventListener('click', function (e) {
      let mouse = {
        x: e.clientX,
        y: e.clientY
      };

      let positionForDraw = game.findField(mouse);

      if (game.checkOldMove(positionForDraw)) {
        game.ctx.drawImage(game.move.figure, game.cordsX[positionForDraw.x], game.cordsY[positionForDraw.y]);

        game.movePosition.push(positionForDraw);
        game.move.movePosition.push(positionForDraw)

        if (game.rules()) {
          setTimeout( function() {
            alert('Спасибо за игру ;=)');

            // canvas.removeEventListener()
          }, 300)
        };
        game.changeMove(positionForDraw);
      };

    });
  },

  findField: function(mouse) {
    let positionForDraw = {
      x: null,
      y: null,
    };

    for (let i = 0; i < 3; i++) {
      if (mouse.y > game.bordersY[i][0] && mouse.y < game.bordersY[i][1]) {
        positionForDraw.y = i;
      };
      if (mouse.x > game.bordersX[i][0] && mouse.x < game.bordersX[i][1]) {
        positionForDraw.x = i;
      };
    }
    if (positionForDraw.x !== null && positionForDraw.y !== null) {
      return positionForDraw;
    }

    return;
  },

  checkOldMove: function(positionForDraw) {
    if (!positionForDraw) return;
    for(let i = 0; i < this.movePosition.length; i++) {
      if (this.movePosition[i].x === positionForDraw.x && this.movePosition[i].y === positionForDraw.y) {
        return;
      };
    }
    return positionForDraw;
  },

  changeMove: function(positionForDraw) {
    if (this.move === this.player) {
      this.move = this.empty;
    } else {
      this.move = this.player;
    }
  },

  buildGamers: function() {
    this.player = {
      score: 0,
      movePosition: [],
      figure: this.sprites.cross,
    };
    this.empty = {
      score: 1,
      movePosition: [],
      figure: this.sprites.circle,
    }
    this.move = this.player;
  },

  rules: function() {
    let winsMove = ['123', '456', '789', '147', '258', '369', '159', '753']
    let move = this.move.movePosition.map( (item) => {
      return (item.x + 1) + (item.y * 3);
    }).sort( (a, b) => a - b).join('');

    let win = false

    winsMove.forEach( (item) => {
      let re = new RegExp('[' + item + ']', 'g');
      let coincidences = move.match(re);

      if(coincidences) {
        coincidences = coincidences.join('')
      }
      if (coincidences === item) win = true;
    });

    return win;
  },


  render: function() {
    this.sprites.grid.addEventListener('load', () => {
      this.ctx.drawImage(this.sprites.grid, 210, 70);
    });

    this.watchForMove();
  },

  start: function () {
    this.init();
    this.load();
    this.buildGamers();
    this.render();
  },
}

window.addEventListener('load', function () {
  game.start()
});
