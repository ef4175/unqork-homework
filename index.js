const mongoose = require('mongoose');
const app = require('./app');

mongoose.connect(
    process.env.MONGO_URL,
    {
        useUnifiedTopology: true,
        useNewUrlParser: true,
        useCreateIndex: true
    }
).then(() => {
    const server = app.listen(process.env.PORT, () => {
        if (app.get('enableLogger')) {
            const { address, port } = server.address();
            // eslint-disable-next-line no-console
            console.info(`HTTP server listening ${address}:${port}!`);
        }
    });

    process.on('SIGINT', () => shutdown('SIGINT', app, server));
    process.on('SIGTERM', () => shutdown('SIGTERM', app, server));
});

function shutdown(signal, enableLogger, serv) {
    if (enableLogger) {
        // eslint-disable-next-line no-console
        console.info(`\n\n${signal} signal received: closing HTTP server`);
    }

    serv.close(() => {
        if (enableLogger) {
            // eslint-disable-next-line no-console
            console.info('HTTP server closed');
        }
    });
}
