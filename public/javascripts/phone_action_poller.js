$(document).ready(function() {
    setTimeout(checkForAction, 3000);

    function checkForAction() {
        var phone_secret = getCookie("phone_secret");
        $.ajax({
            url: "/phone/"+phone_secret+"/action",
            type: 'get',
            cache: false,
            dataType: 'json',
            success: function(data){
                if (data) {
                    if (data.redirect) {
                        window.location = data.redirect;
                    }else {
                        setTimeout(checkForAction, 3000);
                    }
                }else {
                    setTimeout(checkForAction, 3000);
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