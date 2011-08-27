module.exports = function(app, redis_client) {
    app.get('/phone', function(req, res) {
        res.render('phone_connect', {
            connected : false
        });
    });

    app.get('/phone_attached/:phone_secret', function(req, res) {
        var phone_secret = req.params.phone_secret;
        redis_client.hgetall("phone_secret:"+phone_secret, function(err, data) {
            if (err) {
                console.warn(err);
            }
            res.json({ is_connected: data.is_connected });
        });
    });


    app.post('/phone_connect', function(req, res) {
        var phone_secret = req.body.phone_secret;
        redis_client.hgetall("phone_secret:"+phone_secret, function(err, data) {
            if (err) {
                console.warn(err);
            }
            res.cookie('phone_secret', phone_secret, { httpOnly: false });
            res.cookie('user_name', data.user_name, { httpOnly: false });
            setConnected(phone_secret, data.user_name);
            res.render('phone_connect', {
                connected: true,
                user_name : data.user_name
            });
        });
    });

    function setConnected(phone_secret, user_name) {
        redis_client.hmset("phone_secret:"+phone_secret, {
            "user_name" : user_name,
            "is_connected" : true
        });
    };
}