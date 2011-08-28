$(function () {
  var g = require().GameDef,
      gameLogic = new GameLogic(g),
      gameView = new GameView(g, $('#game_view'));

  gameView.drawState(gameLogic.getState());
  connectToRoom(port,id)

  setInterval(function() {
    var state = gameLogic.step(1/60);
          gameView.drawState(state);
    }, 1000/60
  );

  function onPaddle(index, points) {
    console.log('paddle');
    gameLogic.setTouchPoints(index, points);
  }

  function onDbl(index) {
    gameLogic.doubleTouch(index);
  }

  function connectToRoom(port,id){
    var socket = io.connect(['http://',document.domain,':',port].join(''));
    socket.on('paddle', onPaddle);
    socket.on('dbl', onDbl);
    socket.emit('subscribe','viewer',id);
    return socket;
  }
});
