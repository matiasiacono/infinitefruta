﻿	var g_SoundManager = null;
	var g_gameSpeed = 1;
	var g_speedDivisors = [50, 25, 12.5, 10, 5];
	var g_gameLevel = -1;
	var g_fuel = 0;
	var g_goalAreaEnabled = true;
	var g_goalAreaX = -1;
	var g_goalAreaY = 3;
	var g_fuelsToGoal = 0;
	var g_canistersCollected = 0;
	var g_levelObjects = new Array();
	var g_maxFuel = 100;
	var g_fuelLossTime = 0;
	var g_speedGainTime = 0;
	var g_enviroment = 0;
	var g_gameStarting = false;
function Game() {
	var tileGrid = null;
	var backBufferCanvas = null;
	var backBuffer = null;
	var context = null;
	var lastFrame = null;
	var self = this;
	var objectToBeAdded = new Array();
	var objectToDeleted = new Array();
	
	this.sortObjects = function() {
		gameObjects.sort(function(a,b){return a.zOrder - b.zOrder;});
    }
	this.resources = null;
	this.startGame = function() {
		// calculate the time since the last frame
		canvas = document.getElementById('canvas');
	
		backBufferCanvas = document.createElement('canvas');
		backBufferCanvas.width = canvas.width;
		backBufferCanvas.height = canvas.height;
		backBuffer = backBufferCanvas.getContext('2d');

		context = canvas.getContext('2d');
		gameObjects = new Array();
		loadResources();
	};
	
	this.init = function() {
		add(new Background());
		add(new Command());
		tileGrid = new TileGrid();
		add(tileGrid);
		add(new MousePointer());
		levelUp();
	}
	
	function loadResources() {
		var loader = new PxLoader(); 
		var tempCtx = document.getElementById("canvas").getContext("2d");
	
		loader.addCompletionListener(function () {
			//tempCtx = null;
			self.init();
			setInterval(runGame, 1000 / 30);
		});
		
		loader.addProgressListener(function (e) {
			tempCtx.fillStyle = 'rgb(0,0,0)';
			tempCtx.fillRect(0, 0, 640, 480);
			
			tempCtx.fillStyle = '#FFFFFF';
			tempCtx.font = 'bold 30px arial';
			tempCtx.fillText(e.completedCount + ' / ' + e.totalCount, 300, 220);
		}); 
	
		self.resources = {
			splash: loader.addImage('resources/portada-final.png'),
			car: loader.addImage('resources/cars.png'),
			tileSheet: loader.addImage('resources/ruta85.png'),
			fondomenu: loader.addImage('resources/foondomenu.png'),
			background: loader.addImage('resources/fondogame.png'),
			common: loader.addImage('resources/luces.png'),
			pointer: loader.addImage('resources/pointer.png'),
			//explotion: loader.addSound('hola','resources/sounds/booom.ogg')
		};

		/*Modo de uso en los lugares de los sonidos: g_SoundManager["credits"].play();*/
		new SManager().startupSoundManager(
            [{ name: 'crash', src: 'resources/Sounds/crash.ogg' },
             { name: 'music', src: 'resources/Sounds/gameMusic.mp3' }         
            ]);
		
		loader.start();
	}
	
	
	function SManager() {
		this.listSound = null;

		this.startupSoundManager = function (sounds) {
			g_SoundManager = this;

			this.listSound = new Array();

			for (var i = 0; i < sounds.length; i++) {
				var thisAudio = new Audio;
				this[sounds[i].name] = thisAudio;
				this.listSound.push(sounds[i].name);

				thisAudio.src = sounds[i].src;
			}

			return this;
		}
	}
	

	
	function add(obj) {
		objectToBeAdded.push(obj);
	}
	
	function remove(obj) {
		objectToDeleted.push(obj);
	}
	
	function processAll() {
		//Added
		if (objectToBeAdded.length != 0) {
			for (var x = 0; x < objectToBeAdded.length; ++x) {
				gameObjects.push(objectToBeAdded[x]);
				objectToBeAdded[x].init();
			}
			objectToBeAdded.splice(0, objectToBeAdded.length);//.clear();
		}
		
		//Remove
		if (objectToDeleted.length != 0)
		{
			for (var x = 0; x < objectToDeleted.length; ++x) {
				gameObjects.removeObject(objectToDeleted[x]);
			}
			objectToDeleted.splice(0, objectToDeleted.length);//.clear();
		}
		self.sortObjects();
	}
	
	function runGame() {
		var thisFrame = new Date().getTime();
		var delta = (thisFrame - this.lastFrame) / 1000;
		this.lastFrame = thisFrame;
		//background colour
			backBuffer.fillStyle = "rgb(255,255,255)";
			backBuffer.fillRect(0, 0, canvas.width, canvas.height);
			for (var i = 0; i < gameObjects.length; i++) {
				//try {
					//Update game object
					gameObjects[i].update(delta);
					//if object is drawable, draw
					if (gameObjects[i].draw && gameObjects[i].visible) {
						gameObjects[i].draw(backBuffer);
				}
			//} catch (e) {
				//just swalow the exception
				//don't in real life
			//}
		}
		//Loop finished, draw everything
        context.drawImage(backBufferCanvas, 0, 0);
		
		processAll();
	};
	
	
	this.prepareLevelUp = function() {
		//TODO: Change victory sound
		
		g_SoundManager["crash"].play();
		g_enviroment++;
	}
	function levelUp() {
		//reset game divisors
		g_canistersCollected = 0;
		g_gameStarting = true;
		g_gameLevel++;
		g_fuel = g_maxFuel;
		g_gameSpeed = 50 / g_speedDivisors[g_gameLevel];
		levels = 
			[
				{	
					fuelLossTime: 10000,
					speedGainTime: 5000,
					fuelsToGoal: 5,
					levelObjects: [1,2,3,4,5,6,1,2,3,4,5,6,7,8,5,5,1,2,3,3,5,6,7,8,1,0]
				},
				{	
					fuelLossTime: 10000,
					speedGainTime: 5000,
					fuelsToGoal: 5,
					levelObjects: [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]
				}
			];
			
			g_fuelLossTime = levels[g_gameLevel].fuelLossTime;
			g_speedGainTime = levels[g_gameLevel].speedGainTime;
			g_fuelsToGoal = levels[g_gameLevel].fuelsToGoal;
			g_levelObjects = levels[g_gameLevel].levelObjects;
			tileGrid.loadLevelTiles();
	
	}
}

function getAlarmTime(ticks) {
	var thisFrame = new Date().getTime();
	var alarmTime = thisFrame + ticks;
	return alarmTime;
}

function isAlarmTime(alarmTime) {
	return alarmTime - new Date().getTime(); 
}

var g_game = new Game();
g_game.startGame();