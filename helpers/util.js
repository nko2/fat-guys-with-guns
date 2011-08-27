module.exports = {
    isMobile : function(req) {
        var ua = req.headers['user-agent'];

        if (/mobile/i.test(ua))
            return true;

        if (/iPhone/.test(ua) ||  /iPad/.test(ua))
            return true;

        if (/Android/.test(ua))
            return true;
    },
    isEmptyObject : function(obj) {
        for (var name in obj) {
            return false;
        }
        return true;
    },
    setRedisNewUserData : function(redis_client, phone_secret, user_name) {
        redis_client.hmset("phone_secret:"+phone_secret, {
            "user_name" : user_name,
            "games_played" : 0,
            "is_connected" : false,
            "last_played_timestamp" : new Date()
        });
        // Expire ids so we can reuse them later
        redis_client.expire("phone_secret:"+phone_secret, 86400); // One Day
    },
    setRedisUserData : function(redis_client, phone_secret, user_data) {
        this.getRedisUserData(redis_client, phone_secret, function(data) {
            for(var key in user_data) {
                data[key] = user_data[key];
            }
            redis_client.hmset("phone_secret:"+phone_secret,data);
        });
    },
    getRedisUserData : function(redis_client, phone_secret, callback) {
        redis_client.hgetall("phone_secret:"+phone_secret, function(err, data) {
            if (err) {
                console.warn(err);
                return;
            }
            callback(data);
        });
    }
}