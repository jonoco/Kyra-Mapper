
BasicGame.Preloader = function (game) {

	this.background = null;
	this.preloadBar = null;

	this.ready = false;

};

BasicGame.Preloader.prototype = {

	preload: function () {

		//	These are the assets we loaded in Boot.js
		//	A nice sparkly background and a loading progress bar
		this.background = this.add.sprite(0, 0, 'preloaderBackground');
		this.background.scale.setTo(2.5);

		//	Here we load the rest of the assets our game needs.
		//	As this is just a Project Template I've not provided these assets, swap them for your own.
		
		this.load.image('titlepage', 'assets/img/title.png');
		this.load.image('ground_1x1', 'assets/tiles/ground_1x1.png');
		this.load.image('paths', 'assets/tiles/pathing.png');
		this.load.image('sprite', 'assets/img/firstaid.png');
		this.load.image('gui', 'assets/img/gui.png');
		this.load.image('room', 'assets/screens/room04.png');
		this.load.json('json_room01', 'js/json/room01.json');
		//this.load.audio('titleMusic', ['assets/audio/01_introduction.m4a']);
		
		//	+ lots of other required assets here

	},

	create: function () {

		//	Once the load has finished we disable the crop because we're going to sit in the update loop for a short while as the music decodes
		//this.preloadBar.cropEnabled = false;

	},

	update: function () {

		//	You don't actually need to do this, but I find it gives a much smoother game experience.
		//	Basically it will wait for our audio file to be decoded before proceeding to the MainMenu.
		//	You can jump right into the menu if you want and still play the music, but you'll have a few
		//	seconds of delay while the mp3 decodes - so if you need your music to be in-sync with your menu
		//	it's best to wait for it to decode here first, then carry on.
		
		//	If you don't have any music in your game then put the game.state.start line into the create function and delete
		//	the update function completely.
		
		this.ready = true;
		this.state.start('Game');

	}

};
