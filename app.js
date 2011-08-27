
/**
 * Module dependencies.
 */

var express = require('express'),
	redis   = require('redis'),
    nko     = require('nko')('HZImKIPa/PNedR2z');

var app = module.exports = express.createServer();

// Configuration
var redis_client = redis.createClient();

redis_client.on("error", function (err) {
    console.log("Redis connection error to " + client.host + ":" + client.port + " - " + err);
})

/*redis_client.set("string key", "string val", redis.print);
redis_client.hset("hash key", "hashtest 1", "some value", redis.print);
redis_client.hset(["hash key", "hashtest 2", "some other value"], redis.print);
redis_client.hkeys("hash key", function (err, replies) {
    console.warn(replies.length + " replies:");
    replies.forEach(function (reply, i) {
        console.warn("  z  " + i + ": " + reply);
    });
    redis_client.quit();
});*/

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

app.listen(process.env.NODE_ENV === 'production' ? 80 :3000,function(){
	// Maybe we shouldn't run as root =)
	if (process.getuid() === 0)
	    require('fs').stat(__filename, function(err, stats) {
		    if (err) return console.log(err)
				 process.setuid(stats.uid);
		});
	console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
    });
