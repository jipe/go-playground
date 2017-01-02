var go = (function () {
  function Board(size) {
    var i, j;
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

  Board.prototype.isFree = function (x, y) {
    return this.positions[x-1][y-1] == '+';
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
    var i, j;

    for (i = 0; i < this.size; i++) {
      for (j = 0; j < this.size; j++) {
        board.positions[i][j] = this.positions[i][j];
      }
    }

    return board;
  };

  function Game(board, rules, scoring) {
    var i, j;

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
        this.players[0].passed = false;
        this.players[0].stones--;
        color = 'BLACK';
      } else if ('PLACE_WHITE_STONE' == this.state) {
        this.board.placeStone('O', x, y);
        this.players[1].passed = false;
        this.players[1].stones--;
        color = 'WHITE';
      }
      this.reportEvent('onStonePlaced', color, x, y);
      this.rules.progress(this);
    }
  }

  Game.prototype.getLibertyCount = (function () {
    function getSingleLibertyCount(board, x, y) {
      var result = 0;
      if (x > 1 && board.isFree(x-1,y)) result++;
      if (y > 1 && board.isFree(x,y-1)) result++;
      if (x < board.size && board.isFree(x+1,y)) result++;
      if (y < board.size && board.isFree(x,y+1)) result++;
      return result;
    };

    function getConnectedStones(board, x, y) {
      var result = [];

      if (board.isFree(x, y)) return [];

      return result;
    }

    return function (x, y) {
      var connectedStones = getConnectedStones(this.board, x, y);
      var i;
      var result = 0;

      for (i = 0; i < connectedStones.length; i++) {
        result += getSingleLibertyCount(this.board, connectedStones[i].x, connectedStones[i].y);
      }
    };
  })();

  Game.prototype.pass = function () {
    if ('PLACE_BLACK_STONE' == this.state) {
      this.players[0].passed = true;
      this.reportEvent('onTurnPassed', 'BLACK');
    } else if ('PLACE_WHITE_STONE' == this.state) {
      this.players[1].passed = true;
      this.reportEvent('onTurnPassed', 'WHITE');
    }
    this.rules.progress(this);
  };

  Game.prototype.addPlayer = function (name) {
    if (this.state == 'AWAITING_PLAYERS') {
      this.players.push({
        name   : name,
        stones : Math.floor(this.board.size*this.board.size / 2) + (this.players.length == 0 ? 1 : 0),
        passed : false
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

  Rules.prototype.isLegalMove = function (board, x, y) {
    console.log(this.evaluateMove(board, x, y));
    return this.evaluateMove(board, x, y).length == 0;
  };

  Rules.prototype.progress = function (game) {
    var x, y;

    if (game.players[0].passed && game.players[1].passed && game.state == 'PLACE_WHITE_STONE') {
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
  }
})();
