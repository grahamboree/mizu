/*jslint nomen: true, white: true */
/*global PS */

"use strict";

var width = 32,
	height = 32,

	damping = 0.025,
	disturbance = 1,
	displayingGridOne = true,
	grid1 = [],
	grid2 = [],

	enableRain = true,
	nextRaindropTime = 0,
	raindropInterval = 2500,
	raindropIntervalVariance = 250,

	//color1 = { r: 3, g: 54, b: 73 },
	color1 = { r: 0, g: 72, b: 83 },
	color2 = { r: 167, g: 219, b: 216 };

// Helper functions
function randomRange(start, end) { return start + Math.random() * (end - start); }
function lerp(start, end, t) { return start + t * (end - start); }
function clamp(val, min, max) { return Math.max(min, Math.min(max, val)); }
function lerpColor(startColor, endColor, t) {
	return {
		r: lerp(startColor.r, endColor.r, t),
		g: lerp(startColor.g, endColor.g, t),
		b: lerp(startColor.b, endColor.b, t)
	};
}

function disturb(x, y) {
	var grid = displayingGridOne ? grid1 : grid2;
	grid[x+1][y+1] = disturbance;
}

function displayGrid(grid) {
	var x,
		y,
		half = disturbance / 2,
		value;

	for (x = 0; x < width; ++x) {
		for (y = 0; y < height; ++y) {
			value = clamp(grid[x + 1][y + 1], -half, half) + half;
			value = clamp(2 * value - 1, 0, 1);

			PS.color(x, y, lerpColor(color1, color2, value));
			PS.radius(x, y, lerp(0, 50, value));
		}
	}
}

function update() {
	var dest = displayingGridOne ? grid2 : grid1,
		source = displayingGridOne ? grid1 : grid2,
		x,
		y,
		newValue;

	// Raindrops
	if (enableRain && PS.elapsed() > nextRaindropTime) {
		disturb(PS.random(width - 4) + 2, PS.random(height - 4) + 2);
		nextRaindropTime = PS.elapsed() + raindropInterval + randomRange(-1, 1) * raindropIntervalVariance;
		PS.audioPlay("fx_drip1");
	}

	// Update water.
	for (x = 1; x < width + 1; x += 1) {
		for (y = 1; y < height + 1; y += 1) {
			newValue = (
				  source[x-1][y]
				+ source[x+1][y]
				+ source[x][y+1]
				+ source[x][y-1]) / 2 - dest[x][y];
			dest[x][y] = newValue * (1 - damping);
		}
	}

	// Display water.
	displayGrid(dest);

	// Swap buffers.
	displayingGridOne = !displayingGridOne;
}

PS.init = function() {
	var x,
		y;

	// Preload audio
	PS.audioLoad("fx_drip1");
	PS.audioLoad("fx_drip2");

	PS.statusColor(color2);
	PS.statusText("水");
	PS.statusColor(0xffffff);

	PS.gridSize(width, height);
	PS.gridColor(color1);

	PS.border(PS.ALL, PS.ALL, 0);

	// Init grid buffers.
	for (x = 0; x < width + 2; ++x) {
		grid1.push([]);
		grid2.push([]);

		for (y = 0; y < height + 2; ++y) {
			grid1[x].push(0);
			grid2[x].push(0);
		}
	}

	PS.timerStart(2, update);
};

PS.enter = function(x, y) {
	disturb(x,y);
	if (PS.random(3) === 1) {
		PS.audioPlay("fx_drip2");
	}
};

PS.keyDown = function(key) {
	if (key === 114) {
		enableRain = !enableRain;
	}
};

PS.touch = function() { return; };
PS.release = function() { return; };
PS.exit = function() { return; };
PS.exitGrid = function() { return; };
PS.keyUp = function() { return; };
PS.swipe = function() { return; };
PS.input = function() { return; };

