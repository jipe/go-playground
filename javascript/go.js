var go = (function () {
  function Board(size) {
    var i,j;
    this.size = size;
    this.positions = [];

    if (size == 9) {
      this.starPoints = [[3,3], [7,3], [5,5], [3,7], [7,7]];
    } else if (size == 13) {
      this.starPoints = [[4,4], [10,4], [7,7], [4,10], [10,10]];
    } else if (size == 19) {
      this.starPoints = [[4,4], [10,4], [16,4], [4,10], [10,10], [16,10], [4,16], [10,16], [16,16]];
    } else {
      this.starPoints = [];
    }

    for (i = 0; i < size; i++) {
      this.positions[i] = [];
      for (j = 0; j < size; j++) {
        this.positions[i].push('+');
      }
    }
  }

  Board.prototype.placeStone = function (player, x, y) {
    this.positions[x-1][y-1] = player;
  };

  Board.prototype.removeStone = function (x, y) {
    this.positions[x-1][y-1] = '+';
  };

  Board.prototype.isOccupied = function (x, y) {
    return this.positions[x-1][y-1] != '+';
  };

  Board.prototype.isBlack = function (x, y) {
    return this.positions[x-1][y-1] == 'X';
  };

  Board.prototype.isWhite = function (x, y) {
    return this.positions[x-1][y-1] == 'O';
  };

  Board.prototype.copy = function () {
    var board = new Board(this.size);
    var i,j;

    for (i = 0; i < this.size; i++) {
      for (j = 0; j < this.size; j++) {
        board.positions[i][j] = this.positions[i][j];
      }
    }

    return board;
  };

  function BoardWidget (canvasId, board, game) {
    var max;

    this.canvas        = document.getElementById(canvasId);
    this.board         = board;
    this.game          = game;
    maxDim             = this.canvas.width > this.canvas.height ? this.canvas.width : this.canvas.height;
    this.canvas.width  = maxDim;
    this.canvas.height = maxDim;
    this.ctx           = this.canvas.getContext("2d");

    this.ctx.clearRect(0,0,this.canvas.width,this.canvas.height);
  };

  BoardWidget.prototype.render = (function () {
    function renderGrid(ctx, size, stepSize) {
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
    }

    function renderStarPoints(ctx, starPoints, stepSize, radius) {
      var i;

      for (i = 0; i < starPoints.length; i++) {
        ctx.beginPath();
        ctx.arc(starPoints[i][0]*stepSize, starPoints[i][1]*stepSize, radius, 0, Math.PI*2); 
        ctx.fill();
      }
    }

    function renderPlacedStones(ctx, board, stepSize, radius) {
      var positions = board.positions;
      var i,j;

      for (i = 0; i < board.size; i++) {
        for (j = 0; j < board.size; j++) {
          if (board.positions[i][j] != '+') {
            switch (board.positions[i][j]) {
            case 'O':
              ctx.fillStyle = "#fff";
              break;
            case 'X':
              ctx.fillStyle = "#000";
              break;
            };
            ctx.shadowColor = 'rgba(0,0,0,0.4)';
            ctx.shadowBlur = 3;
            ctx.shadowOffsetX = 2;
            ctx.shadowOffsetY = 2;
            ctx.beginPath();
            ctx.arc((i+1)*stepSize, (j+1)*stepSize, radius, 0, Math.PI*2);
            ctx.fill();

            ctx.shadowColor = undefined;
            ctx.shadowBlur = 0;
            ctx.shadowOffsetX = 0;
            ctx.shadowOffsetY = 0;
          }
        }
      }
    }

    return function () {
      var size      = this.board.size;
      var ctx       = this.ctx;
      var canvas    = this.canvas;
      var stepSize  = canvas.width / (size + 1);
      
      console.log("Render widget");

      ctx.clearRect(0,0,canvas.width,canvas.height);
      renderGrid(ctx, size, stepSize);
      renderStarPoints(ctx, this.board.starPoints, stepSize, Math.max(3, stepSize / 22 * 2));
      renderPlacedStones(ctx, this.board, stepSize, stepSize / 2 - 1);
    };
  })();

  BoardWidget.prototype.attachUiControls = function () {
    var widget   = this;
    var board    = this.board;
    var game     = this.game;
    var canvas   = this.canvas;
    var stepSize = canvas.width / (board.size + 1);
    var ctx      = this.ctx;
    var position;
    var previousPosition;

    this.canvas.onmousemove = function (event) {
      position = {
        x: Math.round((event.pageX - canvas.offsetLeft) / stepSize),
        y: Math.round((event.pageY - canvas.offsetTop) / stepSize)
      };

      position.x = Math.min(board.size, Math.max(1, position.x));
      position.y = Math.min(board.size, Math.max(1, position.y));

      if (previousPosition == undefined || position.x != previousPosition.x || position.y != previousPosition.y) {
        widget.render();    
        if (['PLACE_WHITE_STONE', 'PLACE_BLACK_STONE'].includes(game.state)) {
          if ('PLACE_WHITE_STONE' == game.state) {
            ctx.fillStyle = "rgba(255,255,255,0.5)";
          } else if ('PLACE_BLACK_STONE' == game.state) {
            ctx.fillStyle = "rgba(0,0,0,0.5)";
          }
          ctx.beginPath();
          ctx.arc(position.x*stepSize, position.y*stepSize, stepSize / 2 - 1, 0, Math.PI*2);
          ctx.fill();
        }
        previousPosition = position;
      }
    };

    this.canvas.onmouseout = function () {
      previousPosition = undefined;
      widget.render();
    };

    this.canvas.onclick = function (event) {
      game.placeStone(position.x, position.y);
      widget.render();    
    };
  };

  BoardWidget.prototype.detachUiControls = function () {
    this.canvas.onmousemove = undefined;
    this.canvas.onclick     = undefined;
  };

  function Game(board, rules, scoring) {
    var i,j;

    this.board     = board;
    this.rules     = rules;
    this.scoring   = scoring;
    this.players   = [];
    this.listeners = [];
    this.state     = 'AWAITING_PLAYERS';
    this.moves     = [];
  }

  Game.prototype.placeStone = function (x,y) {
    var color;

    if (['PLACE_BLACK_STONE', 'PLACE_WHITE_STONE'].includes(this.state) && this.rules.evaluateMove(this.board, x, y).length == 0) {
      if ('PLACE_BLACK_STONE' == this.state) {
        this.board.placeStone('X', x, y);
        this.players[0].passes = 0;
        this.players[0].stones--;
        color = 'BLACK';
      } else if ('PLACE_WHITE_STONE' == this.state) {
        this.board.placeStone('O', x, y);
        this.players[1].passes = 0;
        this.players[1].stones--;
        color = 'WHITE';
      }
      this.reportEvent('onStonePlaced', color, x, y);
      this.rules.progress(this);
    }
  }

  Game.prototype.pass = function () {
    if ('PLACE_BLACK_STONE' == this.state) {
      this.players[0].passes++;
      this.reportEvent('onTurnPassed', 'BLACK');
    } else if ('PLACE_WHITE_STONE' == this.state) {
      this.players[1].passes++;
      this.reportEvent('onTurnPassed', 'WHITE');
    }
    this.rules.progress(this);
  };

  Game.prototype.addPlayer = function (name) {
    if (this.state == 'AWAITING_PLAYERS') {
      this.players.push({
        name : name,
        stones : Math.floor(this.board.size*this.board.size / 2) + (this.players.length == 0 ? 1 : 0),
        passes : 0
      });
      console.log("Added player with " + this.players[this.players.length-1].stones + " stones");
      this.reportEvent('onPlayerAdded', this.players.length == 1 ? 'BLACK' : 'WHITE', name);
      this.rules.progress(this);
    }
  };

  Game.prototype.getPlayer = function (index) {
    return this.players[index];
  };

  Game.prototype.getBlackPlayer = function () {
    return this.getPlayer(0);
  };

  Game.prototype.getWhitePlayer = function () {
    return this.getPlayer(1);
  };

  Game.prototype.setState = function (state) {
    this.reportEvent('onStateChanged', this.state, state);
    this.state = state;
  };

  Game.prototype.addEventListener = function (listener) {
    this.listeners.push(listener);
  };

  Game.prototype.reportEvent = function (handlerName) {
    var handler = handlerName;
    var i;

    for (i = 1; i < arguments.length; i++) {
      arguments[i-1] = arguments[i];
    }
    if (arguments.length > 0) arguments.length--;

    for (i = 0; i < this.listeners.length; i++) {
      if (this.listeners[i][handler]) {
        this.listeners[i][handler].apply(null, arguments);
      }
    }
  };

  function Player(name, controls) {
  }

  function Scoring() {
  }

  Scoring.prototype.evaluateGame = function (game) {
    return 0;
  };

  function Rules() {
  }

  Rules.prototype.evaluateMove = function (board, x, y) {
    var conflictingRules = [];

    if (board.isOccupied(x, y)) {
      conflictingRules.push('OCCUPIED');
    }
    
    return conflictingRules;
  };

  Rules.prototype.progress = function (game) {
    if (game.players[0].passes == 3 && game.players[1].passes == 3) {
      game.setState('ENDED');
      return;
    }

    if (game.players[0].stones == 0 && game.players[1].stones == 0) {
      game.setState('ENDED');
    }

    switch (game.state) {
    case 'PLACE_BLACK_STONE':
      game.setState('PLACE_WHITE_STONE');
      break;
    case 'PLACE_WHITE_STONE':
      game.setState('PLACE_BLACK_STONE');
      break;
    case 'AWAITING_PLAYERS':
      if (game.players.length == 2) {
        game.setState('PLACE_BLACK_STONE');
      }
      break;
    };
  };

  return {
    createRules : function () {
      return new Rules();
    },

    createScoring : function () {
      return new Scoring();
    },

    createBoard : function (canvasId, size, rules) {
      return new Board(canvasId, size, rules);
    },

    createGame : function (size, rules, scoring) {
      return new Game(size, rules, scoring);
    },

    createBoardWidget : function (canvasId, board, game) {
      return new BoardWidget(canvasId, board, game);
    }
  }
})();

