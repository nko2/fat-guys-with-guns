function DiscoWall(gameDef, $container) {
  var colors = ['red','green','blue','yellow'],
      colorStops = [
        { r:1, g:0, b:0 },// Red
        { r:1, g:.6, b:0 },// Orange
        { r:1, g:1, b:0 },// Yellow
        { r:0, g:1, b:0 },// Green
        { r:0, g:0, b:1 }// Blue
      ],
      colorProgress = 0,
      intensity = .35,
      colorMatrix = [],
      tileSize = gameDef.tileSize,
      $tiles = [],
      _this = this;
  for (var k=0; k<2; k++) {
    $tiles[k] = [];
    colorMatrix[k] = [];
    for (var i=0; i<4; i++) {
      $tiles[k][i] = [];
      colorMatrix[k][i] = [];
      for (var j=0; j<5; j++) {
        var $div = $(document.createElement('div')).addClass('panel');
        $div.css({
          width: tileSize,
          height: tileSize,
          position: 'absolute',
          top: j * tileSize,
          left: k * gameDef.playerTwo.left +  i * tileSize
        });
        $container.append($div);
        $tiles[k][i][j] = $div;
        colorMatrix[k][i][j] = {};
      }
    }
  }
  
  this.updateMatrix = function() {
    var d = 0;
    for (var k=0; k<2; k++) {
      for (var i=0; i<4; i++) {
        for (var j=0; j<5; j++) {
          colorMatrix[k][i][j] = this.interpolateRGB( colorProgress + d);
          d += .08;
        }
      }
    }
  };

  this.refresh = function() {
    for (var k=0; k<2; k++) {
      for (var i=0; i<4; i++) {
        for (var j=0; j<5; j++) {
          $tiles[k][i][j].css({
            backgroundColor: colorMatrix[k][i][j]
          });
        }
      }
    }
  };
  
  var cI = { r:null, g:null, b:null };
  this.interpolateRGB = function(f) {
    var c1 = colorStops[Math.floor(f) % colorStops.length],
        c2 = colorStops[Math.floor(f+1) % colorStops.length];
    cI.r = c1.r + (c2.r - c1.r) * (f % 1);
    cI.g = c1.g + (c2.g - c1.g) * (f % 1);
    cI.b = c1.b + (c2.b - c1.b) * (f % 1);
    
    return 'rgb(' + Math.round(255*cI.r*intensity) + ',' + Math.round(255*cI.g*intensity) + ',' + Math.round(255*cI.b*intensity) + ')';
  };

  var intervalId = null,
      t0;
  this.makeItFun = function(durationInSeconds) {
    durationInSeconds = durationInSeconds || 3;
    if(intervalId != null) {
      return;
    }
    t0 = Date.now();
    var fps = 12;
    intensity = 1;
    intervalId = setInterval(function() {
      _this.updateMatrix();
      _this.refresh();
      colorProgress = (colorProgress + .3 * 12 / fps) % colorStops.length;
      
      if(Date.now() - t0 > durationInSeconds * 1000) {
        clearInterval(intervalId);
        intervalId = null;
        _this.dim();
      }
    }, 1000/fps);
  };
  
  this.dim = function(targetIntensity) {
    targetIntensity = targetIntensity == null ? 0.35 : targetIntensity;
    if(intervalId != null) {
      return;
    }
    t0 = Date.now();
    var fps = 12;
    intensity = 1;
    intervalId = setInterval(function() {
      _this.updateMatrix();
      _this.refresh();
      intensity -= .15;
      if(intensity <= targetIntensity) {
        clearInterval(intervalId);
        intervalId = null;
      }
    }, 1000/fps);
  };

  this.updateMatrix();
  this.refresh();

  window.disco = this;
}