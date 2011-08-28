$(document).ready(function() {

  var loc = window.location;
  var uri = loc.protocol + "//" + loc.host + $("#url").text();

  $.ajax({
    url: "http://is.gd/create.php?format=json&url="+encodeURI(uri),
    type: 'get',
    cache: false,
    dataType: 'json',
    success: function(data){
      if (data && data.shorturl) {
        $("#url").text(data.shorturl);
      }
      console.warn(data);
    }
  });
});