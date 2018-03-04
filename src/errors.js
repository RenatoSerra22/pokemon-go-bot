const utils = require('./utils');


function errorHandler(topic) {
	return (error) => {
		errorActions(error, topic)
	};
}

function errorActions(error, topic) {
	var time = utils.getTimeTimeNow();
	console.log('[e] ' + time + ` - ${topic}:`, error.stack || String(error));
}

module.exports = {
	errorHandler
};