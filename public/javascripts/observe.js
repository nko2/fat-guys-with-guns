function onGameOver(winner){
    console.log("Game over, won by"+winner);
}
function onCountdown(n){
    console.log(n+' seconds remaining');
}
function onUpdate(dat){
    console.log('update tick');
}
function onStart(gameState){
    console.log("Starting game");
}

function onState(currentState){

}
function onError(err){
    console.log('Damn error'+err);
}

function connectToRoom(port,room,redis){
    var socket = io.connect(['http://',document.domain,':',port].join(''));
    socket.on('error',onError);
    socket.on('win',onGameOver);
    socket.on('time',onCountdown);
    socket.on('start',onStart);
    socket.on('state',onState);
    socket.on('update',onUpdate);
    socket.emit('subscribe','viewer',room,redis);
    return socket;
}

$(function () {
  var gameView = new GameView(GameDef, $('#game_view'));
});
