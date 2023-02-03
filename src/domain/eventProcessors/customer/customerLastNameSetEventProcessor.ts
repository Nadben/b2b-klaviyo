import { AbstractEvent } from '../abstractEvent';
import logger from '../../../utils/log';
import { CustomerLastNameSetMessage } from '@commercetools/platform-sdk/dist/declarations/src/generated/models/message';

export class CustomerLastNameSetEventProcessor extends AbstractEvent {
    isEventValid(): boolean {
        const message = this.ctMessage as unknown as CustomerLastNameSetMessage;
        return message.resource.typeId === 'customer' && message.type === 'CustomerLastNameSet';
    }

    generateKlaviyoEvents(): Promise<KlaviyoEvent[]> {
        const message = this.ctMessage as unknown as CustomerLastNameSetMessage;
        logger.info(`processing CT ${message.type} message`);
        const body = {
            data: {
                type: 'profile',
                attributes: {
                    last_name: message.lastName,
                },
                meta: {
                    identifiers: {
                        external_id: message.resource.id,
                    },
                },
            },
        };
        return Promise.resolve([
            {
                body,
                type: 'profileUpdated',
            },
        ]);
    }
}