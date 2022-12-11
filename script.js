(() => {
  const piece = {
    X: 'X',
    O: 'O',
    Empty: '-'
  };
  let cellElements = [];
  // AI decision delay in milliseconds.
  const delay = 3500;
  let gameStarted = false;
  // either 'X' or 'O' when set, starting player is always 'X'.
  let playerPiece = null;
  let computerPiece = null;
  let playersTurn = false;

  window.onload = () => {
    let queryResult = Array.from(document.querySelectorAll('.cell'));
    cellElements = [];
    while (queryResult.length) {
      cellElements.push(queryResult.splice(0, 3));
    }
    cellElements.flat().forEach((element) => {
      element.addEventListener('click', handleCellClick, { once: true });
    });
    startGame();
  };

  /**
   * starts game by determining the starting player.
   */
  const startGame = () => {
    gameStarted = true;
    if (Math.random() >= 0.5) {
      setAIMessage('I\'ll go first.');
      playersTurn = false;
      playerPiece = piece.O;
      computerPiece = piece.X;
      computersTurn();
    } else {
      setAIMessage('You go first.');
      playersTurn = true;
      playerPiece = piece.X;
      computerPiece = piece.O;
    }
    setTimeout(() => {
      setAIMessage('');
    }, delay);
  };

  /**
   * @param {Event} event  object associated to a grid cell click event.
   */
  const handleCellClick = (event) => {
    console.log(event.target.classList.length);
    if (gameStarted && playersTurn
      && (event.target.classList.length === 1)) {
      event.target.classList.add(getCSSRuleFromPiece(playerPiece));
      computersTurn();
    }
  };

  /**
   * @param {String} gamePiece  game piece, either a 'X' or 'O'.
   * @returns {String}          css style associated to given piece.
   */
  const getCSSRuleFromPiece = (gamePiece) => {
    return (gamePiece === piece.X) ? 'cell__x' : 'cell__o';
  };

  /**
   * @param {String} message  AI message to display on screen.
   */
  const setAIMessage = (message) => {
    document.querySelector('.typewriter > p').innerText = message;
  };

  /**
   * AI evaluates all possible states of the current board and makes a move that
   * it determines most likely to yield a victory or tie.
   */
  const computersTurn = () => {
    playersTurn = false;

    let board = getCurrentBoardState();
    let bestScore = -Infinity;
    let bestMove = null;
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        if (board[i][j] === piece.Empty) {
          board[i][j] = computerPiece;
          let score = minimax(board, 0, false);
          // recursive-backtracking.
          board[i][j] = piece.Empty;
          // if computed score is equal to our best score, we'll 'flip a coin'
          // and determine if the corresponding move will be used.
          if ((score === bestScore && Math.random() >= 0.5)
            || (score > bestScore)) {
            bestScore = score;
            bestMove = { i, j };
          }
        }
      }
    }

    let chosenCell = cellElements[bestMove.i][bestMove.j];
    chosenCell.classList.add(getCSSRuleFromPiece(computerPiece));
    playersTurn = true;
  };

  /**
   * example output:
   *  [['X', 'O', 'X'],
   *   ['X', 'O', '-'],
   *   ['-', '-', 'O']]
   * @returns {[[String]]}  2D array representation of the current board.
   */
  const getCurrentBoardState = () => {
    let result = [];
    for (let i = 0; i < 3; i++) {
      let resultRow = [];
      for (let j = 0; j < 3; j++) {
        let cell = cellElements[i][j];
        if (cell.classList.contains('cell__x')) {
          resultRow.push(piece.X);
        } else if (cell.classList.contains('cell__o')) {
          resultRow.push(piece.O);
        } else {
          resultRow.push(piece.Empty);
        }
      }
      result.push(resultRow);
    }
    return result;
  };

  /**
   * source: https://en.wikipedia.org/wiki/Minimax
   *
   * @param {[[String]]} board    board representation as a 2D array.
   * @param {Integer} depth       depth of the given board from its root.
   * @param {Boolean} maximizing  true if calculating maximum score,
   *                              false otherwise.
   * @returns {Integer}
   */
  const minimax = (board, depth, maximizing) => {
    const eval = evaluateBoard(board, depth);
    if (eval !== null) {
      return eval;
    }

    if (maximizing) {
      let bestScore = -Infinity;
      for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
          if (board[i][j] === piece.Empty) {
            board[i][j] = computerPiece;
            let score = minimax(board, depth + 1, false);
            board[i][j] = piece.Empty;
            bestScore = Math.max(score, bestScore);
          }
        }
      }
      return bestScore;
    }
    // minimizing
    let bestScore = Infinity;
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        if (board[i][j] === piece.Empty) {
          board[i][j] = playerPiece;
          let score = minimax(board, depth + 1, true);
          board[i][j] = piece.Empty;
          bestScore = Math.min(score, bestScore);
        }
      }
    }
    return bestScore;
  };

  /**
   * @param {[[String]]} board  a 2D representation of the current board.
   * @param {Integer} depth     depth of the given board from its root.
   * @returns {Integer}         if the given board state is a terminal node,
   *                            it is evaluated and an integer is returned,
   *                            otherwise returns null.
   */
  const evaluateBoard = (board, depth = 0) => {
    const state = determineState(board);
    if (state === computerPiece) {
      return 10 - depth;
    } else if (state === playerPiece) {
      return -10 - depth;
    } else if (state === 'tie') {
      return 0;
    }
    return null;
  }

  /**
   * @param {[[String]]} board  board representation as a 2D array.
   * @returns {String}          winning game piece character if it is a winning
   *                            state, 'tie' if the game is a tie or null.
   */
  const determineState = (board) => {
    // horizontal
    for (let i = 0; i < 3; i++) {
      if ((board[i][0] === board[i][1] && board[i][1] === board[i][2])
        && board[i][0] !== piece.Empty) {
        return board[i][0];
      }
    }

    // vertical
    for (let i = 0; i < 3; i++) {
      if ((board[0][i] === board[1][i] && board[1][i] === board[2][i])
        && board[0][i] !== piece.Empty) {
        return board[0][i];
      }
    }

    // diagonal
    if ((board[0][0] === board[1][1] && board[1][1] === board[2][2])
      && board[0][0] !== piece.Empty) {
      return board[0][0];
    }
    if ((board[2][0] === board[1][1] && board[1][1] === board[0][2])
      && board[2][0] !== piece.Empty) {
      return board[2][0];
    }

    // tie
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        if (board[i][j] === piece.Empty) {
          return null;
        }
      }
    }
    return 'tie';
  };
})();
