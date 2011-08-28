$(document).ready(function() {
  setTimeout(updateList, 300);

  function updateList() {
    $.ajax({
      url: "/room_data.json",
      type: 'get',
      cache: false,
      dataType: 'json',
      success: function(data) {
        if (data && data.room_data) {
          buildRoomHtml(data.room_data);
        }
        setTimeout(updateList, 3000);
      }
    });
  }

  function buildRoomHtml(room_data) {
    var html = [];

    room_data.forEach(function(room) {
      html.push("<div>" + room.name + "&nbsp<span style='font-size:24px'>")
      if (room.controllers < 2) {
        html.push("<a href=/room_for_browser/" + room.name + "/play>Play");
        if (room.controllers === 1) {
          html.push("(1 player waiting)");
        }
        html.push("</a>");
      }else {
        html.push("<span>(Full)</span>");
      }
      html.push("</div>");
    });

    $("#room_list").html(html.join(""));
  }


});