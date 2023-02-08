import chai, { expect } from 'chai';
import chaiHttp from 'chai-http';
import { app } from '../../adapter/cloudRunAdapter';
import { getSampleCustomerResourceUpdatedMessage } from '../testData/ctCustomerMessages';
import http from 'http';
import { ctAuthNock, ctGetCustomerNock } from './nocks/commercetoolsNock';
import { klaviyoGetProfilesNock, klaviyoPatchProfileNock } from './nocks/KlaviyoProfileNock';
import nock from 'nock';

chai.use(chaiHttp);

describe('pubSub adapter customer resource updated message', () => {
    let server: http.Server;
    beforeAll(() => {
        server = app.listen(0);
    });

    afterAll(() => {
        server.close();
    });

    beforeEach(() => {
        jest.clearAllMocks();
        nock.cleanAll();
    });

    it('should update the profile in klaviyo and return status code 204 when a customer resource updated message is received from CT', (done) => {
        const inputMessage = getSampleCustomerResourceUpdatedMessage();

        const authNock = ctAuthNock();
        const getCustomerNock = ctGetCustomerNock(inputMessage.resource.id, 200, [
            {
                id: '1235aa3a-5417-4b51-a76c-d6721472531f',
                region: 'aRegion',
                city: 'London',
                country: 'UK',
                phone: '+4407476588266',
                postalCode: 'WE1 2DP',
                streetName: 'High Road',
                streetNumber: '23',
                additionalStreetInfo: 'private access',
                building: 'Tall Tower',
                apartment: 'C',
                additionalAddressInfo: 'additional address info',
                state: 'a state',
            },
        ]);
        const getKlaviyoGetProfilesNock = klaviyoGetProfilesNock();
        const getKlaviyoPatchProfileNock = klaviyoPatchProfileNock();

        chai.request(server)
            .post('/')
            .send({ message: { data: Buffer.from(JSON.stringify(inputMessage)) } })
            .end((res, err) => {
                expect(err.status).to.eq(204);
                expect(authNock.isDone()).to.be.true;
                expect(getCustomerNock.isDone()).to.be.true;
                expect(getKlaviyoGetProfilesNock.isDone()).to.be.true;
                expect(getKlaviyoPatchProfileNock.isDone()).to.be.true;
                done();
            });
    });

    it('should return status code 202 when the get customer call to CT fails with status code 400', (done) => {
        const inputMessage = getSampleCustomerResourceUpdatedMessage();

        const authNock = ctAuthNock();
        const getCustomerNock = ctGetCustomerNock(inputMessage.resource.id, 400);
        const getKlaviyoGetProfilesNock = klaviyoGetProfilesNock();

        chai.request(server)
            .post('/')
            .send({ message: { data: Buffer.from(JSON.stringify(inputMessage)) } })
            .end((res, err) => {
                expect(err.status).to.eq(202);
                expect(authNock.isDone()).to.be.true;
                expect(getCustomerNock.isDone()).to.be.true;
                expect(getKlaviyoGetProfilesNock.isDone()).to.be.false;
                done();
            });
    });

    it('should return status code 202 when the get profile from Klaviyo fails with status code 400', (done) => {
        const inputMessage = getSampleCustomerResourceUpdatedMessage();

        const authNock = ctAuthNock();
        const getCustomerNock = ctGetCustomerNock(inputMessage.resource.id);
        const getKlaviyoGetProfilesNock = klaviyoGetProfilesNock(400);

        chai.request(server)
            .post('/')
            .send({ message: { data: Buffer.from(JSON.stringify(inputMessage)) } })
            .end((res, err) => {
                expect(err.status).to.eq(202);
                expect(authNock.isDone()).to.be.true;
                expect(getCustomerNock.isDone()).to.be.true;
                // expect(getKlaviyoGetProfilesNock.isDone()).to.be.true;
                done();
            });
    });

    it('should return status code 500 when fails to get the profile in Klaviyo with a 5xx error', (done) => {
        const inputMessage = getSampleCustomerResourceUpdatedMessage();

        const authNock = ctAuthNock();
        const getCustomerNock = ctGetCustomerNock(inputMessage.resource.id, 200);
        const getKlaviyoGetProfilesNock = klaviyoGetProfilesNock(500);
        const getKlaviyoPatchProfileNock = klaviyoPatchProfileNock();

        chai.request(server)
            .post('/')
            .send({ message: { data: Buffer.from(JSON.stringify(inputMessage)) } })
            .end((res, err) => {
                expect(authNock.isDone()).to.be.true;
                expect(getCustomerNock.isDone()).to.be.true;
                expect(getKlaviyoGetProfilesNock.isDone()).to.be.true;
                expect(err.status).to.eq(500);
                expect(getKlaviyoPatchProfileNock.isDone()).to.be.false;
                done();
            });
    });
});