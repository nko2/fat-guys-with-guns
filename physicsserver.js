var http = require('http');

var server =  http.createServer(function (req, res) {
	res.writeHead(200, {'Content-Type': 'text/plain'});
	res.end('Hello World\n');
    });

server.listen(parseInt(process.argv[2]),function(){
        if (process.getuid() === 0)
            require('fs').stat(__filename, function(err, stats) {
                    if (err) return console.log(err)
                                 process.setuid(stats.uid);
		});
	console.log("Started physics slave n");
    });



