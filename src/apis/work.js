/* eslint-disable require-jsdoc */
/* eslint-disable func-style */
import request from '../utils/request';
//  发布作品
export function addWork (data) {
    return request({
        url: '/api/v1/swork/add',
        method: 'post',
        data
    });
}
export function getWorkDetailById (data) {
    return request({
        url: '/api/v1/swork/detail',
        method: 'get',
        params: data
    });
}
