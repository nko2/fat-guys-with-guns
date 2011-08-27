var Util = require('../helpers/util');

module.exports = function(app, redis_client) {
    app.get('/room_list', function(req, res) {
        var user_name = req.cookies['user_id'];
        var phone_secret = req.cookies['phone_secret'];

        redis_client.
        redis_client.hgetall("room_list:", function(err, room_list) {
            if (err) {
                console.warn(err);
            }
            if (Util.isEmptyObject(room_list)) {
             room_list = {
                 "room_1" : { name : "Room 1", id: "room_1" , players : [], spectators : [], queue : [] },
                 "room_2" : { name : "Room 2", id: "room_2" , players : [], spectators : [], queue : [] },
                 "room_3" : { name : "Room 3", id: "room_3" , players : [], spectators : [], queue : [] },
                 "room_4" : { name : "Room 4", id: "room_4" , players : [], spectators : [], queue : [] },
                 "room_5" : { name : "Room 5", id: "room_5" , players : [], spectators : [], queue : [] }
             }
             redis_client.hmset("room_list:", room_list);
            }
            res.render('room_list', {
                user_name : user_name,
                phone_secret : phone_secret,
                room_list : room_list
            });
        });

    });

    app.get('/room/:room_id', function(req, res) {
        var room_id = req.params.phone_secret;
        var user_name = req.cookies['user_id'];
        var phone_secret = req.cookies['phone_secret'];

        res.render('room', {
            room_id : room_id,
            user_name : user_name,
            phone_secret : phone_secret
        });
    });


}