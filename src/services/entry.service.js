import BaseService from './base.service';

class EntryService extends BaseService {
    constructor() {
        super('/entries');
    }
}

export default new EntryService();