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
  
  this.scale = scale;

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
  this.courtWidth = courtWidth;
  this.courtHeight = courtHeight;
  this.court = court;
  this.playerOne = playerOne;
  this.aboveNet = aboveNet;
  this.net = net;
  this.playerTwo = playerTwo;
  this.scale = scale;
  
  this.paddleWidth = 100;
  this.paddleHeight = 10;
  this.ballRadius = 10;
}
exports.GameDef = new GameDef(100, 20, 30);
