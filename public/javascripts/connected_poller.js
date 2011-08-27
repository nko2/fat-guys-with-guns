$(document).ready(function() {
    setTimeout(checkForConnection, 8000);

    function checkForConnection() {
        var phone_secret = getCookie("phone_secret");

        $.ajax({
            url: "/is_phone_attached/"+phone_secret,
            type: 'get',
            cache: false,
            dataType: 'json',
            success: function(data){
                if (data.is_connected) {
                    window.location = "/room_list";
                }else {
                    setTimeout(checkForConnection, 3000);
                }
            }
        });
    }

    function getCookie(c_name) // Via http://www.w3schools.com/js/js_cookies.asp
    {
        var i,x,y,ARRcookies=document.cookie.split(";");
        for (i=0;i<ARRcookies.length;i++)
        {
          x=ARRcookies[i].substr(0,ARRcookies[i].indexOf("="));
          y=ARRcookies[i].substr(ARRcookies[i].indexOf("=")+1);
          x=x.replace(/^\s+|\s+$/g,"");
          if (x==c_name) {
            return decodeURI(y);
            }
        }
        return "";
    }
});