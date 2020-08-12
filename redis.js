const redis = require("redis");

const options = {
	url: process.env.FLY_REDIS_CACHE_URL,
	db: 0
}

const redisClient = redis.createClient(options, {
	retry_strategy: (options) => {

		if (options.error && options.error.code === "ECONNREFUSED") {
			return new Error("The Redis server refused the connection");
		}

		if (options.total_retry_time > 1000 * 60 * 60) {
			return new Error("Redis retry time exhausted");
		}

		if (options.attempt > 10) {
			// End reconnecting with built in error
			return new Error("Redis too many attempts");
		}

		// reconnect after
		return 250;
	}
});

redisClient.on("connect", function(error) {
	console.log('REDIS connected');
});

redisClient.on("ready", function(error) {
	console.log('REDIS ready');
});

redisClient.on("error", function(error) {
	console.log('REDIS error');
	console.error(error);
});

redisClient.on("reconnecting", function(info) {
	console.log('REDIS reconnecting');
	console.error(info);
});

redisClient.on("end", function() {
	console.log('REDIS END');
});

async function testLatency () {
	addItem('TEST','SOMETHING');

	const latencies = [];

	for (var i = 0; i < 10; i++) {
		const latency = await getItem('TEST');
		latencies.push(latency);
	}

	return latencies;
}

function addItem (key, value) {
	redisClient.set(key, value);
}

function getItem (key) {
	return new Promise((resolve, reject) => {

		const start = Date.now();

		redisClient.get(key, (error, value) => {

			if (error) reject(error);

			const latency = Date.now() - start;
			resolve(latency);
		});

	});
}

module.exports = {
	testLatency
};