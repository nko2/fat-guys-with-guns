function GameLogic(gameDef) {
  this.gameDef = gameDef;
  this.world = new Box2D.Dynamics.b2World(new Box2D.Common.Math.b2Vec2(0, 10), true);
  
  // TEMP FLOOR
  var bodyDef = new Box2D.Dynamics.b2BodyDef();
  bodyDef.type = Box2D.Dynamics.b2Body.b2_kinematicBody;
  bodyDef.position.Set(0, this.gameDef.courtHeight / this.gameDef.scale);
  var floor = this.world.CreateBody(bodyDef);

  var fixtureDef = new Box2D.Dynamics.b2FixtureDef();
  fixtureDef.shape = new Box2D.Collision.Shapes.b2PolygonShape();
  fixtureDef.shape.SetAsBox(this.gameDef.courtWidth / this.gameDef.scale, 2);
  fixtureDef.density = 1.0;
  floor.CreateFixture(fixtureDef);
  // TEMP FLOOR END
  
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