var Box2D = require('./lib/Box2D.js').Box2D;
var io = require('socket.io').listen(3001);

var b2Vec2 = Box2D.Common.Math.b2Vec2,
    b2AABB = Box2D.Collision.b2AABB,
    b2BodyDef = Box2D.Dynamics.b2BodyDef,
    b2Body = Box2D.Dynamics.b2Body,
    b2FixtureDef = Box2D.Dynamics.b2FixtureDef,
    b2Fixture = Box2D.Dynamics.b2Fixture,
    b2World = Box2D.Dynamics.b2World,
    b2MassData = Box2D.Collision.Shapes.b2MassData,
    b2PolygonShape = Box2D.Collision.Shapes.b2PolygonShape,
    b2CircleShape = Box2D.Collision.Shapes.b2CircleShape;

io.sockets.on('connection', function (socket) {
  var world = new b2World(new b2Vec2(0, 10), true);
  var fixDef = new b2FixtureDef;
      fixDef.density = 1.0;
      fixDef.friction = 0.5;
      fixDef.restitution = 0.2;
  var bodyDef = new b2BodyDef;

  //create ground
  bodyDef.type = b2Body.b2_staticBody;
  fixDef.shape = new b2PolygonShape;
  fixDef.shape.SetAsBox(20, 2);
  bodyDef.position.Set(10, 400 / 30 + 1.8);
  world.CreateBody(bodyDef).CreateFixture(fixDef);
  bodyDef.position.Set(10, -1.8);
  world.CreateBody(bodyDef).CreateFixture(fixDef);
  fixDef.shape.SetAsBox(2, 14);
  bodyDef.position.Set(-1.8, 13);
  world.CreateBody(bodyDef).CreateFixture(fixDef);
  bodyDef.position.Set(21.8, 13);
  world.CreateBody(bodyDef).CreateFixture(fixDef);

  //create some objects
  bodyDef.type = b2Body.b2_dynamicBody;
  for(var i = 0; i < 3; ++i) {
    if(Math.random() > 0.5) {
       fixDef.shape = new b2PolygonShape;
       fixDef.shape.SetAsBox(
             Math.random() + 0.1 //half width
          ,  Math.random() + 0.1 //half height
       );
    } else {
       fixDef.shape = new b2CircleShape(
          Math.random() + 0.1 //radius
       );
    }
    bodyDef.position.x = Math.random() * 10;
    bodyDef.position.y = Math.random() * 10;
    world.CreateBody(bodyDef).CreateFixture(fixDef);
  }

  setInterval(update, 1000 / 30);

  function update() {
    var data = {bodies:[]};
    world.Step(1 / 30, 10, 10);
    for (var b = world.m_bodyList; b; b = b.m_next) {
      data.bodies.push(b);
    }
    socket.volatile.emit('update', data);
    world.ClearForces();
  }
});

