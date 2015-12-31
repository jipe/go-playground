var go = (function () {
  function Board (canvasId, game) {
    var max;

    this.game = game;
    this.canvas = document.getElementById(canvasId);
    maxDim = this.canvas.width > this.canvas.height ? this.canvas.width : this.canvas.height;
    this.canvas.width = maxDim;
    this.canvas.height = maxDim;
    this.ctx = this.canvas.getContext("2d");

    this.ctx.clearRect(0,0,this.canvas.width,this.canvas.height);
  };

  Board.prototype.renderGrid = function (stepSize) {
    var size = this.game.size;
    var ctx  = this.ctx;
    var x,y;

    ctx.fillStyle = "#303030";
    ctx.beginPath();
    ctx.moveTo(stepSize, stepSize*size);
    ctx.lineTo(stepSize, stepSize);
    ctx.lineTo(stepSize*size, stepSize);

    for (x = 2; x <= size; x++) {
      for (y = 2; y <= size; y++) {
        ctx.moveTo((x-1)*stepSize, y*stepSize);
        ctx.lineTo(x*stepSize, y*stepSize);
        ctx.lineTo(x*stepSize, (y-1)*stepSize);
      }
    }
    ctx.stroke();
  };

  Board.prototype.renderStarPoints = function (stepSize, radius) {
    var size = this.game.size;
    var ctx  = this.ctx;
    var starPoints;
    var i;

    if (size == 9) {
      starPoints = [[3,3], [7,3], [5,5], [3,7], [7,7]];
    } else if (size == 13) {
      starPoints = [[4,4], [10,4], [7,7], [4,10], [10,10]];
    } else if (size == 19) {
      starPoints = [[4,4], [10,4], [16,4], [4,10], [10,10], [16,10], [4,16], [10,16], [16,16]];
    }

    for (i = 0; i < starPoints.length; i++) {
      ctx.beginPath();
      ctx.arc(starPoints[i][0]*stepSize, starPoints[i][1]*stepSize, radius, 0, Math.PI*2); 
      ctx.fill();
    }
  };

  Board.prototype.renderPlacedStones = function (stepSize, radius) {
    var size      = this.game.size;
    var ctx       = this.ctx;
    var positions = this.game.positions;

    for (i = 0; i < size; i++) {
      for (j = 0; j < size; j++) {
        if (positions[i][j] != -1) {
          ctx.fillStyle = positions[i][j] == 0 ? "rgb(0,0,0)" : "rgb(255,255,255)";
          ctx.beginPath();
          ctx.arc((i+1)*stepSize, (j+1)*stepSize, radius, 0, Math.PI*2);
          ctx.fill();
        }
      }
    }
  };

  Board.prototype.render = function () {
    var size      = this.game.size;
    var ctx       = this.ctx;
    var canvas    = this.canvas;
    var stepSize  = canvas.width / (size + 1);
    var positions = this.game.positions;

    var x,y;
    var starPoints;
    var i,j;
    
    console.log("Render");

    ctx.clearRect(0,0,canvas.width,canvas.height);

    this.renderGrid(stepSize);
    this.renderStarPoints(stepSize, Math.max(3, stepSize / 22 * 2));
    this.renderPlacedStones(stepSize, stepSize / 2 - 1);
  };

  Board.prototype.attachUiControls = function (game) {
    var board    = this;
    var canvas   = this.canvas;
    var stepSize = canvas.width / (game.size + 1);
    var ctx      = this.ctx;
    var position;
    var previousPosition;

    this.canvas.onmousemove = function (event) {
      position = {
        x: Math.round((event.pageX - canvas.offsetLeft) / stepSize),
        y: Math.round((event.pageY - canvas.offsetTop) / stepSize)
      };

      position.x = Math.min(19, Math.max(1, position.x));
      position.y = Math.min(19, Math.max(1, position.y));

      if (previousPosition == undefined || position.x !== previousPosition.x || position.y !== previousPosition.y) {
        board.render();    
        if (game.currentPlayer.id != -1 && game.rules.evaluate(game, position.x, position.y).length == 0) {
          ctx.fillStyle = game.currentPlayer.id == 0 ? "rgba(0,0,0,0.6)" : "rgba(255,255,255,0.6)";
          ctx.beginPath();
          ctx.arc(position.x*stepSize, position.y*stepSize, stepSize / 2 - 1, 0, Math.PI*2);
          ctx.fill();
        }
        previousPosition = position;
      }
    };

    this.canvas.onmouseout = function () {
      board.render();
    };

    this.canvas.onclick = function (event) {
      if (game.placeStone(position.x, position.y)) {
        board.render();    
        game.currentPlayer.id++;
        if (game.currentPlayer.id > 1) {
          game.currentPlayer.id = 0;
        }
      }
    };
  };

  Board.prototype.detachUiControls = function () {
    this.canvas.onmousemove = undefined;
  };

  function Game(size, rules) {
    var i,j;

    this.size      = size;
    this.rules     = rules;
    this.positions = [];
    this.currentPlayer = {
      id: 0
    };

    for (i = 0; i < size; i++) {
      this.positions.push([]);
      for (j = 0; j < size; j++) {
        this.positions[i].push(-1);
      }
    }
  }

  Game.prototype.placeStone = function (x,y) {
    if (this.positions[x-1][y-1] == -1) {
      this.positions[x-1][y-1] = this.currentPlayer.id;
      return true; 
    }
    return false;
  }

  function Rules() {
  }

  Rules.prototype.evaluate = function (game, x, y) {
    var conflictingRules = [];

    if (game.positions[x-1][y-1] != -1) {
      conflictingRules.push('OCCUPIED');
    }
    
    return conflictingRules;
  };

  return {
    createRules : function () {
      return new Rules();
    },

    createBoard : function (canvasId, game) {
      return new Board(canvasId, game);
    },

    createGame : function (size, rules) {
      return new Game(size, rules);
    }
  }
})();

