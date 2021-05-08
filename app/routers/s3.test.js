const express = require('express');
const supertest = require('supertest');
const router = require('./s3');
const mongoose = require('mongoose');
const { S3: AWSS3 } = require('@aws-sdk/client-s3');
const ModelS3 = require('../models/s3');
jest.mock('@aws-sdk/client-s3');

describe('Verify S3 Endpoint', () => {
    let request;

    beforeEach(async () => {
        AWSS3.mockClear();

        // Clear DB
        await ModelS3.deleteMany();
    });

    beforeAll(async () => {
        const app = express();
        app.use(express.json());
        app.use(router);

        request = supertest(app);

        await mongoose.connect(
            process.env.MONGO_URL,
            {
                useUnifiedTopology: true,
                useNewUrlParser: true,
                useCreateIndex: true
            }
        );
    });

    afterAll(async () => {
        await mongoose.connection.close();
    });

    it('Returns 200 on GET list of buckets', async () => {
        AWSS3.mockImplementation(() => {
            return {
                createBucket: (obj, callback) => {
                    callback(null);
                },
            };
        });
        await request.post('/api/v1/s3').send({
            name: 'foo',
            account_id: 'bar',
            versioning: true,
        });

        const response = await request.get('/api/v1/s3');

        expect(response.status).toStrictEqual(200);
        const bucket0 = response.body[0];
        expect(bucket0.name).toStrictEqual('foo');
        expect(bucket0.account_id).toStrictEqual('bar');
        expect(bucket0.versioning).toBe(true);
        expect(bucket0.created).toEqual(bucket0.modified);
    });

    it('Returns 200 on GET by name if object exists', async () => {
        AWSS3.mockImplementation(() => {
            return {
                createBucket: (obj, callback) => {
                    callback(null);
                },
            };
        });
        await request.post('/api/v1/s3').send({
            name: 'foo',
            account_id: 'bar',
            versioning: true,
        });

        const response = await request.get('/api/v1/s3/foo');

        expect(response.status).toStrictEqual(200);
        expect(response.body.name).toStrictEqual('foo');
        expect(response.body.account_id).toStrictEqual('bar');
        expect(response.body.versioning).toBe(true);
        expect(response.body.created).toEqual(response.body.modified);
    });

    it('Returns 404 on GET by name if object does not exist', async () => {
        const response = await request.get('/api/v1/s3/nonexistentname');

        expect(response.status).toStrictEqual(404);
        expect(response.body).toEqual({});
    });

    it('Returns 201 on successful POST', async () => {
        AWSS3.mockImplementation(() => {
            return {
                createBucket: (obj, callback) => {
                    callback(null);
                },
            };
        });
        const response = await request.post('/api/v1/s3').send({
            name: 'foo',
            account_id: 'bar',
            versioning: true,
        });

        expect(response.status).toStrictEqual(201);
        expect(response.body.message).toStrictEqual('OK');
    });

    it('Returns 400 on POST when bucket already exists', async () => {
        AWSS3.mockImplementation(() => {
            return {
                createBucket: (obj, callback) => {
                    callback({ message: 'Bucket name already exists' });
                },
            };
        });
        const payload = {
            name: 'foo',
            account_id: 'bar',
            versioning: true,
        };
        await request.post('/api/v1/s3').send(payload);

        const response = await request.post('/api/v1/s3').send(payload);

        expect(response.status).toStrictEqual(400);
        expect(response.body.message).toStrictEqual('Bucket name already exists');
    });

    it('Returns 500 on POST when AWS throws error', async () => {
        AWSS3.mockImplementation(() => {
            return {
                createBucket: (obj, callback) => {
                    callback({ message: 'Global AWS S3 outage' });
                },
            };
        });
        const response = await request.post('/api/v1/s3').send({
            name: 'foo',
            account_id: 'bar',
            versioning: true,
        });

        expect(response.status).toStrictEqual(500);
        expect(response.body.message).toStrictEqual('Global AWS S3 outage');
    });

    it('Returns 200 on PATCH success', async () => {
        AWSS3.mockImplementation(() => {
            return {
                createBucket: (obj, callback) => {
                    callback(null);
                },
            };
        });
        await request.post('/api/v1/s3').send({
            name: 'foo',
            account_id: 'bar',
            versioning: true,
        });

        // Wait a bit
        await new Promise(resolve => {
          setTimeout(resolve, 500);
        });
        const patchResponse = await request.patch('/api/v1/s3/foo').send({
            account_id: 'foobar',
            versioning: false,
        });
        expect(patchResponse.status).toStrictEqual(200);

        const getResponse = await request.get('/api/v1/s3/foo');
        expect(getResponse.status).toStrictEqual(200);
        expect(getResponse.body.name).toStrictEqual('foo');
        expect(getResponse.body.account_id).toStrictEqual('foobar');
        expect(getResponse.body.versioning).toBe(false);
        expect(getResponse.body.modified > getResponse.body.created).toBe(true);
    });

    it('Returns 404 on PATCH bucket that does not exist', async () => {
        const patchResponse = await request.patch('/api/v1/s3/foo').send({
            account_id: 'foobar',
            versioning: false,
        });
        expect(patchResponse.status).toStrictEqual(404);
    });

    it('Returns 200 DELETE success', async () => {
        AWSS3.mockImplementation(() => {
            return {
                createBucket: (obj, callback) => {
                    callback(null);
                },
                deleteBucket: (obj, callback) => {
                    callback(null);
                },
            };
        });
        await request.post('/api/v1/s3').send({
            name: 'foo',
            account_id: 'bar',
            versioning: true,
        });
        const deleteReponse = await request.delete('/api/v1/s3/foo');
        expect(deleteReponse.status).toStrictEqual(200);
        expect(deleteReponse.body.message).toStrictEqual('OK');
        const getReponse = await request.get('/api/v1/s3/foo');
        expect(getReponse.status).toStrictEqual(404);
    });

    it('Returns 404 on DELETE bucket that does not exist', async () => {
        AWSS3.mockImplementation(() => {
            return {
                deleteBucket: (obj, callback) => {
                    callback({ message: 'No such bucket' });
                },
            };
        });
        const response = await request.delete('/api/v1/s3/foo');
        expect(response.status).toStrictEqual(404);
        expect(response.body.message).toStrictEqual('No such bucket');
    });

    it('Returns 500 on POST when AWS throws error', async () => {
        AWSS3.mockImplementation(() => {
            return {
                deleteBucket: (obj, callback) => {
                    callback({ message: 'Global AWS S3 outage' });
                },
            };
        });
        const response = await request.delete('/api/v1/s3/foo');
        expect(response.body.message).toStrictEqual('Global AWS S3 outage');
    });
});
