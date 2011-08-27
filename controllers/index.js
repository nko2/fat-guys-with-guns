StringHelper = require('../helpers/string_helper');

module.exports = function(app, redis_client) {
    app.get('/', function(req, res) {
        res.render('index', {
        });
    });

    app.post('/register', function(req, res) {
        var user_name = req.body.user_name;
        var phone_secret = StringHelper.createRandomWord(6);

        redis_client.hmset("phone_secret:"+phone_secret, {
            "user_name" : user_name
        });

        res.cookie('user_id', user_name, { httpOnly: false });
        res.cookie('phone_secret', phone_secret, { httpOnly: false });
        res.redirect('/home');
    });

    app.get('/home', function(req, res) {
        var user_name = req.cookies['user_id'];
        var phone_secret = req.cookies['phone_secret'];

        res.render('home', {
            user_name : user_name,
            phone_secret : phone_secret
        });
    });

    app.get('/room_list', function(req, res) {
        var user_name = req.cookies['user_id'];
        var phone_secret = req.cookies['phone_secret'];

        res.render('room_list', {
            user_name : user_name,
            phone_secret : phone_secret
        });
    });
}