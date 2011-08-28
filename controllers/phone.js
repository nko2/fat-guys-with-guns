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
                if (data.room_name.split(":").length > 1) {
                  var action = data.room_name.split(":")[0];
                  if (action === "practice") {
                    var place = data.room_name.split(":")[1];
                    res.json({ redirect : "/practice_mobile/" + place });
                  }else {
                    console.warn("Directing to something other than practice");
                  }
                }else {
                  res.json({ redirect : "/room_for_mobile/" + data.room_name + "/" + data.port.toString()  });
                }
            } else {
                res.json({ "wait" : true });
            }
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

    app.get('/room_for_mobile/:room_id/:port_id', function(req, res) {
        var user_name = req.cookies['user_id'];
        var phone_secret = req.cookies['phone_secret'];
        var room_id = req.params.room_id;
        var port_id = req.params.port_id;

        if (!phone_secret) {
            res.redirect("/phone");
            return;
        }

        res.render('room_for_mobile', {
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
                res.cookie('phone_secret', phone_secret, { maxAge: 90000000 });
                res.cookie('user_name', data.user_name, { maxAge: 90000000  });
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

    app.get('/phone_add/:room_id/:phone_secret', function(req, res) {
      var phone_secret = req.params.phone_secret;
      var room_id = req.params.room_id;

      res.render('phone_add', {
        layout : 'mobile_layout',
        room_id : room_id,
        phone_secret : phone_secret
      });
    });

    app.post('/phone_add', function(req, res) {
      var phone_secret = req.body.phone_secret;
      var user_name = req.body.user_name;
      var room_id = req.body.room_id;

      Util.setRedisNewUserData(redis_client, phone_secret, user_name);
      redis_client.hgetall("rooms", function(err, data) {
        if (err) {  console.warn(err); };
        if (data[room_id]) {
          var row = JSON.parse(data[room_id]);
          res.cookie('phone_secret', phone_secret, { maxAge: 90000000 });
          res.cookie('user_name', data.user_name, { maxAge: 90000000  });

          Util.setRedisUserData(redis_client, phone_secret, { room_id : room_id, port : data[room_id].port });



        }
      });


    });
}