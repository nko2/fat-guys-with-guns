if (process.getuid() === 0)
  require('fs').stat(__filename, function(err, stats) {
    if (err) return console.log(err)
     process.setuid(stats.uid);
});

var Box2D = require('./public/javascripts/Box2D.min.js').Box2D;
var io = require('socket.io').listen(3001);
io.set('log level', 1);

var b2Vec2 = Box2D.Common.Math.b2Vec2,
    b2AABB = Box2D.Collision.b2AABB,
    b2BodyDef = Box2D.Dynamics.b2BodyDef,
    b2Body = Box2D.Dynamics.b2Body,
    b2FixtureDef = Box2D.Dynamics.b2FixtureDef,
    b2Fixture = Box2D.Dynamics.b2Fixture,
    b2World = Box2D.Dynamics.b2World,
    b2MassData = Box2D.Collision.Shapes.b2MassData,
    b2Shape = Box2D.Collision.Shapes.b2Shape;
    b2PolygonShape = Box2D.Collision.Shapes.b2PolygonShape,
    b2CircleShape = Box2D.Collision.Shapes.b2CircleShape;

function buildWorld() {
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
  for(var i = 0; i < 6; ++i) {
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
    bodyDef.userData = i.toString();
    world.CreateBody(bodyDef).CreateFixture(fixDef);
  }
  return world;
}

function serializeWorld(world) {
  var data, body, shape;
  data = {
    bodies: []
  };
  for (var b = world.m_bodyList; b; b = b.m_next) {
    body = {
      id: b.m_userData,
      transform: b.m_xf,
      shapes: []
    }
    for (f = b.GetFixtureList(); f; f = f.m_next) {
      shape = f.GetShape();
      switch (shape.m_type) {
      case b2Shape.e_circleShape:
        {
          body.shapes.push({
            type: 'c',
            p: shape.m_p,
            radius: shape.m_radius
          });
        }
        break;
      case b2Shape.e_polygonShape:
        {
          body.shapes.push({
            type: 'p',
            vertices: shape.m_vertices
          });
        }
        break;
      case b2Shape.e_edgeShape:
        {
          body.shapes.push({
            type: 'e',
            v1: shape.m_v1,
            v2: shape.m_v2
          });
        }
        break;
      }
    }
    data.bodies.push(body);
  }
  return data;
}

io.sockets.on('connection', function (socket) {
  var world = buildWorld();
  socket.emit('world', serializeWorld(world));

  var intid = setInterval(update, 1000 / 24);

  function update() {
    var data = {};
    var isDone = true;
    world.Step(1 / 24, 6, 2);
    for (var b = world.m_bodyList; b; b = b.m_next) {
      if (b.m_userData && b.IsAwake() && b.IsActive()) {
        data[b.m_userData] = b.m_xf;
        isDone = false;
      }
    }
    socket.volatile.emit('update', data);
    if (isDone) clearInterval(intid);
    world.ClearForces();

  }
});

