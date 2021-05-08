const express = require('express');
const morgan = require('morgan');
const routers = require('./routers');
const requestId = require('./middleware/requestId');

const app = express();
app.disable('x-powered-by');
// Include simple middleware for request id
app.use(requestId);
/* istanbul ignore next */
if (process.env.NODE_ENV !== 'test') {
    // Enable simple STDOUT logging if not tests
    app.set('enableLogger', true);
    app.use(morgan('combined'));
}

// Body parser
app.use(express.json());

// Mount all subrouters
app.use(routers);

// Generic 404 handler
app.use((req, res) => {
    res.status(404).json({ status: 404, message: 'Not Found!' });
});
// Generic error handler
app.use((err, req, res, next) => {
    /* istanbul ignore next */
    if (app.get('enableLogger')) {
        // eslint-disable-next-line no-console
        console.error(err);
    }

    res.status(500).json({ status: 500, message: err.message });
    next();
});

module.exports = app;
