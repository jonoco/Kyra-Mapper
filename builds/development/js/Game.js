
BasicGame.Game = function (game) {

  //  When a State is added to Phaser it automatically has the following properties set on it, even if they already exist:

  this.game;      //  a reference to the currently running game (Phaser.Game)
  this.add;       //  used to add sprites, text, groups, etc (Phaser.GameObjectFactory)
  this.camera;    //  a reference to the game camera (Phaser.Camera)
  this.cache;     //  the game cache (Phaser.Cache)
  this.input;     //  the global input manager. You can access this.input.keyboard, this.input.mouse, as well from it. (Phaser.Input)
  this.load;      //  for preloading assets (Phaser.Loader)
  this.math;      //  lots of useful common math operations (Phaser.Math)
  this.sound;     //  the sound manager - add a sound, play one, set-up markers, etc (Phaser.SoundManager)
  this.stage;     //  the game stage (Phaser.Stage)
  this.time;      //  the clock (Phaser.Time)
  this.tweens;    //  the tween manager (Phaser.TweenManager)
  this.state;     //  the state manager (Phaser.StateManager)
  this.world;     //  the game world (Phaser.World)
  this.particles; //  the particle manager (Phaser.Particles)
  this.physics;   //  the physics manager (Phaser.Physics)
  this.rnd;       //  the repeatable random number generator (Phaser.RandomDataGenerator)

  //  You can use any of these from any function within this State.
  //  But do consider them as being 'reserved words', i.e. don't create a property for your own game called "world" or you'll over-write the world reference.

  // tilemap variables
  this.tileSize = 8;
  this.tileX = 120;
  this.tileY = 75;
  this.map = null;
  this.marker = null;
  this.cursors = null;
  this.currentTile = 0;
  this.layer = null;
  this.remove = false;
  this.modTiles = true;
  this.updateMarkerIndex;

  // grid variables
  this.grid;
  this.finder;
  this.path;

  // sprite variabels
  this.sprite = null;
  this.tween = null;

};

