var Util = require('../helpers/util');
var StringHelper = require('../helpers/string_helper');

module.exports = function(app, redis_client) {
  app.get('/room_list', function(req, res) {
    var user_name = req.cookies['user_id'];
    var phone_secret = req.cookies['phone_secret'];
    var room_list = [];

    // Clear user room data
    Util.setRedisUserData(redis_client, phone_secret, { room_name : "", port : ""});

    res.render('room_list', {
      user_name : user_name,
      phone_secret : phone_secret,
      javascripts : ["/javascripts/old_school.js", "/javascripts/room_list_poller.js"]
    });

  });

  app.get('/practice', function(req, res) {
    var user_name = req.cookies['user_id'];
    var phone_secret = req.cookies['phone_secret'];

    // Clear user room data
    Util.setRedisUserData(redis_client, phone_secret, { room_name : "", port : ""});

    res.render('practice', {
      user_name : user_name,
      phone_secret : phone_secret,
      url : "/practice/" + StringHelper.createRandomWord(7),
      javascripts : ["/javascripts/old_school.js", "/javascripts/practice_page.js"]
    });
  });

  app.get('/practice/:id', function(req, res) {
    var user_name = req.cookies['user_id'];
    var phone_secret = req.cookies['phone_secret'];
    var practice_id = req.params.id;
    if (Util.isMobile(req)) {
      res.render('practice_room_for_mobile', {
        layout : false,
        id : practice_id
      });
    }else {
      Util.setRedisUserData(redis_client, phone_secret, { room_name : "practice:"+practice_id });
      res.render('practice_room_for_browser', {
        layout : false,
        id : practice_id
      });
    }

  });

  app.get('/room_for_browser/:room_id/:user_action', function(req, res) {
    var room_id = req.params.room_id;
    var user_name = req.cookies['user_id'];
    var phone_secret = req.cookies['phone_secret'];
    var user_action = req.params.user_action;

    getServerData(function(data) {
      var room_data = JSON.parse(data[room_id]);
      if (user_action == "play") {
        console.warn("setting " + phone_secret + " ", room_data.name, room_data.port);
        Util.setRedisUserData(redis_client, phone_secret, { room_name : room_data.name, port : room_data.port});
      }

      res.render('room_for_browser', {
        layout : false,
        room_id : room_id,
        user_name : user_name,
        user_action : user_action,
        phone_secret : phone_secret,
        port : room_data.port
      });
    });
  });

  app.get('/room_data.json', function(req, res) {
    var phone_secret = req.cookies['phone_secret'];
    var room_list = [];

    // Clear user room data
    Util.setRedisUserData(redis_client, phone_secret, { room_name : "", port : ""});

    // Get Rooms
    getServerData(function(results) {
      for (var key in results) {
        try {
          room_list.push(JSON.parse(results[key]));
        } catch(ex) {
          // Messed up way to get Redis results, but it will have to work for now
        }
      }
      res.json({ room_data : room_list });
    });
  });

  function getServerData(callback) {
    var count = 0;
    var results = [];

    redis_client.hgetall("rooms", function(err, data) {
      if (err) {  console.warn(err); };
      callback(data);
    });
  }

}