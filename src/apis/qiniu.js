/* eslint-disable require-jsdoc */
/* eslint-disable func-style */
import request from '../utils/request';
//  获取骑牛token
export function getQiniuToken () {
    return request({
        url: '/api/v1/getQiniuToken',
        method: 'get'
    });
}
