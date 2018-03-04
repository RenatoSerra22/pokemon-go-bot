const whitelist = require('../../white-list'),
	utils = require('../utils');

function notifyUser(user, pokemon) {

	var notifiedUser = user.notifiedList.get(pokemon.id);
	var pokemonName = whitelist[pokemon.pokemonid];
	var fromLure = pokemon.isLure ? ' from a lure' : '';
	if (!notifiedUser && pokemonName) {
		setTimeout(() => {
			user.telegram.sendMessage('Hey bro, i found a: ' + pokemonName + fromLure, {
				disable_notification: false,
			});
			user.telegram.sendVenue(
				pokemon.latitude,
				pokemon.longitude,
				pokemonName,
				'Expires at: ' + utils.getReadableTime(pokemon.expiration), {
					disable_notification: true
				}
			)
		}, 100);

		user.notifiedList.set(pokemon.id, true);
	}

}

module.exports = {
	notifyUser
};