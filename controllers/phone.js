var Util = require('../helpers/util');

module.exports = function(app, redis_client) {
    app.get('/phone', function(req, res) {
        var phone_secret = req.cookies['phone_secret'];
        res.render('phone_connect', {
            layout: 'mobile_layout',
            connected : false
        });
    });

    app.get('/is_phone_attached/:phone_secret', function(req, res) {
        var phone_secret = req.params.phone_secret;
        Util.getRedisUserData(redis_client, phone_secret, function(data) {
            res.json({ is_connected: data.is_connected });
        });
    });

    app.get('/phone/:phone_secret/action', function(req, res) {
        var phone_secret = req.params.phone_secret;
        Util.getRedisUserData(redis_client, phone_secret, function(data) {
            if (data && data.room_name) {
                res.json({ redirect : "/phone_stub/" + data.room_name + "/" + data.port.toString()  });
            } else {
                res.json({ "wait" : true });
            }
            ;
        });
    });

    app.get('/phone_connect', function(req, res) {
        var user_name = req.cookies['user_id'];
        var phone_secret = req.cookies['phone_secret'];

        if (!phone_secret) {
            res.redirect("/phone");
            return;
        }
        res.render('phone_connect', {
            layout: 'mobile_layout',
            connected: true,
            user_name : user_name,
            javascripts : ["/javascripts/phone_action_poller.js"]
        });

    });

    app.get('/phone_stub/:room_id/:port_id', function(req, res) {
        var user_name = req.cookies['user_id'];
        var phone_secret = req.cookies['phone_secret'];
        var room_id = req.params.room_id;
        var port_id = req.params.port_id;

        if (!phone_secret) {
            res.redirect("/phone");
            return;
        }

        res.render('phone_stub', {
            layout: false,
            phone_secret : phone_secret,
            room_id : room_id,
            port : port_id
        });

    });

    app.post('/phone_connect', function(req, res) {
        var phone_secret = req.body.phone_secret;
        Util.getRedisUserData(redis_client, phone_secret, function(data) {
            if (data.user_name) {
                res.cookie('phone_secret', phone_secret, { httpOnly: false });
                res.cookie('user_name', data.user_name, { httpOnly: false });
                Util.setRedisUserData(redis_client, phone_secret, { is_connected: true }); // Set connected
                res.render('phone_connect', {
                    layout: 'mobile_layout',
                    connected: true,
                    user_name : data.user_name,
                    javascripts : ["/javascripts/phone_action_poller.js"]
                });
            } else {
                res.redirect('/phone');
            }
        });
    });
}