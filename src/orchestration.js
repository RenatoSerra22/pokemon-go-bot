const crawl = require('./crawl'),
    errors = require('./errors'),
    config = require('../config'),
    pokemongo = require('pokemon-go-node-api'),
    Grid = require('./grid'),
    it = require('iterator-tools'),
    coordinates = require('./coordinates'),
    notify = require('./telegram/notify');


const step = 100; // consider each heartbeat returns pokemons in a 100 meters square.

function changeLocation(account, location, user) {
    var socket = user.socket;
    if (socket) {
        socket.emit('newLocation', location);
    }

    crawl(account, location)
        .then((newPokemons) => {
            for (const pokemon of newPokemons) {
                if (socket) {
                    emitPokemon(socket, pokemon);
                } else {
                    notify.notifyUser(user, pokemon);
                }
            }
        })
        .catch(errors.errorHandler('Crawling error'));
}

function emitPokemon(socket, pokemon) {
    if (!pokemon.pokemonid) throw new Error('Tried to send an invalid pokemon');
    socket.emit('newPokemon', pokemon);
}

function getActivePointOfInterests(pointsOfInterest) {
    return it.map(
        it.filter(
            pointsOfInterest.entries(),
            ([id, poi]) => {
                return true;
            }
        ),
        (entry) => entry[1]
    );
}

// Find next move, either a ping from the user or around current ping.
function moveNext(account, user) {

    let minPoi = null;
    let gridTotalSize = config.gridSize;
    let gridBy = Math.sqrt(config.gridSize);
    let initDistFromCenter = Math.floor(gridBy / 2);

    for (const poi of getActivePointOfInterests(user.pointsOfInterest)) {
        if (!minPoi || poi.index < minPoi.index) {
            minPoi = poi;
        }
    }

    if (minPoi) {
        let location;
        // This means all poi have an index of configurable gridTotalSize, so reset everything to 0
        if (minPoi.index > gridTotalSize) {
            for (const poi of getActivePointOfInterests(user.pointsOfInterest)) {
                poi.index = 0;
            }
        }

        if (minPoi.index === 0) {
            // Start with the actual location
            location = minPoi.location;
        } else {
            const gridPos = (minPoi.index - 1) % gridTotalSize,
                x = -step * initDistFromCenter + (Math.floor(gridPos / gridBy) * step),
                y = -step * initDistFromCenter + (gridPos % gridBy * step);

            location = coordinates.shift(
                minPoi.location,
                x,
                y
            );
        }

        minPoi.index += 1;
        changeLocation(account, location, user);
    }
}

function login(allAccountsConfig, currentUser, relog) {
    // Initial position
    var location = {
        latitude: config.initialposition.latitude,
        longitude: config.initialposition.longitude,
        altitude: 0
    };

    Promise.all(allAccountsConfig.map(({
            username,
            password,
            provider
        }) => {
            return new Promise((resolve, reject) => {
                const account = new pokemongo.Pokeio();
                account.init(username, password, {
                    type: 'coords',
                    coords: location
                }, provider, function(error) {
                    if (error) return reject(new Error(`Unable to login with username ${username}`, error));
                    resolve(account);
                });
            });
        })).then((accounts) => {
            if (relog) {
                for (const interval of currentUser.intervals) {
                    clearInterval(interval);
                }
                currentUser.intervals = [];
            }
            for (const account of accounts) {
                var interval = setInterval(function() {
                    moveNext(account, currentUser);
                }, config.moveInterval + 500);

                currentUser.intervals.push(interval);
            }
        }, errors.errorHandler('Login error'))
        .catch(errors.errorHandler('Unexpected error'));
}

module.exports = {
    changeLocation,
    emitPokemon,
    getActivePointOfInterests,
    moveNext,
    login
};