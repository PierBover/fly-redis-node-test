require('./redis.js');

const fastify = require('fastify')({
	ignoreTrailingSlash: true,
	logger: true
});

fastify.setErrorHandler(function (error, request, reply) {
	console.log(error.toString());
	reply.status(500);
	reply.send(error.toString());
});

fastify.route({
	path: '/',
	method: 'GET',
	handler (request, reply) {
		reply.send('Hello there!');
	}
});

fastify.listen(process.env.PORT || 5556, '0.0.0.0', function (error, address) {

	if (error) {
		fastify.log.error(error);
		process.exit(1);
	}

	fastify.log.info(`server listening on ${address}`)
});