'use strict';

const steamUserInventory = require('steam-user-inventory');
let interval;

module.exports = function (data) {
	let deferred = Promise.defer();

	if (!data.user) {
		throw new TypeError('Please provide a user');
	}

	if (!data.item) {
		throw new TypeError('Please provide item to check');
	}

	data.game = data.game || '730/2/';

	function req() {
		return steamUserInventory(data.user, data.game).then(items => {
			return items.filter(item => item.id === data.item);
		});
	}

	function check() {
		return req().then(function (items) {
			if (items[0]) {
				clearInterval(interval);
				deferred.resolve(items[0]);
			}

			if (!items[0] && !data.interval) {
				deferred.reject(null);
			}
		});
	}

	check();
	if (data.interval) {
		interval = setInterval(check, data.interval);
	}

	deferred.promise.clear = function () {
		deferred.reject(null);
		clearInterval(interval);
	};

	return deferred.promise;
};
