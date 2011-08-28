Paddle = function(world, length, thickness) {
  var bodyDef = new Box2D.Dynamics.b2BodyDef();
  bodyDef.type = Box2D.Dynamics.b2Body.b2_kinematicBody;
  bodyDef.position.Set(10,10);
  this.body = world.CreateBody(bodyDef);

  var fixtureDef = new Box2D.Dynamics.b2FixtureDef();
  fixtureDef.shape = new Box2D.Collision.Shapes.b2PolygonShape();
  fixtureDef.shape.SetAsBox(length || 1, thickness || .1);
  fixtureDef.density = 1.0;
  this.body.CreateFixture(fixtureDef);

  this.rotationTarget = null;
  
  this.touch0 = null;
  this.position0 = this.body.GetPosition().Copy();
  this.positionTarget = this.body.GetPosition().Copy();
};

Paddle.dRotationMax = 5 * Math.PI / 180;
Paddle.dPositionMax = .5;
Paddle.dTouchFactor = 20;
Paddle.fpsFactor = .7;

Paddle.prototype.getState = function() {
  var position = this.body.GetPosition();
  return {
    x: position.x,
    y: position.y,
    r: this.body.GetAngle()
  };
};

Paddle.prototype.setTouchPoints = function (points) {
  if(points) {
    var pt1 = points[0],
        pt2 = points[1],
        rads = Math.atan2( (pt2.y - pt1.y), (pt2.x - pt1.x) );

    this.rotationTarget = rads;
    
    var ptMid = new Box2D.Common.Math.b2Vec2(.5 * (pt2.x + pt1.x), .5 * (pt2.y + pt1.y));
    
    if(!this.touch0) { // it's a touchstart
      this.touch0 = ptMid.Copy();
      this.position0 = this.body.GetPosition().Copy();
    }
    
    var dTouch = new Box2D.Common.Math.b2Vec2(ptMid.x - this.touch0.x, ptMid.y - this.touch0.y);
    this.positionTarget.Set(this.position0.x + dTouch.x * Paddle.dTouchFactor, this.position0.y + dTouch.y * Paddle.dTouchFactor);
    
    // $('#rotation').text( Math.round(rads * 180 / Math.PI) );
  }
  else {
    // it's a touchend
    this.touch0 = null;
  }
};

Paddle.prototype.setTransform = function(x, y, rotation) {
  this.body.SetPosition( new Box2D.Common.Math.b2Vec2(x, y) );
  this.body.SetAngle(rotation);
  this.positionTarget.Set(x,y);
  this.rotationTarget = rotation;
};


Paddle.prototype.onFrame = function (t) {
  var rotationChanged = (this.rotationTarget != null) && this.updateRotation(t),
      positionChanged = this.updatePosition(t);
  
  return rotationChanged || positionChanged;
};

Paddle.prototype.updatePosition = function (t) {
  var position = this.body.GetPosition();
      dPosition = new Box2D.Common.Math.b2Vec2(this.positionTarget.x - position.x, this.positionTarget.y - position.y);
      
  if(dPosition.Length() > Paddle.dPositionMax) {
    dPosition.Multiply(Paddle.dPositionMax / dPosition.Length());
  }
  dPosition.Multiply(Paddle.fpsFactor / t);
  this.body.SetLinearVelocity(dPosition);
  return true;
};

Paddle.prototype.updateRotation = function (t) {
  var dRotation = this.rotationTarget - this.body.GetAngle(),
      dRotationAbs = Math.abs(dRotation);
    
  if(dRotationAbs < 0.01) {
    this.body.SetAngle(this.rotationTarget);
    // $('#rotation_speed').text('---');
    return false;
  }

  // $('#rotation_speed').text(dRotation);

  this.body.SetAwake(true);

  if(dRotationAbs >= .9*Math.PI) {
    this.body.SetAngle( this.body.GetAngle() + 2 * Math.PI * (dRotation > 0 ? 1 : -1) );
    dRotation = this.rotationTarget - this.body.GetAngle();
    dRotationAbs = Math.abs(dRotation);
  }

  if(dRotationAbs > Paddle.dRotationMax) {
    dRotation = Paddle.dRotationMax * dRotation / dRotationAbs;
  }
  this.body.SetAngularVelocity(Paddle.fpsFactor * dRotation / t);

  return true;
};
