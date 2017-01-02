var defiantGo = (function () {
	var rules;
	var scoring;
	var board;
	var game;
	var widget;
	var players = {};

	function setDisabled(ids, value) {
		var i;

		for (i = 0; i < ids.length; i++) {
			document.getElementById(ids[i]).disabled = value;
		}
	}

	function disable(ids) {
		setDisabled(ids, true);
	}

	function enable(ids) {
		setDisabled(ids, false);
	}

	return {
		init : function (size, canvasId) {
			rules   = go.createRules();
			scoring = go.createScoring();
			board   = go.createBoard(9);
			game    = go.createGame(board, rules, scoring);
			widget  = goWidget.createWidget(canvasId, board, game);

			this.newGame();
		},

		setBoardSize : function (size) {
			board        = go.createBoard(size);
			game         = go.createGame(board, rules, scoring);
			widget.board = board;
			widget.game  = game;

			widget.render();
		},

		setPlayer : function (color, player) {
			players[color] = player;
			if (players.black && players.white) {
				document.getElementById('start-game').disabled = false;
				this.showMessage('Ready to start');
			}
		},

		passMove : function () {
			game.pass();
		},

		startGame : function () {
			var control = this;

			if (players.black && players.white) {
				game.addEventListener((function () {
					return {
						onStateChanged : function (previousState, currentState) {
							console.log('onStateChanged: ' + previousState + ", " + currentState);
							switch (currentState) {
							case 'PLACE_BLACK_STONE':
								break;
							case 'PLACE_WHITE_STONE':
								break;
							case 'ENDED':
								control.showMessage("Game over");
								break;
							};
						},

						onStonePlaced : function (color, x, y) {
							console.log("onStonePlaced: " + color + ", " + x + ", " + y);
							control.clearMessage();
						},

						onTurnPassed : function (color) {
							switch (color) {
							case 'BLACK':
								control.showMessage('Black passed his turn');
								break;
							case 'WHITE':
								control.showMessage('White passed his turn');
								break;
							};
						},

						onStoneCaptured : function (positions) {
							console.log("onStoneCaptured: " + positions);
						},

						onPlayerAdded : function (color, name) {
							console.log("onPlayerAdded");
							control.showMessage("Player " + name + " added!");
						}
					};
				})());
				game.addPlayer(players.black);
				game.addPlayer(players.white);
				widget.attachUiControls();

				disable(['size-9x9', 'size-13x13', 'size-19x19', 'start-game', 'white-player-type-human', 'black-player-type-human']);
				enable(['new-game', 'pass-move']);
				this.clearMessage();
			}
		},

		clearPlayers : function () {
			var i;
			var ids = ['black-player-type-human', 'white-player-type-human'];

			players = {};
			for (i = 0; i < ids.length; i++) {
				document.getElementById(ids[i]).checked = false;
			}
		},

		showMessage : function (message) {
			document.getElementById('messages').innerHTML = message;
		},

		clearMessage : function () {
			document.getElementById('messages').innerHTML = '';
		},

		newGame : function () {
			document.getElementById('new-game').blur();
			widget.detachUiControls();
			board = go.createBoard(board.size);
			game  = go.createGame(board, rules, scoring);
			widget.board = board;
			widget.game  = game;
			
			disable(['new-game', 'pass-move']);
			enable(['size-9x9', 'size-13x13', 'size-19x19', 'black-player-type-human', 'white-player-type-human']);
			this.clearPlayers();
			widget.render();
			this.showMessage('Select board size and player types');
		}
	};
})();

