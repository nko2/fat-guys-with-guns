/**
 * Module dependencies.
 */

var express = require('express'),
    redis   = require('redis'),
    sio     = require('socket.io'),
    nko     = require('nko')('HZImKIPa/PNedR2z');

var app = module.exports = express.createServer();

// Configuration
/*
var redis_client = redis.createClient();
    console.log("Redis connection error to " + redis_client.host + ":" + redis_client.port + " - " + err);
})*/
var redis_client = null;


app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.bodyParser());
  app.use(express.cookieParser());
  app.use(express.session({ secret: "h7f7fere4hghs" }));
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.configure('production', function(){
  app.use(express.errorHandler());
});

require('./controllers/index')(app, redis_client);
require('./controllers/phone')(app, redis_client);
require('./controllers/room')(app, redis_client);

app.listen(process.env.NODE_ENV === 'production' ? 80 :3000,function(){
  // Maybe we shouldn't run as root =)
  if (process.getuid() === 0) {
    require('fs').stat(__filename, function(err, stats) {
      if (err) {
        return console.log(err);
      }
      process.setuid(stats.uid);
    });
  }
  console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
});

var io = sio.listen(app);
io.sockets.on('connection', function (socket) {
  socket.on('subscribe', function(type) {
    if(type == 'controller') {
      socket.on('pts', function(points) {
        io.sockets.in('views').volatile.emit('pts', points);
      });
    }
    else if(type == 'view') {
      socket.join('views');
    }
  });
});

