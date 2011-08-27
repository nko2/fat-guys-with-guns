var Util = require('../helpers/util');

module.exports = function(app, redis_client) {
    app.get('/room_list', function(req, res) {
        var user_name = req.cookies['user_id'];
        var phone_secret = req.cookies['phone_secret'];

        redis_client.hgetall("rooms:", function(err, room_list) {
            if (err) {
                console.warn(err);
            }

            res.render('room_list', {
                user_name : user_name,
                phone_secret : phone_secret,
                room_list : room_list || []
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