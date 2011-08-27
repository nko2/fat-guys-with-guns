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
    }
}