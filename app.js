
/**
 * Module dependencies.
 */

var express = require('express'),
    sio      = require('socket.io'),
    nko     = require('nko')('HZImKIPa/PNedR2z');

var app = module.exports = express.createServer();

// Configuration

app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.bodyParser());
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

// Routes

app.get('/', function(req, res){
  res.render('index', {
    title: 'Express'
  });
});
app.listen(process.env.NODE_ENV === 'production' ? 80 :3000);
console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);

// Socket

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

