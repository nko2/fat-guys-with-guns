var Util = require('../helpers/util');

module.exports = function(app, redis_client) {
    app.get('/room_list', function(req, res) {
        var user_name = req.cookies['user_id'];
        var phone_secret = req.cookies['phone_secret'];
        var room_list = [];

        // Get Rooms
        getServerData(function(results) {
            results.forEach(function(row) {
                room_list.push(row.gameId);
            });

            res.render('room_list', {
                user_name : user_name,
                phone_secret : phone_secret,
                room_list : room_list || ["foo", "bar", "taz", "gto"]
            });
        });

    });

    app.get('/room/:room_id', function(req, res) {
        var room_id = req.params.room_id;
        var user_name = req.cookies['user_id'];
        var phone_secret = req.cookies['phone_secret'];

        res.render('room', {
            room_id : room_id,
            user_name : user_name,
            phone_secret : phone_secret,
            javascripts : [ "/javascripts/room.js"]
        });
    });

    function getServerData(callback) {
        var count = 0;
        var results = [];

        var handleResult = function(err, name, data) {
            if (err) {
                console.warn(err);
                callback({});
                return;
            }
            // This should push a bunch of game rows into results
            for(var item in data) {
                results.push(data[item]);
            }
            count += 1;
            if (count == 3) {
                callback(results);
            }
        };

        redis_client.hgetall("server-0", function(err, data) {
            handleResult(err, "server-0", data);
        });

        redis_client.hgetall("server-1", function(err, data) {
            handleResult(err, "server-1", data);
        });

        redis_client.hgetall("server-2", function(err, data) {
            handleResult(err, "server-2", data);
        });
    }

}