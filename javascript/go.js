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
    var starPoints;
    var i,j;
    
    ctx.clearRect(0,0,canvas.width,canvas.height);

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

    if (size == 9) {
      starPoints = [[3,3], [7,3], [5,5], [3,7], [7,7]];
    } else if (size == 13) {
      starPoints = [[4,4], [10,4], [7,7], [4,10], [10,10]];
    } else if (size == 19) {
      starPoints = [[4,4], [10,4], [16,4], [4,10], [10,10], [16,10], [4,16], [10,16], [16,16]];
    }

    for (i = 0; i < starPoints.length; i++) {
      ctx.beginPath();
      ctx.arc(starPoints[i][0]*stepSize, starPoints[i][1]*stepSize, 4, 0, Math.PI*2); 
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

