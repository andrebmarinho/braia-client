import BaseService from './base.service';

class RemedyService extends BaseService {
    constructor() {
        super('/remedies');
    }

    getByDate(date) {
        if (date) {
            return super.get(0, null, {date: date.toISOString()});
        } else {
            return super.get();
        }
    }
}

export default new RemedyService();