var Util = require('../helpers/util');

module.exports = function(app, redis_client) {
    app.get('/room_list', function(req, res) {
        var user_name = req.cookies['user_id'];
        var phone_secret = req.cookies['phone_secret'];
        // Get Rooms
        getServerData(function(results) {
            // Logic to handle results
            console.warn("ServerData", results);
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
        var results = {};

        var handleResult = function(err, name, data) {
            if (err) {
                console.warn(err);
                callback({});
                return;
            }
            results[name] = data;
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