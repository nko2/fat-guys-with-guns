var controllerSocket = null;

function connectToRoom(id,port){
  var socket = io.connect(['http://',document.domain,':',port].join(''));
  socket.emit('subscribe','controller',id);

  controllerSocket = socket;
}

$(function() {
  var $body = $('body'),
    width = $body.width(),
    isDown = false,
    pt1 = { x:null, y:null },
    pt2 = { x:null, y:null },
    lastTouchTime = Date.now(),
    touchUpSinceLastTime = true,
    isEmitPending = false;

  connectToRoom(id,port);

  $body.bind('touchstart', touchstart);
  $body.bind('touchmove', touchmove);
  $body.bind('touchend', touchchange);

  setInterval(function() {
    if (isEmitPending) {
      emitNow();
    }
  }, 1000/30);

  function touchstart(e) {
    var t = Date.now();
    if(touchUpSinceLastTime && (t - lastTouchTime < 400) && (t - lastTouchTime > 50)) {
      emitDbl();
    }
    lastTouchTime = t;
    touchUpSinceLastTime = false;
    touchchange(e);
  }

  function touchchange(e) {
    e.preventDefault();
    var wasDown = isDown;
    isDown = e.originalEvent.targetTouches.length == 2;

    if(e.originalEvent.targetTouches.length == 0) {
      touchUpSinceLastTime = true;
    }

    if(isDown) {
      $body.addClass("down");
    }
    else {
      $body.removeClass("down");
    }

    if(isDown) {
      exportTouches(e, true);
    }
    else if(wasDown) {
      emitNow();
      exportNull(e);
    }
  }

  function touchmove(e) {
    e.preventDefault();
    if(isDown) {
      exportTouches(e, false);
    }
  }

  function exportTouches(e, immediate) {
    var touches = e.originalEvent.targetTouches;
    pt1.x = touches[0].pageX / width;
    pt1.y = touches[0].pageY / width;
    pt2.x = touches[1].pageX / width;
    pt2.y = touches[1].pageY / width;

    if(immediate) {
      emitNow();
    }
    else {
      isEmitPending = true;
    }
  }

  function exportNull(e) {
    if (controllerSocket !== null) {
      controllerSocket.emit('paddle', null);
      isEmitPending = false;
    }
  }

  function emitNow() {
    if (controllerSocket !== null) {
      controllerSocket.emit('paddle', [pt1, pt2]);
      isEmitPending = false;
    }
  }

  function emitDbl() {
    if (controllerSocket !== null) {
      controllerSocket.emit('dbl');
    }
  }
});

