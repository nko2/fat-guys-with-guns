var StringHelper = require('../helpers/string_helper');
var Util = require('../helpers/util');

module.exports = function(app, redis_client) {
    app.get('/', function(req, res) {
        if (Util.isMobile(req)) {
         res.redirect("/phone");
         return;
        }
        var phone_secret = req.cookies['phone_secret'];
        /*if (phone_secret) {
            res.redirect("/home");
            return;
        };*/

        res.render('index', {
            javascripts : ["/javascripts/old_school.js"]
        });
    });

    app.post('/register', function(req, res) {
        var user_name = req.body.user_name;

        findUniqueKey(function(phone_secret) {
            Util.setRedisNewUserData(redis_client, phone_secret, user_name);

            res.cookie('user_id', user_name, { httpOnly: false });
            res.cookie('phone_secret', phone_secret, { httpOnly: false });
            res.redirect('/home');
        });
    });

    app.get('/home', function(req, res) {
        var user_name = req.cookies['user_id'];
        var phone_secret = req.cookies['phone_secret'];
        Util.setRedisUserData(redis_client, phone_secret, { is_connected : false});
        Util.getRedisUserData(redis_client, phone_secret, function(data) {
                res.render('home', {
                    user_name : user_name,
                    phone_secret : phone_secret,
                    javascripts : ["/javascripts/connected_poller.js", "/javascripts/old_school.js"]
                });
        });
    });


    function findUniqueKey(callback) {
        var phone_secret = StringHelper.createRandomWord(7);
        // Make sure we don't already have a redis object with this value, if we do, get another
        Util.getRedisUserData(redis_client, phone_secret, function(data) {
            if (!data.user_name) {
                callback(phone_secret)
            }else {
                findUniqueKey(callback);
            }
        });
    }
}