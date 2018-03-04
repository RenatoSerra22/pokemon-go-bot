const utils = require('./utils');
const deg = 360 / (Math.PI * 2);
const R = 6378137; // Radius of earth in meters

function shift(coords, offsetX, offsetY) {
	//Coordinate offsets in radians
	dLat = offsetY / R
	dLon = offsetX / (R * Math.cos(Math.PI * coords.latitude / 180))


	return {
		latitude: coords.latitude + dLat * 180 / Math.PI,
		longitude: coords.longitude + dLon * 180 / Math.PI,
	};
}

function floor(coords, delta) {
	const deltaAngle = (delta / R) * deg;
	return {
		latitude: Math.floor(coords.latitude / deltaAngle) * deltaAngle,
		longitude: Math.floor(coords.longitude / deltaAngle) * deltaAngle,
	};
}

module.exports = {
	shift,
	floor
};