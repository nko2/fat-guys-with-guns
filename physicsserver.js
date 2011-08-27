var serverNumber = parseInt(process.argv[2]),
    port = [1337,1338,1339][serverNumber];
// Downgrade from root
if (process.getuid() === 0)
    require('fs').stat(__filename, function(err, stats) {
	    if (err) return console.log(err)
			 process.setuid(stats.uid);
	});
console.log("Started physics server "+serverNumber);
var io = require('socket.io').listen(port);

var games = {},
    gameBySocketId = {},
    gamesLeft = 4;//Random guess - can we simulate 4 games per socket

io.sockets.on('connection',function(socket){
	socket.on('subscribe',function(type,gameId){
		var room = games[gameId];
		if(typeof room === 'undefined'){
		    if(gamesLeft > 0){
			games[gameId] = room = new Game(gameId);
			gamesLeft--;
		    }else{
			console.log("server can't take it anymore!");
			socket.emit('error',"This game room is full");
		    //This message is slightly misleading, but should trigger the same failure path in the client
		    }
		}
		if(room)
		    if(room.join(socket,type)){
			gameBySocketId[socket.id] = gameId;
			//Probably want to send data here
		    }else{
			console.log("game is full");
			socket.emit('error',"This game room is full");			
		    }
	    });
	socket.on('disconnect',function(){
		var gameId, game;
		if(gameId = gameBySocketId[socket.id]){
		    if(game=games[gameId]){
			game.remove(socket.id);
			if(game.empty()){
			    console.log("Deleting game");
			    delete game[gameId];
			    gamesLeft++;
			}
			
		    }
		    delete gameBySocketId[socket.id];
		}		
	    });
    });

Game = function(id){
    this.left = 4;
};
Game.prototype.join = function(socket,type){
    if(this.left == 0){
	return false;
    }else{
	this.left--;
	return true;
    }
};
Game.prototype.empty = function(){
    return (this.left == 4);
};
Game.prototype.remove = function(id){
    this.left++;
};