BasicGame.Game.prototype = {

  create: function () {

    this.stage.backgroundColor = '#2d2d2d';
    
    this.game.add.image( 23, 24, 'room01').scale.setTo(0.5);
    this.game.add.image( 0, 0, 'gui').scale.setTo(0.5);

    this.createMap();
    this.createInputs();
    this.createGrid();

  },

  update: function () {
    //this.game.physics.arcade.collide(this.sprite, this.layer);
  },

  render: function () {

    this.game.debug.text('Removing tile (space): ' + this.remove, 16, 500);
    this.game.debug.text('Modifying tiles (1): ' + this.modTiles, 16, 525);
    this.game.debug.text('Sprite status (2): ' + this.sprite, 16, 550);
    this.game.debug.text('Current tile (3): ' + this.currentTile, 16, 575);
    this.game.debug.text('Export Grid (4): ', 400, 500);
    this.game.debug.text('Import Grid (5): ', 400, 525);
    //this.sprite ? this.game.debug.body(this.sprite):null;
  
  },

  quitGame: function (pointer) {

    //  Here you should destroy anything you no longer need.
    //  Stop music, delete sprites, purge caches, free resources, all that good stuff.

    //  Then let's go back to the main menu.
    this.state.start('MainMenu');

  },

  createGrid: function() {

    this.grid = new PF.Grid(this.tileX, this.tileY);
    this.finder = new PF.AStarFinder({
      allowDiagonal: true,
      dontCrossCorners: true
    });
    
  },

  createInputs: function () {
    
    cursors = this.game.input.keyboard.createCursorKeys();
    this.game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR).onDown.add(this.keySwitch, this);
    this.game.input.keyboard.addKey(Phaser.Keyboard.ONE).onDown.add(this.keySwitch, this);
    this.game.input.keyboard.addKey(Phaser.Keyboard.TWO).onDown.add(this.keySwitch, this);
    this.game.input.keyboard.addKey(Phaser.Keyboard.THREE).onDown.add(this.keySwitch, this);
    this.game.input.keyboard.addKey(Phaser.Keyboard.FOUR).onDown.add(this.keySwitch, this);
    this.game.input.keyboard.addKey(Phaser.Keyboard.FIVE).onDown.add(this.keySwitch, this);
    this.game.input.addMoveCallback(this.updateMarker, this); 
    this.game.input.onTap.add(this.findWay, this);
  },

  createMap: function () {

    this.map = this.game.add.tilemap();
    this.map.tileWidth = this.tileSize;
    this.map.tileHeight = this.tileSize;
    this.map.addTilesetImage('paths');
    //this.map.setCollisionBetween('0,2');

    this.layer = this.map.create('level1', this.tileX, this.tileY, this.tileSize, this.tileSize);
    //this.layer.resizeWorld();

    marker = this.game.add.graphics();
    marker.lineStyle(2, 0x000000, 1);
    marker.drawRect(0, 0, this.tileSize, this.tileSize);

    // tile selection palette
    this.createTileSelector();
    
  },

  keySwitch: function (key) {

    switch (key.keyCode)
    {
      case Phaser.Keyboard.ONE:
        this.modTiles = !this.modTiles;
        break;  

      case Phaser.Keyboard.TWO:
        this.toggleSprite();
        break;

      case Phaser.Keyboard.THREE:
        this.currentTile++;
        this.currentTile = this.currentTile % 3;
        break;

      case Phaser.Keyboard.FOUR:
        this.exportGrid();
        break;

      case Phaser.Keyboard.FIVE:
        this.importGrid();
        break;

      case Phaser.Keyboard.SPACEBAR:
        this.remove = !this.remove;
        break;  
    }
  },

  exportGrid: function () {
    
    // stringify grid
    // output json to copy manually
    var myJson = JSON.stringify(this.grid.nodes);
    console.dir(myJson);

  },

  importGrid: function () {

    console.log('loading grid');
    var gridJson = this.game.cache.getJSON('json_room01');
    //console.log(gridJson);
    this.grid.nodes = gridJson;

    for (var i = 0; i < gridJson.length ; i++) {
      for ( var j = 0 ; j < gridJson[i].length ; j++ ) {
        if (!gridJson[i][j].walkable) {
          this.addTile(gridJson[i][j].x, gridJson[i][j].y);  
        }
      }
    }

  },

  findWay: function (pointer) {

    var grid = this.grid.clone();
    var startX = this.layer.getTileX(this.sprite.position.x);
    var startY = this.layer.getTileY(this.sprite.position.y);
    var endX = this.layer.getTileX(pointer.x);
    var endY = this.layer.getTileY(pointer.y);

    //console.log( startX, startY, endX, endY );

    this.path = this.finder.findPath(startX, startY, endX, endY, grid);
    var newPath = PF.Util.smoothenPath(this.grid, this.path);
    console.log(newPath);
    this.addTween(newPath);
    //this.addTween(this.path);
    this.path = null;

  },

  toggleSprite: function () {

    if (this.sprite) {

      this.sprite.destroy();
      this.sprite = null;

    } else {

      this.sprite = this.game.add.sprite(128, 128, 'sprite');
      this.sprite.anchor = {x:0.45, y:0.8};
      this.game.physics.enable(this.sprite);
      
    }

  },

  addTween: function (path) {
    
    // example of tweening function with constant velocity
    // and basic smoothing
    console.log(path);
    //this.tween ? this.tween.stop():null;
    this.tween = this.game.add.tween(this.sprite);
    
    var prevX = this.sprite.position.x/this.tileSize;
    var prevY = this.sprite.position.y/this.tileSize;

    for ( var i = 0; i < path.length ; i++ ) {
      var x = path[i][0];
      var y = path[i][1];
  
      var dist = this.game.physics.arcade.distanceBetween({x: x, y: y}, {x: prevX, y: prevY});
      //console.log(dist);

      if (i == path.length - 1) {
        this.tween.to( { x: x*this.tileSize, y: y*this.tileSize }, dist*100);    
      } else if (x == prevX || y == prevY && i%3) {
        // pass
      }  else {
        this.tween.to( { x: x*this.tileSize, y: y*this.tileSize }, dist*100);    
        prevX = x;
        prevY = y;
      }
    }
    
    
    this.tween.start();
    
  },

  updateMarker: function () {
    
    if (this.modTiles) {

      marker.x = this.layer.getTileX(this.game.input.activePointer.worldX) * this.tileSize;
      marker.y = this.layer.getTileY(this.game.input.activePointer.worldY) * this.tileSize;
      var tiles = this.layer.getTiles(marker.x*this.tileSize, marker.y*this.tileSize, this.tileSize, this.tileSize);

      if (this.game.input.mousePointer.isDown) {
        
        if (this.remove) {

          this.removeTile(marker.x/this.tileSize, marker.y/this.tileSize);          

        } else {

          this.addTile(marker.x/this.tileSize, marker.y/this.tileSize);

        }
      }
    }
    
  },

  addTile: function (x, y) {

    // add tile in tile units

    var tile = this.map.putTile(this.currentTile, x, y, this.layer);
    tile.alpha = 0.5;
    this.grid.setWalkableAt(x, y, false);

  },

  removeTile: function (x, y) {

    // remove tile in tile units

    this.map.removeTile( x, y );  
    this.grid.setWalkableAt( x, y, true );

  },

  pickTile: function (sprite, pointer) {

    this.currentTile = this.game.math.snapToFloor(pointer.x, this.tileSize) / this.tileSize;

  },

  createTileSelector: function () {

    //  Our tile selection window
    var tileSelector = this.game.add.group();

    var tileSelectorBackground = this.game.make.graphics();
    tileSelectorBackground.beginFill(0x000000, 0.5);
    tileSelectorBackground.drawRect(0, 0, 24, 10);
    tileSelectorBackground.endFill();

    tileSelector.add(tileSelectorBackground);

    var tileStrip = tileSelector.create(1, 1, 'paths');
    tileStrip.inputEnabled = true;
    tileStrip.events.onInputDown.add(this.pickTile, this);

    //  Our painting marker
    marker = this.game.add.graphics();
    marker.lineStyle(2, 0xFF0000, 1);
    marker.drawRect(0, 0, 8, 8);

  }

};
