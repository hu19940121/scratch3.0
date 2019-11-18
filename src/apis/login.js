/* eslint-disable require-jsdoc */
/* eslint-disable func-style */
import request from '../utils/request';
//  登录
export function login (data) {
    return request({
        url: '/api/v1/login',
        method: 'post',
        data
    });
}
export function getUserInfo (token) {
    return request({
        url: '/api/v1/getUserInfo',
        method: 'get',
        params: {token}
    });
}
export function logout () {
    return request({
        url: '/api/v1/logout',
        method: 'post'
    });
}
