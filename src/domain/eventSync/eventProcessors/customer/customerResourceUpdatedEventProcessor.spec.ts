import { MessageDeliveryPayload } from '@commercetools/platform-sdk/dist/declarations/src/generated/models/subscription';
import { DeepMockProxy, mockDeep } from 'jest-mock-extended';
import { expect as exp } from 'chai';
import { CustomerResourceUpdatedEventProcessor } from './customerResourceUpdatedEventProcessor';
import { getSampleCustomerResourceUpdatedMessage } from '../../../../test/testData/ctCustomerMessages';
import { getCustomerProfile } from '../../../../infrastructure/driven/commercetools/ctService';
import { getSampleCustomerApiResponse } from '../../../../test/testData/ctCustomerApi';
import { Context } from '../../../../types/klaviyo-context';
import mocked = jest.mocked;

jest.mock('../../../../infrastructure/driven/commercetools/ctService');
jest.mock('../../../../infrastructure/driven/klaviyo/KlaviyoService');

const getCustomerProfileMock = mocked(getCustomerProfile);
const contextMock: DeepMockProxy<Context> = mockDeep<Context>();

describe('CustomerResourceUpdatedEventProcessor > isEventValid', () => {
    it('should return valid when the customer event has all the required fields', async () => {
        const ctMessageMock: MessageDeliveryPayload = mockDeep<MessageDeliveryPayload>();
        Object.defineProperty(ctMessageMock, 'resource', { value: { typeId: 'customer' } }); //mock readonly property
        Object.defineProperty(ctMessageMock, 'notificationType', { value: 'ResourceUpdated' });

        const event = CustomerResourceUpdatedEventProcessor.instance(ctMessageMock, contextMock);

        exp(event.isEventValid()).to.be.true;
    });

    it.each`
        resource      | notificationType
        ${'invalid'}  | ${'ResourceUpdated'}
        ${'customer'} | ${'invalid'}
    `(
        'should return invalid when is not a valid customer ResourceUpdated message',
        ({ resource, notificationType }) => {
            const ctMessageMock: MessageDeliveryPayload = mockDeep<MessageDeliveryPayload>();
            Object.defineProperty(ctMessageMock, 'resource', { value: { typeId: resource } });
            Object.defineProperty(ctMessageMock, 'notificationType', { value: notificationType });

            const event = CustomerResourceUpdatedEventProcessor.instance(ctMessageMock, contextMock);

            exp(event.isEventValid()).to.be.false;
        },
    );
});

describe('CustomerResourceUpdatedEventProcessor > generateKlaviyoEvent', () => {
    beforeEach(() => {
        jest.resetAllMocks();
    });

    it('should generate the klaviyo update profile event when the input customer ResourceUpdated event is valid', async () => {
        const inputMessage = getSampleCustomerResourceUpdatedMessage();
        const message = inputMessage as unknown as MessageDeliveryPayload;
        const event = CustomerResourceUpdatedEventProcessor.instance(message, contextMock);
        getCustomerProfileMock.mockResolvedValue(getSampleCustomerApiResponse());
        contextMock.klaviyoService.getKlaviyoProfileByExternalId.mockResolvedValue({ type: 'profile', id: 'someId', attributes: {} });

        const klaviyoEvent = await event.generateKlaviyoEvents();

        exp(klaviyoEvent).to.not.be.undefined;
        exp(klaviyoEvent.length).to.be.eq(1);
        expect(klaviyoEvent[0].body).toMatchSnapshot();
    });

    it('should generate the klaviyo create profile event when the input customer ResourceUpdated event is valid and the profile is not found in Klaviyo', async () => {
        const inputMessage = getSampleCustomerResourceUpdatedMessage();
        const message = inputMessage as unknown as MessageDeliveryPayload;
        const event = CustomerResourceUpdatedEventProcessor.instance(message, contextMock);
        getCustomerProfileMock.mockResolvedValue(getSampleCustomerApiResponse());
        contextMock.klaviyoService.getKlaviyoProfileByExternalId.mockResolvedValue(undefined);

        const klaviyoEvent = await event.generateKlaviyoEvents();

        exp(klaviyoEvent).to.not.be.undefined;
        exp(klaviyoEvent.length).to.be.eq(1);
        expect(klaviyoEvent[0].body).toMatchSnapshot();
    });

    it('should not generate the klaviyo event when the customer is not found in CT', async () => {
        const inputMessage = getSampleCustomerResourceUpdatedMessage();
        const message = inputMessage as unknown as MessageDeliveryPayload;
        const event = CustomerResourceUpdatedEventProcessor.instance(message, contextMock);
        getCustomerProfileMock.mockResolvedValue(getSampleCustomerApiResponse());
        contextMock.klaviyoService.getKlaviyoProfileByExternalId.mockResolvedValue(undefined);

        const klaviyoEvent = await event.generateKlaviyoEvents();

        exp(klaviyoEvent).to.not.be.undefined;
        exp(klaviyoEvent.length).to.be.eq(1);
        expect(klaviyoEvent[0].body).toMatchSnapshot();
    });
});