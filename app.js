/**
 * Module dependencies.
 */

var express = require('express'),
    redis   = require('redis'),
    sio     = require('socket.io'),
    nko     = require('nko')('HZImKIPa/PNedR2z');

var app = module.exports = express.createServer();

// Configuration

var redis_client = redis.createClient();

redis_client.on("error", function (err) {
    console.log("Redis connection error to " + redis_client.host + ":" + redis_client.port + " - " + err);
});


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
// io.set('log level', 1);
io.sockets.on('connection', function (socket) {
  socket.on('subscribe', function(type) {
    if(type == 'controller') {
      socket.on('pts', function(index, pt1x, pt1y, pt2x, pt2y) {
        io.sockets.in('views').volatile.emit('pts', index, pt1x == null ? null : [{x:pt1x, y:pt1y},{x:pt2x, y:pt2y}]);
      });
      socket.on('dbl', function(index) {// Doubletouch event
        io.sockets.in('views').volatile.emit('dbl', index);
      });
    }
    else if(type == 'view') {
      socket.join('views');
    }
  });
});

