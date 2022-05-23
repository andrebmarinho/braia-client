import http from './http-common';

export default class BaseService {
    constructor(urlPrefix) {
        this.prefix = urlPrefix;
    }

    get(page = 0, limitPerPage = null, otherFields = null) {
        let path = `${this.prefix}?page=${page}`;
        
        if (limitPerPage) {
            path += `&limitPerPage=${limitPerPage}`
        }
        
        if (otherFields) {
            Object.entries(otherFields).forEach(pair => {
                const key = pair[0];
                const value = pair[1];
                if (value) {
                    path += `&${key}=${value}`;
                }
            });
        }

        return http.get(path);
    }

    getById(id) {
        return http.get(`${this.prefix}/${id}`);
    }

    create(data) {
        return http.post(this.prefix, data);
    }

    update(id, data) {
        return http.put(`${this.prefix}/${id}`, data);
    }

    delete(id, userId) {
        return http.delete(`${this.prefix}/${id}`, { data: { user_id: userId } });
    }
}
