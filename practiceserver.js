var port = 1340;
// Downgrade from root
if (process.getuid() === 0)
    require('fs').stat(__filename, function(err, stats) {
            if (err)
                return console.log(err);
            process.setuid(stats.uid);
        });
console.log("Started practice server");
var io = require('socket.io').listen(port);
var games = {},
    gameBySocketId = {},
    gamesPerProcess = 32;
io.sockets.on('connection',function(socket){
        socket.on('subscribe',function(type,gameId){
		var g = games[gameId];
		if(typeof g == 'undefined'){
		    if(gamesPerProcess > 0){
			games[gameId] = new PGame(gameId,socket);
			gamesPerProcess--;
		    }else{
			socket.emit('error','No more practice rooms available');
			return;
		    }
		}else{
		    if(type == 'controller'){
			if(g.c0 === null){
			    g.connect(0,socket);
			}else if(g.c1 === null){
			    g.connect(1,socket);
			}else{
			    socket.emit('error','This room already has two controllers');
			}
		    }else{
			socket.emit('error','This id is taken');
		    }
		}
            });
        socket.on('disconnect',function(){
		var g = gameBySocketId[socket.id];
		if(g.host.id == socket.id){
		    g.c0.emit('disconnect');
		    g.c1.emit('disconnect');
		    delete gameBySocketId[g.c0.id];
		    delete gameBySocketId[g.c1.id];
		    delete gameBySocketId[g.host.id];
		    delete games[g.gid];
		}else if(g.c0.id == socket.id){
		    g.c0 = null;
		}else if(g.c1.id == socket.id){
		    g.c1 = null;
		}
            });
    });
PGame = function(id,host){
    this.host = host;
    this.gid = id;
    this.c0 = null;
    this.c1 = null;
    gameBySocketId[host.id] = this;
};
PGame.prototype.connect = function(id,socket){
    if(id == 0){
	this.c0 = socket;
    }
    if(id == 1){
	this.c1 = socket;
    }
    (function(pgame){
	socket.on('paddle',function(point){
		pgame.host.emit('paddle',id,point);
	    });
	socket.on('dbl',function(){
		pgame.host.emit('dlb',id);
	    });
    })(this);
    socket.emit('connected',id);
    gameBySocketId[socket.id] = this;
};
