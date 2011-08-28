$(function () {
  var gameView = new GameView(require().GameDef, $('#game_view'));
  gameView.displayMessage("Waiting for another player to join");
  
  connectToRoom(port,room_id,phone_secret);
  var $mess = $('.message');
  function emitMessage(m){$mess.text(m);console.log(m);}

  function onGameOver(winner){
    console.log(winner);
    console.log("Game over, won by"+winner.user_name);
    gameView.displayMessage("Game over, won by"+winner.user_name);
  }
  function onCountdown(n){
    if(n > 0){
      gameView.displayMessage("Game will start in " + n + " seconds");
      setTimeout(function(){onCountdown(n-1);},1000);
    }
    else {
      gameView.displayMessage(null);
    }
  }
  function onUpdate(dat){
    gameView.drawState(dat);
  }
  function onStart(gameState){
      setTimeout(function(){
        gameView.displayMessage(null);
      },2000);
  }

  function connectToRoom(port,room,redis){
    var socket = io.connect(['http://',document.domain,':',port].join(''));
    socket.on('error',emitMessage);
    socket.on('win',onGameOver);
    socket.on('time',onCountdown);
    socket.on('start',onStart);
    socket.on('state',onUpdate);
    socket.on('update',onUpdate);
    socket.emit('subscribe','viewer',room,redis);
    return socket;
  }
});

