function Ball(world, radius) {
  var bodyDef = new Box2D.Dynamics.b2BodyDef();
  bodyDef.type = Box2D.Dynamics.b2Body.b2_dynamicBody;
  bodyDef.bullet = true;
  bodyDef.position.Set(5,5);
  this.body = world.CreateBody(bodyDef);

  var fixtureDef = new Box2D.Dynamics.b2FixtureDef();
  fixtureDef.shape = new Box2D.Collision.Shapes.b2CircleShape(radius);
  fixtureDef.density = 1.0;
  fixtureDef.restitution = .9;
  this.body.CreateFixture(fixtureDef);
}

Ball.prototype.getState = function() {
  Paddle.prototype.getState = function() {
    var position = this.body.GetPosition();
    return {
      x: position.x,
      y: position.y,
      r: this.body.GetAngle()
    };
  };
};

Ball.prototype.setTransform = function(x, y, rotation) {
  this.body.SetPosition( new Box2D.Common.Math.b2Vec2(x, y) );
  this.body.SetAngle(rotation);
};
