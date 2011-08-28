var controllerNumber = null,
    controllerSocket = null;

function onNominate(num){
  console.log('currently controller '+num);
  controllerNumber = num;
  $([
    '<div class="connected">',
      'You are connected as Player ', (num+1), ' (on the ', (num == 0 ? 'left' : 'right'), ' side)',
    '</div>'
  ].join('')).appendTo( $("#messages") );
}
function onGameOver(winner){
    controllerNumber = null;
    console.log("Game over, won by"+winner);
}
function onCountdown(n){
  console.log(n+' seconds remaining');
  var $countdown = $('#messages .countdown');
  if($countdown.length == 0) {
    $countdown = $('<div class="countdown">&nbsp;</div>').appendTo( $("#messages") );
  }
  console.log("len " + $countdown.length);
  
  $countdown.text('The game will start in ' + n + ' seconds');
}
function onStart(gameState){
  console.log("Starting game");
  $('#messages').html(
    "<div>The game is starting. Don't look here, look at the computer screen!!!</div>"
  );
}
function onError(err){
    console.log('Damn error'+err);
}

function connectToRoom(port,room,redis){
  var socket = io.connect(['http://',document.domain,':',port].join(''));
  socket.emit('subscribe','controller',room,redis);
  socket.on('error',onError);
  socket.on('win',onGameOver);
  socket.on('time',onCountdown);
  socket.on('start',onStart);
  socket.on('nominate',onNominate);
  controllerSocket = socket;
  return socket;
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

  connectToRoom(port, room_id , phone_secret);

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
    if (controllerSocket !== null && controllerNumber !== null) {
      controllerSocket.emit('paddle', null);
      isEmitPending = false;
    }
  }

  function emitNow() {
    if (controllerSocket !== null && controllerNumber !== null) {
      controllerSocket.emit('paddle', [pt1, pt2]);
      isEmitPending = false;
    }
  }

  function emitDbl() {
    if (controllerSocket !== null && controllerNumber !== null) {
      controllerSocket.emit('dbl');
    }
  }
});

