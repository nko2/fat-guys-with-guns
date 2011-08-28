function GameLogic(gameDef) {
  this.gameDef = gameDef;
  this.world = new Box2D.Dynamics.b2World(new Box2D.Common.Math.b2Vec2(0, 10), true);
  
  this.buildStaticBodies();
  this.ball = new Ball(this.world, 0.2);
  this.paddles = [
    new Paddle(this.world, 1, .1),
    new Paddle(this.world, 1, .1)
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
  this.world.Step(t, 10, 10);
  this.world.DrawDebugData();
  
  if(Math.random() < .04) {
    // console.log("B",this.ball.body.GetPosition().x,this.ball.body.GetPosition().y);
    // console.log("P",this.paddles[1].body.GetPosition().x,this.paddles[1].body.GetPosition().y);
  }
  
  return this.getState();
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
  var fixDef = new Box2D.Dynamics.b2FixtureDef, bodyDef = new Box2D.Dynamics.b2BodyDef, wallWidth = 60;
  bodyDef.type = Box2D.Dynamics.b2Body.b2_staticBody;
  fixDef.density = 1.0;
  fixDef.friction = 0.5;
  fixDef.restitution = 0.2;

  var s = this.gameDef.scale;
  var width = this.gameDef.courtWidth / s;
  var height = this.gameDef.courtHeight / s;
  var halfWidth = width / 2;
  var halfHeight = height / 2;
  var netHalfWidth = this.gameDef.net.width / s / 2;
  var netHalfHeight = this.gameDef.net.height / s / 2;


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

  // top
  fixDef.shape = new Box2D.Collision.Shapes.b2PolygonShape;
  fixDef.shape.SetAsBox(halfWidth+1, 1);
  bodyDef.position.Set(halfWidth, -1);
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
};