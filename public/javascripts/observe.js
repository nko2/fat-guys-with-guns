$(function () {
  var gameView = new GameView(require().GameDef, $('#game_view'));
  connectToRoom(port,room_id,phone_secret);
  var $mess = $('.message');
  function emitMessage(m){$mess.text(m);console.log(m);}

  function onGameOver(winner){
    console.log(winner);
    console.log("Game over, won by"+winner.user_name);
  }
  function onCountdown(n){
      if(n > 0){
	  emitMessage(n.toString()+' seconds');
	  setTimeout(function(){onCountdown(n-1);},1000);
      }else{
	  emitMessage('');
      }
  }
  function onUpdate(dat){
    gameView.drawState(dat);
  }
  function onStart(gameState){
      emitMessage("Game started!");
      setTimeout(function(){emitMessage('');},2000);
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

