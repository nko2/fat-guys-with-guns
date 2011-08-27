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
function onError(err){
    console.log('Damn error'+err);
}

function connectToRoom(server,room,redis){
    var socket = io.connect(server);
    socket.emit('subscribe','viewer',room,redis);
    socket.on('error',onError);
    socket.on('win',onGameOver);
    socket.on('time',onCountdown);
    socket.on('start',onStart);
    socket.on('update',onUpdate);
    return socket;
}
