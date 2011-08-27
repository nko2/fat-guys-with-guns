var StringHelper = require('../helpers/string_helper');
var Util = require('../helpers/util');

module.exports = function(app, redis_client) {
    app.get('/', function(req, res) {
        if (Util.isMobile(req)) {
         res.redirect("/phone");
         return;
        }

        res.render('index', {
        });
    });

    app.post('/register', function(req, res) {
        var user_name = req.body.user_name;

        findUniqueKey(function(phone_secret) {
            redis_client.hmset("phone_secret:"+phone_secret, {
                "user_name" : user_name
            });
            // Expire ids so we can reuse them later
            redis_client.expire("phone_secret:"+phone_secret, 86400); // One Day

            res.cookie('user_id', user_name, { httpOnly: false });
            res.cookie('phone_secret', phone_secret, { httpOnly: false });
            res.redirect('/home');
        });
    });

    app.get('/home', function(req, res) {
        var user_name = req.cookies['user_id'];
        var phone_secret = req.cookies['phone_secret'];

        res.render('home', {
            user_name : user_name,
            phone_secret : phone_secret,
            javascripts : ["/javascripts/connected_poller.js"]
        });
    });


    function findUniqueKey(callback) {
        var phone_secret = StringHelper.createRandomWord(7);
        // Make sure we don't already have a redis object with this value, if we do, get another
        redis_client.hgetall("phone_secret:"+phone_secret, function(err, data) {
            if (err) {
                console.warn(err);
            }
            if (!data.user_name) {
                callback(phone_secret)
            }else {
                findUniqueKey(callback);
            }
        });
    }
}