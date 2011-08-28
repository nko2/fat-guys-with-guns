var Box2D = require('./Box2D.min.js').Box2D;
function Ball(world, gameDef) {
  this.gameDef = gameDef;
  
  var bodyDef = new Box2D.Dynamics.b2BodyDef();
  bodyDef.type = Box2D.Dynamics.b2Body.b2_dynamicBody;
  bodyDef.bullet = true;
  bodyDef.position.Set(5,5);
  this.body = world.CreateBody(bodyDef);

  var fixtureDef = new Box2D.Dynamics.b2FixtureDef();
  fixtureDef.shape = new Box2D.Collision.Shapes.b2CircleShape(gameDef.ballRadius / gameDef.scale);
  fixtureDef.density = 1.0;
  fixtureDef.restitution = 0;// Restitution will be dictated by the walls and paddles
  this.body.CreateFixture(fixtureDef);
}

Ball.vMax = 20;

Ball.prototype.getState = function() {
  var position = this.body.GetPosition();
  return {
    x: position.x,
    y: position.y,
    r: this.body.GetAngle()
  };
};

Ball.prototype.setTransform = function(x, y, rotation) {
  this.body.SetPosition( new Box2D.Common.Math.b2Vec2(x, y) );
  this.body.SetAngle(rotation);
};

Ball.prototype.onFrame = function(t, gameState) {
  if(gameState == GameState.IN_PLAY) {
    this.body.SetAwake(true);
    var v = this.body.GetLinearVelocity();
    if(v.Length() > Ball.vMax) {
      v.Multiply(Ball.vMax / v.Length());
    }
  }
  else if(gameState == GameState.SERVING) {
    this.body.SetPosition(Box2D.Common.Math.b2Math.MulFV(1/this.gameDef.scale, this.gameDef.servingPos[gameState.who]));
    this.body.SetAwake(false);
  }
  // this.gameState = gameState;
};
exports.Ball = Ball;
