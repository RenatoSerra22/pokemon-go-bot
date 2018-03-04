# pgmap
Pokemon GO map, Pokevision style, just for you with a side of telegram bot!

[![Pokemon Go](http://www.pokemongo.com/static/assets/images/pokemon_go_logo.png)](http://www.pokemongo.com/static/assets/images/pokemon_go_logo.png)


# Requirements

* A valid Pokemon GO account, either via Google or [Pokemon Trainer Club](https://club.pokemon.com/us/pokemon-trainer-club/sign-up/?mo_ar=true)
* A [Mapbox](https://www.mapbox.com/) Account (free)
* Create a [Telegram](https://core.telegram.org/bots#botfather) bot a nd add the token to the config

# Installation

* copy `/config.js.sample` to `/config.js` and fill in the `login`, `leafletURL` and telegram parts
* `npm install`
* `npm run build`

Then `npm run start` and open [http://localhost:3000](http://localhost:3000) in your browser

# Telegram Bot:
You can intereact with a telegram bot, activate a search in a specific location (Current or other) and get notified if something in the white-list is found near the selected location, with a link to google maps location and expiration time:

[![Screen Shot 2016-11-07 at 11.45.44 AM.png](https://s18.postimg.org/ls9optcjd/Screen_Shot_2016_11_07_at_11_45_44_AM.png)](https://postimg.org/image/ggus53qgl/)

# Browser version:
You can use a browser version to visualize the search  in a selected area and see whats around and their expiration time embedded in the map

[![Screen Shot 2016-11-07 at 11.53.44 AM.png](https://s17.postimg.org/ghji2pfhb/Screen_Shot_2016_11_07_at_11_53_44_AM.png)](https://postimg.org/image/9r30t9sbf/)
