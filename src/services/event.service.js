import BaseService from './base.service';

class EventService extends BaseService {
    constructor() {
        super('/events');
    }
}

export default new EventService();