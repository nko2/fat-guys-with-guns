function GameView(gameDef, $container) {
  var $foreground = $container.find('.foreground');
      $paddles = [],
      $ball = null;
        
  this.drawState = function(state) {
    state.paddles.forEach( function(paddle, i) {
      var $paddle = $paddles[i];
      if(!$paddle) {
        $paddles[i] = $paddle = $(document.createElement('div')).appendTo($foreground);
        $paddle.css({
          position: 'absolute'
        });
        
        var $paddleInner = $(document.createElement('div')).appendTo($paddle);
        $paddleInner.css({
          width: gameDef.paddleWidth,
          height: gameDef.paddleHeight,
          backgroundColor: '#333',
          position: 'absolute',
          left: -gameDef.paddleWidth/2,
          top: -gameDef.paddleHeight/2
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
      
      var $ballInner = $(document.createElement('div')).appendTo($ball);
      $ballInner.css({
        width: gameDef.ballRadius * 2,
        height: gameDef.ballRadius * 2,
        backgroundColor: '#333',
        position: 'absolute',
        left: -gameDef.ballRadius,
        top: -gameDef.ballRadius,
        borderRadius: gameDef.ballRadius
      });
    }
    $ball.css({
      left: state.ball.x * gameDef.scale,
      top:  state.ball.y * gameDef.scale
    });
  };
}
