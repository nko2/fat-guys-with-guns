var Box2D = require('./Box2D.min.js').Box2D;

function GameLogic(gameDef) {
  this.gameDef = gameDef;
  this.world = new Box2D.Dynamics.b2World(new Box2D.Common.Math.b2Vec2(0, 10), true);
  
  this.buildStaticBodies();
  this.ball = new Ball(this.world, 0.4);
  this.paddles = [
    new Paddle(this.world, 1.6, .15),
    new Paddle(this.world, 1.6, .15)
  ];
  
  this.reset();
}

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
  
  this.ball.setTransform(this.gameDef.aboveNet.center.x / scale, this.gameDef.aboveNet.center.y / scale, 0);
  
  return this.getState();
};

GameLogic.prototype.buildStaticBodies = function() {
  var fixDef = new Box2D.Dynamics.b2FixtureDef, bodyDef = new Box2D.Dynamics.b2BodyDef;
  bodyDef.type = Box2D.Dynamics.b2Body.b2_staticBody;
  fixDef.density = 1.0;
  fixDef.friction = 0.5;
  fixDef.restitution = 0.8;

  var s = this.gameDef.scale;
  var width = this.gameDef.courtWidth / s;
  var height = this.gameDef.courtHeight / s;
  var halfWidth = width / 2;
  var halfHeight = height / 2;
  var netHalfWidth = this.gameDef.net.width / s / 2;
  var netHalfHeight = this.gameDef.net.height / s / 2;
  var radius = this.gameDef.radius / s;


  // left
  fixDef.shape = new Box2D.Collision.Shapes.b2PolygonShape;
  fixDef.shape.SetAsBox(1, halfHeight+1);
  bodyDef.position.Set(-1, halfHeight);
  this.world.CreateBody(bodyDef).CreateFixture(fixDef);

  // right
  fixDef.shape = new Box2D.Collision.Shapes.b2PolygonShape;
  fixDef.shape.SetAsBox(1, halfHeight+1);
  bodyDef.position.Set(width+1, halfHeight);
  this.world.CreateBody(bodyDef).CreateFixture(fixDef);

  // floor
  fixDef.shape = new Box2D.Collision.Shapes.b2PolygonShape;
  fixDef.shape.SetAsBox(halfWidth+1, 1);
  bodyDef.position.Set(halfWidth, height+1);
  this.world.CreateBody(bodyDef).CreateFixture(fixDef);

  //net
  fixDef.shape = new Box2D.Collision.Shapes.b2PolygonShape;
  fixDef.shape.SetAsBox(netHalfWidth, netHalfHeight);
  bodyDef.position.Set(halfWidth, height - netHalfHeight);
  this.world.CreateBody(bodyDef).CreateFixture(fixDef);

  // Math.acos(4.0/5.0) = 0.6435011087932844
  // Math.PI/2 = 1.5707963267948966
  // (1.5707963267948966 - 0.6435011087932843) = 0.9272952180016123
  var step = 2 * 0.9272952180016123 / 5;

  for (var i=0; i<6; i++) {
    var angle = 0.6435011087932844 + step * i;
    var cos = Math.cos(angle);
    var sin = Math.sin(angle);
    var x = cos * (radius+1);
    var y = sin * (radius+1);
    fixDef.shape = new Box2D.Collision.Shapes.b2PolygonShape;
    fixDef.shape.SetAsBox(0.30909840600053745 * (radius+1), 1);
    bodyDef.position.Set(halfWidth + x, height - y);
    bodyDef.angle = angle * -1 + 1.5707963267948966;
    this.world.CreateBody(bodyDef).CreateFixture(fixDef);
  }
};
exports.GameLogic = GameLogic;
