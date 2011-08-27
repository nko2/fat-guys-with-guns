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
    gamesLeft = 4;//Random guess - can we simulate 4 games per socket?
io.sockets.on('connection',function(socket){
	socket.on('subscribe',function(type,gameId){
		var room = games[gameId];
		if(typeof room === 'undefined'){
		    if(gamesLeft > 0){
			games[gameId] = room = new Game(gameId);
			gamesLeft--;
		    }else{
			socket.emit('error',"This game room is full");
		    //This message is slightly misleading, but should trigger the same failure path in the client
		    }
		}
		if(room)
		    if(room.join(socket,type)){
			gameBySocketId[socket.id] = gameId;
			//Probably want to send current world data here
		    }else{
			socket.emit('error',"This game room is full");			
		    }
	    });
	socket.on('disconnect',function(){
		var gameId, game;
		if(gameId = gameBySocketId[socket.id]){
		    if(game=games[gameId]){
			game.remove(socket.id);
			if(game.empty()){
			    delete game[gameId];
			    gamesLeft++;
			}			
		    }
		    delete gameBySocketId[socket.id];
		}		
	    });
    });

Game = function(id){
    this.gameId = id;
    //Initialize a new physics object here
    this.physics = null;
    this.viewers = 0;
    this.controllers = 0;

    this.all_sockets = id+'-all';
    this.controller_sockets = id+'-control';
};
Game.prototype.join = function(socket,type){
    if(type == 'viewer'){
	//Probably can manage 4 viewers and 4 controllers?
	if(this.viewers < 4){
	    socket.join(this.all_sockets);
	    this.viewers++;
	    return true;
	}
    }else if(type == 'controller'){
	if(this.controllers < 4){
	    socket.join(this.controller_sockets);
	    controllers++;
	    return true;
	}
    }
    return false;
};
Game.prototype.empty = function(){
    return (this.viewers == 0 && this.controllers == 0);
};
Game.prototype.remove = function(id){
    var controller_room = io.sockets.manager.rooms[this.controller_sockets] || [];
    if(-1 != controller_room.indexOf(id))
	this.controllers--;
    else
	this.viewers--;
};


