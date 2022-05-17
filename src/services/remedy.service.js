import BaseService from './base.service';

class RemedyService extends BaseService {
    constructor() {
        super('/remedies');
    }
}

export default new RemedyService();