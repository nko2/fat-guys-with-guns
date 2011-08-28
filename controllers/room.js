var Util = require('../helpers/util');

module.exports = function(app, redis_client) {
    app.get('/room_list', function(req, res) {
        var user_name = req.cookies['user_id'];
        var phone_secret = req.cookies['phone_secret'];
        var room_list = [];

        // Get Rooms
        getServerData(function(results) {
            for(var key in results) {
                try {
                    room_list.push(JSON.parse(results[key]));
                }catch(ex) {
                    // Messed up way to get Redis results, but it will have to work for now
                }
            }

            res.render('room_list', {
                user_name : user_name,
                phone_secret : phone_secret,
                room_list : room_list,
                javascripts : ["/javascripts/old_school.js"]
            });
        });

    });

    app.get('/room/:room_id/:user_action', function(req, res) {
        var room_id = req.params.room_id;
        var user_name = req.cookies['user_id'];
        var phone_secret = req.cookies['phone_secret'];
        var user_action = req.params.user_action;

        getServerData(function(data) {
            var room_data = JSON.parse(data[room_id]);
            if (user_action=="play") {
                Util.setRedisUserData(redis_client, phone_secret, { room_name : room_data.name, port : room_data.port});
            }

            res.render('room', {
                layout : false,
                room_id : room_id,
                user_name : user_name,
                user_action : user_action,
                phone_secret : phone_secret,
                port : room_data.port
            });
        });
    });

    function getServerData(callback) {
        var count = 0;
        var results = [];

        redis_client.hgetall("rooms", function(err, data) {
            callback(data);
        });

/*
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
            console.warn(data);
            handleResult(err, "server-0", data);
        });

        redis_client.hgetall("server-1", function(err, data) {
            handleResult(err, "server-1", data);
        });

        redis_client.hgetall("server-2", function(err, data) {
            handleResult(err, "server-2", data);
        });
        */
    }

}