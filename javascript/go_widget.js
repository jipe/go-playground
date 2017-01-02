var goWidget = (function () {
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
      var i;

      ctx.beginPath();

      for (i = 1; i <= size; i++) {
        ctx.moveTo(i*stepSize, stepSize);
        ctx.lineTo(i*stepSize, stepSize*size);
        ctx.moveTo(stepSize, i*stepSize);
        ctx.lineTo(stepSize*size, i*stepSize);
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
      var i, j;

      ctx.save();

      ctx.shadowColor = 'rgba(0,0,0,0.4)';
      ctx.shadowBlur = 3;
      ctx.shadowOffsetX = 2;
      ctx.shadowOffsetY = 2;

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
            ctx.beginPath();
            ctx.arc((i+1)*stepSize, (j+1)*stepSize, radius, 0, Math.PI*2);
            ctx.fill();
          }
        }
      }

      ctx.restore();
    }

    return function () {
      var size      = this.board.size;
      var ctx       = this.ctx;
      var canvas    = this.canvas;
      var stepSize  = canvas.width / (size + 1);

      ctx.fillStyle = "#303030";
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
          if (game.rules.isLegalMove(board, position.x, position.y)) {
            console.log("Liberty count for (" + position.x + "," + position.y + ") is " + game.getLibertyCount(position.x, position.y));
            if ('PLACE_WHITE_STONE' == game.state) {
              ctx.fillStyle = "rgba(255,255,255,0.5)";
            } else if ('PLACE_BLACK_STONE' == game.state) {
              ctx.fillStyle = "rgba(0,0,0,0.5)";
            }
            ctx.beginPath();
            ctx.arc(position.x*stepSize, position.y*stepSize, stepSize / 2 - 1, 0, Math.PI*2);
            ctx.fill();
          }
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

  return {
    createWidget : function (canvasId, board, game) {
      return new BoardWidget(canvasId, board, game);
    }
  };
})();

