var Box2D = require('./Box2D.min.js').Box2D;
var Ball = require('./ball.js').Ball;
var Paddle = require('./paddle.js').Paddle;

function GameLogic(gameDef) {
  this.gameDef = gameDef;
  this.world = new Box2D.Dynamics.b2World(new Box2D.Common.Math.b2Vec2(0, 10), true);
  
  this.arena = new Arena(this.gameDef, this.world);
  this.ball = new Ball(this.world, gameDef.ballRadius / gameDef.scale);
  this.paddles = [
    new Paddle(this.world, .5 * gameDef.paddleWidth / gameDef.scale, .5 * gameDef.paddleHeight / gameDef.scale),
    new Paddle(this.world, .5 * gameDef.paddleWidth / gameDef.scale, .5 * gameDef.paddleHeight / gameDef.scale)
  ];
  
  this.reset();
  
  var listener = new Box2D.Dynamics.b2ContactListener(),
      _this = this;
  listener.BeginContact = function(contact) {
    var isFloor = contact.m_fixtureA.m_body == _this.arena.floor || contact.m_fixtureB.m_body == _this.arena.floor;
    if(isFloor) {
      var ballPos = _this.ball.body.GetPosition().Copy();
      ballPos.Multiply(_this.gameDef.scale);
      
      var playerNum = null;
      if( _this.gameDef.playerOne.contains(ballPos) ) {
        playerNum = 2;
      }
      else if( _this.gameDef.playerTwo.contains(ballPos) ) {
        playerNum = 1;
      }
      // if by now playerNum is still null, we have a bug
      _this.pointScored(playerNum, GameLogic.TOUCHED_FLOOR);
    }
  };
  this.world.SetContactListener(listener);
}

GameLogic.TOUCHED_FLOOR = "The ball touched the floor.";

GameLogic.prototype.pointScored = function(playerNum, reason) {
  console.log("Player " + playerNum + " scores, because " + reason);
};

GameLogic.prototype.getState = function() {
  return {
    paddles: this.paddles.map( function(paddle) { return paddle.getState(); } ),
    ball: this.ball.getState()
  };
};

GameLogic.prototype.setTouchPoints = function(ctrlIndex, points) {
  this.paddles[ctrlIndex].setTouchPoints(points);
};

GameLogic.prototype.step = function(t) {
  this.paddles.forEach( function(paddle) {
    paddle.onFrame(t);
  });
  this.ball.onFrame(t);
  this.world.Step(t, 10, 10);
  this.world.DrawDebugData();
  
  return this.getState();
};

GameLogic.prototype.over = function(){
    return false;
};

GameLogic.prototype.reset = function() {
  var _this = this,
      scale = this.gameDef.scale;
  this.paddles.forEach( function(paddle, i) {
    var aabb = i == 0 ? _this.gameDef.playerOne : _this.gameDef.playerTwo;
    paddle.setTransform(aabb.center.x / scale, aabb.center.y / scale, 0);
  });
  
  this.ball.setTransform((this.gameDef.aboveNet.center.x - 20) / scale, this.gameDef.aboveNet.center.y / scale, 0);
  
  return this.getState();
};

exports.GameLogic = GameLogic;
