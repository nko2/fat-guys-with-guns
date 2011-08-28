var controllerNumber = null,
    controllerSocket = null;

function onNominate(num){
    console.log('currently controller '+num);
    controllerNumber = num;
}
function onGameOver(winner){
    controllerNumber = null;
    console.log("Game over, won by"+winner);
}
function onCountdown(n){
    console.log(n+' seconds remaining');
}
function onStart(gameState){
    console.log("Starting game");
}
function onError(err){
    console.log('Damn error'+err);
}

function onState(currentState){

}

function tick(){
    if(controllerNumber !== null){
	controllerSocket.emit('controller','some data',controllerNumber);
    }
    setTimeout(tick,1000);
}
tick();
function connectToRoom(port,room,redis){
    var socket = io.connect(['http://',document.domain,':',port].join(''));
    socket.emit('subscribe','controller',room,redis);
    socket.on('error',onError);
    socket.on('win',onGameOver);
    socket.on('time',onCountdown);
    socket.on('start',onStart);
    socket.on('state',onState);
    socket.on('nominate',onNominate);
    controllerSocket = socket;
    return socket;
}
