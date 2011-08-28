var Box2D = require('./Box2D.min.js').Box2D;
var Ball = require('./ball.js').Ball;
var Paddle = require('./paddle.js').Paddle;

function GameLogic(gameDef) {
  this.score = [0,0];
  this.state = null;
  
  this.gameDef = gameDef;
  this.world = new Box2D.Dynamics.b2World(new Box2D.Common.Math.b2Vec2(0, 10), true);
  
  this.arena = new Arena(this.gameDef, this.world);
  this.ball = new Ball(this.world, gameDef);
  this.paddles = [
    new Paddle(this.world, .5 * gameDef.paddleWidth / gameDef.scale, .5 * gameDef.paddleHeight / gameDef.scale),
    new Paddle(this.world, .5 * gameDef.paddleWidth / gameDef.scale, .5 * gameDef.paddleHeight / gameDef.scale)
  ];
  
  this.startNewGame();
  
  var listener = new Box2D.Dynamics.b2ContactListener(),
      _this = this;
  listener.BeginContact = function(contact) {
    var isFloor = contact.m_fixtureA.m_body == _this.arena.floor || contact.m_fixtureB.m_body == _this.arena.floor;
    if(isFloor) {
      var ballPos = _this.ball.body.GetPosition().Copy();
      ballPos.Multiply(_this.gameDef.scale);
      
      var playerNum = null;
      if( _this.gameDef.playerOne.contains(ballPos) ) {
        playerNum = GameLogic.PLAYER_2;
      }
      else if( _this.gameDef.playerTwo.contains(ballPos) ) {
        playerNum = GameLogic.PLAYER_1;
      }
      // if by now playerNum is still null, we have a bug
      _this.pointScored(playerNum, GameEvent.TOUCHED_FLOOR);
    }
  };
  this.world.SetContactListener(listener);
}

function GameEvent() {}
GameEvent.TOUCHED_FLOOR = "The ball touched the floor.";

function GameState() {}
GameState.IN_PLAY = {};
GameState.SERVING = {};

GameLogic.PLAYER_1 = 0;
GameLogic.PLAYER_2 = 1;

GameLogic.prototype.pointScored = function(playerNum, reason) {
  this.score[playerNum]++;
  this.enterServeMode(playerNum);
  console.log("Player " + (playerNum + 1) + " scores, because " + reason);
};

// STATE
GameLogic.prototype.getState = function() {
  return {
    paddles: this.paddles.map( function(paddle) { return paddle.getState(); } ),
    ball: this.ball.getState()
  };
};
GameLogic.prototype.over = function(){
    return false;
};

// INPUTS
GameLogic.prototype.setTouchPoints = function(ctrlIndex, points) {
  this.paddles[ctrlIndex].setTouchPoints(points);
};
GameLogic.prototype.doubleTouch = function(ctrlIndex) {
  if(this.state == GameState.SERVING && this.state.who == ctrlIndex) {
    this.enterPlayMode();
  }
};

// MODES
GameLogic.prototype.startNewGame = function() {
  this.reset();
  this.enterServeMode(null);
};
GameLogic.prototype.enterServeMode = function(playerNum) {
  this.state = GameState.SERVING;
  if(playerNum == null) {
    GameState.SERVING.who = Math.random() > .5 ? GameLogic.PLAYER_1 : GameLogic.PLAYER_2;
  }
  else {
    GameState.SERVING.who = playerNum;
  }
  
  var _this = this;
  setTimeout(function() {
    _this.enterPlayMode();
  }, 5000);
};
GameLogic.prototype.enterPlayMode = function() {
  this.state = GameState.IN_PLAY;
};

// PHYSICAL
GameLogic.prototype.step = function(t) {
  this.paddles.forEach( function(paddle) {
    paddle.onFrame(t);
  });
  
  this.ball.onFrame(t, this.state);
  this.world.Step(t, 10, 10);
  this.world.DrawDebugData();
  
  return this.getState();
};
GameLogic.prototype.reset = function() {
  var _this = this,
      scale = this.gameDef.scale;
  this.paddles.forEach( function(paddle, i) {
    var aabb = i == 0 ? _this.gameDef.playerOne : _this.gameDef.playerTwo;
    paddle.setTransform((aabb.center.x + 50 * (i == 0 ? -1 : 1) ) / scale, aabb.center.y / scale, (i == 0 ? 1 : -1) * Math.PI / 4);
  });
  
  this.ball.setTransform((this.gameDef.aboveNet.center.x - 20) / scale, this.gameDef.aboveNet.center.y / scale, 0);
  
  return this.getState();
};

exports.GameLogic = GameLogic;
