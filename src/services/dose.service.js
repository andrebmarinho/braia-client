import BaseService from './base.service';

class RemedyService extends BaseService {
    constructor() {
        super('/doses');
    }

    getByRmd(rmd, currentDate) {
        const query = {
            remedy: rmd._id,
            date: currentDate
        };

        return super.get(0, null, query);
    }
}

export default new RemedyService();