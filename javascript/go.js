var go = (function () {
  function Board (canvasId, size) {
    this.size   = size;
    this.canvas = document.getElementById(canvasId);
    this.ctx    = this.canvas.getContext("2d");

    this.ctx.clearRect(0,0,this.canvas.width,this.canvas.height);
  };

  Board.prototype.render = function () {
    var ctx      = this.ctx;
    var size     = this.size;
    var canvas   = this.canvas;
    var stepSize = (canvas.width < canvas.height ? canvas.width : canvas.height) / (size + 1);

    var x,y;
    var arcPoints;
    var i,j;
    
    ctx.clearRect(0,0,canvas.width,canvas.height);

    if (size == 19) {
      arcPoints = [4*stepSize, 10*stepSize, 16*stepSize];
    } else if (size == 9) {
      arcPoints = [3*stepSize, 7*stepSize];
    }

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

    for (i = 0; i < arcPoints.length; i++) {
      ctx.beginPath();
      for (j = 0; j < arcPoints.length; j++) {
        ctx.arc(arcPoints[i], arcPoints[j], stepSize / 7, 0, Math.PI*2); 
      }
      ctx.fill();
    }
  };

  return {
    newBoard : function (canvasId, size) {
      this.board = new Board(canvasId, size);
      this.board.render();
      return false;
    },

    newGame : function (canvasId, size) {
      var board = new go.Board(canvasId, size);
      return new go.Game(board);
    }
  }
})();

