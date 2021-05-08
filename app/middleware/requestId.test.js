const express = require('express');
const supertest = require('supertest');
const requestId = require('./requestId');

describe('Verify RequestId Middleware', () => {
    let request;

    beforeAll(() => {
        const app = express();
        app.use(requestId);
        app.get('/', (req, res) => {
            res.status(200).json({ status: 200, message: 'OK' });
        });

        request = supertest(app);
    });

    it('Should add a request-id header to response', async () => {
        const response = await request.get('/');

        expect(response.status).toStrictEqual(200);
        expect(response.body.message).toStrictEqual('OK');

        expect(response.header['request-id']).toMatch(/^[0-9a-f]{8,8}-[0-9a-f]{4,4}-[0-9a-f]{4,4}-[0-9a-f]{4,4}-[0-9a-f]{12,12}$/);
    });
});
