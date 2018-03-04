function getReadableTime(date) {
	var d = new Date(date);
	var hours = ("0" + d.getHours()).slice(-2);
	var mins = ("0" + d.getMinutes()).slice(-2);
	return hours + ":" + mins;
}

function getTimeTimeNow() {
	return getReadableTime(Date.now());
}

module.exports = {
	getReadableTime,
	getTimeTimeNow
};