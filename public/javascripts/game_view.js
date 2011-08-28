function GameView(gameDef, $container) {

  var $foreground = $container.find('.foreground'),
      $background = $container.find('.background'),
      $disco = $background.find('.disco_wall'),
      $paddles = [],
      $score0 = $background.find('.score .player_1'),
      $score1 = $background.find('.score .player_2'),
      $ball = null;

  $foreground.width(gameDef.courtWidth);
  $foreground.height(gameDef.courtHeight);

  new DiscoWall(gameDef, $disco);

  this.drawState = function(state) {
    state.paddles.forEach( function(paddle, i) {
      var $paddle = $paddles[i];
      if(!$paddle) {
        $paddles[i] = $paddle = $(document.createElement('div')).appendTo($foreground);
        $paddle.css({
          position: 'absolute'
        });

        var $paddleInner = $(document.createElement('div')).appendTo($paddle),
            border = 1;
        $paddleInner.css({
          border: border + 'px solid #fff',
          width: gameDef.paddleWidth,
          height: gameDef.paddleHeight,
          backgroundColor: '#333',
          position: 'absolute',
          left: -gameDef.paddleWidth/2 - border,
          top: -gameDef.paddleHeight/2 - border
        });
      }

      var rotateTransform = 'rotate(' + (paddle.r * 180 / Math.PI) + 'deg)';
      $paddle.css({
        left: paddle.x * gameDef.scale,
        top:  paddle.y * gameDef.scale,
        '-webkit-transform': rotateTransform,
        '-moz-transform': rotateTransform
      });
    });

    if(!$ball) {
      $ball = $(document.createElement('div')).appendTo($foreground);
      $ball.css({
        position: 'absolute'
      });

      var $ballInner = $(document.createElement('div')).text('-').appendTo($ball);
      $ballInner.css({
        width: gameDef.ballRadius * 2,
        height: gameDef.ballRadius * 2,
        backgroundColor: '#333',
        position: 'absolute',
        left: -gameDef.ballRadius,
        top: -gameDef.ballRadius,
        borderRadius: gameDef.ballRadius,
        color: '#fff'
      });
    }
    $ball.css({
      left: state.ball.x * gameDef.scale,
      top:  state.ball.y * gameDef.scale
    });
    
    if(state.event) {
      $.each(state.event, function(i, event) {
        if(event.score && event.score.length == 2) {
          $score0.text(event.score[0]);
          $score1.text(event.score[1]);
        }
      });
    }
  };
}
