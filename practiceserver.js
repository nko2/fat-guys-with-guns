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
			g = games[gameId] = new PGame(gameId);
			gamesPerProcess--;
		    }else{
			socket.emit('error','No more practice rooms available');
			return;
		    }
		}
		g.connect(type,socket);
            });
        socket.on('disconnect',function(){
		var g = gameBySocketId[socket.id];
		if(g.host.id == socket.id){
		    if(g.c0){
			g.c0.emit('disconnect');
			delete gameBySocketId[g.c0.id];
		    }
		    if(g.c1){
			g.c1.emit('disconnect');
			delete gameBySocketId[g.c1.id];
		    }
		    delete gameBySocketId[g.host.id];
		    delete games[g.gid];
		}else if(g.c0.id == socket.id){
		    g.c0 = null;
		}else if(g.c1.id == socket.id){
		    g.c1 = null;
		}
            });
    });
PGame = function(id){
    this.host = null;
    this.gid = id;
    this.c0 = null;
    this.c1 = null;
    gameBySocketId[host.id] = this;
};

PGame.prototype.connect = function(type,socket){
    if(type=='viewer' && this.host==null){
	this.host = socket;
	gameBySocketId[socket.id] = this;
    }else if(type == 'controller'){
	var id;
	if(this.c0 == null){
	    this.c0 = socket;
	    id = 0;
	}else if(this.c1 == null){
	    this.c1 = socket;
	    id = 1;
	}else{
	    socket.emit('error','This room already has two controllers');
	    return;
	}
	(function(pgame){
	    socket.on('paddle',function(point){
		    if(pgame.host) pgame.host.emit('paddle',id,point);
		});
	    socket.on('dbl',function(){
		    if(pgame.host) pgame.host.emit('dlb',id);
		});
	})(this)
	gameBySocketId[socket.id] = this;
    }else{
	socket.emit('error','This room is full');
    }
};