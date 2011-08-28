function GameDef(tileSize, netWidth, scale) {
  function AABB(x, y, width, height) {
    this.left = this.minX = this.x = x;
    this.top = this.minY = this.y = y;
    this.right = this.maxX = x + width;
    this.bottom = this.maxY = y + height;
    this.width = width;
    this.height = height;
    this.center = {
      x: (this.left + this.right) / 2,
      y: (this.top + this.bottom) / 2
    };
  }

  AABB.prototype.contains = function(point) {
    return Math.max(this.left, Math.min(this.right, point.x)) == point.x &&
           Math.max(this.top, Math.min(this.bottom, point.y)) == point.y;
  };

  this.scale = scale;
  this.tileSize = tileSize;

  var radius = tileSize * 5,
      playerWidth = tileSize * 4,
      courtWidth = netWidth + 2 * playerWidth,
      courtHeight = radius,
      court = new AABB(0, 0, courtWidth, courtHeight),
      playerOne = new AABB(0, 0, playerWidth, courtHeight),
      aboveNet = new AABB(playerOne.right, 0, netWidth, 3*tileSize),
      net = new AABB(playerOne.right, aboveNet.bottom, netWidth, 2*tileSize),
      playerTwo = new AABB(net.right, 0, playerWidth, courtHeight);
  this.radius = radius;
  this.playerWidth = playerWidth;
  this.outerWidth = 2*radius + netWidth;
  this.courtWidth = courtWidth;
  this.courtHeight = courtHeight;
  this.court = court;
  this.playerOne = playerOne;
  this.aboveNet = aboveNet;
  this.net = net;
  this.playerTwo = playerTwo;
  
  this.servingPos = [
    {
      x: playerOne.center.x - 50,
      y: playerOne.center.y - 75,
    },
    {
      x: playerTwo.center.x + 50,
      y: playerTwo.center.y - 75,
    }
  ];

  this.paddleWidth = 100;
  this.paddleHeight = 10;
  this.ballRadius = 15;
}
exports.GameDef = new GameDef(100, 20, 30);
