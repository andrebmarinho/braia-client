import BaseService from './base.service';

class EventService extends BaseService {
    constructor() {
        super('/events');
    }

    getByDescription(description) {
        return super.get(0, null, {description});
    }
}

export default new EventService();