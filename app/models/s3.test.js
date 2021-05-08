const mongoose = require('mongoose');
// Load model
require('./s3');

const { S3: S3Model } = mongoose.models;

describe('Verify S3 Model', () => {
    beforeAll(async () => {
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

    it('should throw when name is not provided', async () => {
        const s3NoName = new S3Model({
            account_id: 'some-account-id',
            versioning: true,
        });
        await expect(s3NoName.save()).rejects.toThrow();
    });

    it('should throw when account_id is not provided', async () => {
        const s3NoAccountId = new S3Model({
            name: 'some-name',
            versioning: true,
        });
        await expect(s3NoAccountId.save()).rejects.toThrow();
    });

    it('should throw when versioning is not provided', async () => {
        const s3NoVersioning = new S3Model({
            name: 'some-name',
            account_id: 'some-account-id',
        });
        await expect(s3NoVersioning.save()).rejects.toThrow();
    });

    it('should throw when name already exists', async () => {
        const validS3 = new S3Model({
            name: 'test-taken-name',
            account_id: 'some-account-id',
            versioning: true,
        });
        await validS3.save();

        const s3DuplicateName = new S3Model({
            name: 'test-taken-name',
            account_id: 'foobar',
            versioning: false,
        });
        await expect(s3DuplicateName.save()).rejects.toThrow();
    });

    it('should insert a valid new document', async () => {
        const validS3 = new S3Model({
            name: 'some-name',
            account_id: 'some-account-id',
            versioning: true,
        });
        const savedS3 = await validS3.save();

        expect(savedS3.id).toBeDefined();
    });
});
