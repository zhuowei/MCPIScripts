/*
A game of Connect 4, implemented with the NodeJS api.

Grid:
0123456
0123456
0123456
0123456
0123456
0123456
BBBBBBB
Where b is a button made of iron

Right click any button with a sword to drop a block. When one player gets 4 blocks in a row/column/diagonal, the game ends.

connect 4 blocks are animated by throwing sand/gravel down the playing field.
*/

var Minecraft = require("minecraft-pi");

// connection information to the Pi
var raspberryPiHost = "localhost";
var raspberryPiPort = "4711";
 
var GRID_HEIGHT = 6;
var GRID_WIDTH = 7;
// the bottom-left corner of the game board
var beginLoc = [0, 2, 0];
// the bottom-left corner of the control buttons
var controlsLoc = [0, 1, 0];

var mc;

var gameInProgress = true;

var ticksUntilCheckForWin = -1;

var currentPlayer = 0;

var field = new Array(GRID_WIDTH);

for (var x = 0; x < field.length; x++) {
	field[x] = new Array(GRID_HEIGHT);
	for (var y = 0; y < field[x].length; y++) {
		field[x][y] = -1;
	}
}

function resetField() {
	mc.setBlocks(beginLoc[0], beginLoc[1], beginLoc[2], beginLoc[0] + GRID_WIDTH - 1, beginLoc[1] + GRID_HEIGHT - 1, beginLoc[2], 0);
	mc.setBlocks(controlsLoc[0], controlsLoc[1], controlsLoc[2], controlsLoc[0] + GRID_WIDTH - 1, controlsLoc[1], controlsLoc[2], mc.blocks.IRON_BLOCK);
}

var hasRegisteredThiseffinhandler = false;

function runGameLoop() {

	if (ticksUntilCheckForWin > 0) {
		ticksUntilCheckForWin--;
	} else if (ticksUntilCheckForWin == 0) {
		var winCoords = checkForWin();
		if (winCoords != null) {
			gameInProgress = false;
			for (var i = 0; i < winCoords.length; i++) {
				mc.setBlock(beginLoc[0] + winCoords[i][0], beginLoc[1] + winCoords[i][1], beginLoc[2], mc.blocks.WOOL, mc.colors.RED);
			}
			mc.chat("Player " + currentPlayer + " won.");
			return;
		}
		currentPlayer = (currentPlayer + 1) % 2;
		ticksUntilCheckForWin = -1;
		mc.chat("Player " + currentPlayer + " it's now your turn!");
	} else {

		mc.eventsBlockHits(hasRegisteredThiseffinhandler? function() {}: handleEvents);
		hasRegisteredThiseffinhandler = true;
		return;
	}
	if (gameInProgress) setTimeout(runGameLoop, 400);
}

function handleEvents(eventStr) {


	var events = parseEvents(eventStr);

	if (events.length > 0) {
		for (var i = 0; i < events.length; i++) {
			var event = events[i];
			if (event.y != controlsLoc[1] || event.z != controlsLoc[2] || event.x < controlsLoc[0] || event.x >= controlsLoc[0] + GRID_WIDTH) {
				continue;
			}
			//console.log(event);
			var controlX = event.x - controlsLoc[0];
			var newBlockY = nextCoordInColumn(controlX);
			if (newBlockY == -1) {
				mc.chat("That column's full!")
				continue;
			}
			var newBlockX = controlX;
			field[newBlockX][newBlockY] = currentPlayer;
			mc.setBlock(beginLoc[0] + controlX, beginLoc[1] + GRID_HEIGHT, beginLoc[2], currentPlayer == 0? mc.blocks.SAND : mc.blocks.GRAVEL);
			mc.chat("Block placed!");
			ticksUntilCheckForWin = 3;
		}
		mc.eventsClear();
	}
	if (gameInProgress) setTimeout(runGameLoop, 400);
}

function nextCoordInColumn(x) {
	for (var y = 0; y < field[x].length; y++) {
		if (field[x][y] == -1) return y;
	}
	return -1;
}

function parseEvents(eventStr) {
	var eventsArr = eventStr.toString().split("|");
	var events = new Array(eventsArr.length);
	for (var i = 0; i < events.length; i++) {
		var breakYourHeart = eventsArr[i].split(",");
		events[i] = new BlockHitEvent(parseInt(breakYourHeart[0]), parseInt(breakYourHeart[1]),
			parseInt(breakYourHeart[2]), parseInt(breakYourHeart[3]), parseInt(breakYourHeart[4]));
	}
	return events;
}

function BlockHitEvent(x, y, z, face, entityId) {
	this.x = x;
	this.y = y;
	this.z = z;
	this.face = face;
	this.entityId = entityId;
}

function checkForWin() {
	var winCoords = new Array(4);
	for (var x = 0; x < field.length; x++) {
		for (var y = 0; y < field[x].length; y++) {
			if (field[x][y] == -1) continue;
			winCoords[0] = [x, y]
			var winUserId = field[x][y];
			//horizontal
			if (x < field.length - 3) {
				var isWin = true;
				for (var i = 1; i < 4; i++) {
					var v = field[x + i][y];
					if (v == -1 || v != winUserId) {
						isWin = false;
						break;
					} else {
						winCoords[i] = [x + i, y];
					}
				}
				if (isWin) return winCoords;
			}
			if (y < field[x].length - 3) {
				var isWin = true;
				for (var i = 1; i < 4; i++) {
					var v = field[x][y + i];
					if (v == -1 || v != winUserId) {
						isWin = false;
						break;
					} else {
						winCoords[i] = [x, y + i];
					}
				}
				if (isWin) return winCoords;
			}
			if (y < field[x].length - 3 && x < field.length - 3) {
				var isWin = true;
				for (var i = 1; i < 4; i++) {
					var v = field[x + i][y + i];
					if (v == -1 || v != winUserId) {
						isWin = false;
						break;
					} else {
						winCoords[i] = [x + i, y + i];
					}
				}
				if (isWin) return winCoords;
			}
			if (y < field[x].length - 3 && x >= 3) {
				var isWin = true;
				for (var i = 1; i < 4; i++) {
					var v = field[x - i][y + i];
					if (v == -1 || v != winUserId) {
						isWin = false;
						break;
					} else {
						winCoords[i] = [x - i, y + i];
					}
				}
				if (isWin) return winCoords;
			}
		}
	}
	return null;
}

function connectedHandler() {

	resetField();
	mc.chat("Player " + currentPlayer + " you start!");

	runGameLoop();
}

function connectToMinecraft() {
	mc = new Minecraft(raspberryPiHost, raspberryPiPort, connectedHandler);

}

connectToMinecraft()

