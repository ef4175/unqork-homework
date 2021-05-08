const mongoose = require('mongoose');
const supertest = require('supertest');
const app = require('.');

describe('Verify Endpoints', () => {
    let request;

    beforeAll(async () => {
        await mongoose.connect(
            process.env.MONGO_URL,
            {
                useUnifiedTopology: true,
                useNewUrlParser: true,
                useCreateIndex: true
            }
        );

        request = supertest(app);
    });

    afterAll(async () => {
        await mongoose.connection.close();
    });

    describe('With Root', () => {
        it('Should respond to GET', async () => {
            const response = await request.get('/');

            expect(response.status).toStrictEqual(200);
            expect(response.body.message).toStrictEqual('OK');
        });
    });

    describe('With Bad Endpoints', () => {
        it('Should respond to unmatched path', async () => {
            const response = await request.post('/bar');

            expect(response.status).toStrictEqual(404);
            expect(response.body.message).toStrictEqual('Not Found!');
        });

        it('Should respond to bad request', async () => {
            const response = await request.get('/err');

            expect(response.status).toStrictEqual(500);
            expect(response.body.message).toStrictEqual('DOH!');
        });
    });
});
