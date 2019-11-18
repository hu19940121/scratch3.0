/* eslint-disable semi */
/* eslint-disable valid-jsdoc */
/* eslint-disable indent */
/* eslint-disable prefer-template */
/* eslint-disable no-negated-condition */
/* eslint-disable no-console */
import axios from 'axios';
// import {MessageBox, Message} from 'element-ui';
// import store from '@/store';
import store from 'store'; // localstorage封装的库
import {message, Modal} from 'antd';
const {confirm} = Modal;
// store.get('persist:login').session
const reg = /^["|'](.*)["|']$/g;
// create an axios instance
const service = axios.create({
    // baseURL: process.env.VUE_APP_BASE_API, // url = base url + request url
    withCredentials: true, // send cookies when cross-domain requests
    timeout: 5000 // request timeout
});

// request interceptor
service.interceptors.request.use(
    config => {
        const token = store.get('token');

        // const token = store.get('persist:login').session;
        // console.log('token',store.get('persist:login'));
        // do something before request is sent
        if (token) {
        // let each request carry token
        // ['X-Token'] is a custom headers key
        // please modify it according to the actual situation
        // config.headers['X-Token'] = getToken()
            config.headers.sessionKey = token.replace(reg, '$1');
        // header
        }
        return config;
    },
    error => {
        // do something with request error
        console.log(error); // for debug
        return Promise.reject(error);
    }
);

// response interceptor
service.interceptors.response.use(
  /**
   * If you want to get http information such as headers or status
   * Please return  response => response
  */

  /**
   * Determine the request status by custom code
   * Here is just an example
   * You can also judge the status by HTTP Status Code
   */
    response => {
        const res = response.data
        if (res.code !== 0) {
          if (res.code === 2) {            
            //没有登录            
            // store.remove("persist:login")
            store.remove('token')
          } else {
            message.error(res.msg || 'error');
            // 50008: Illegal token; 50012: Other clients logged in; 50014: Token expired;
            // if (res.code === 50008 || res.code === 50012 || res.code === 50014) {
            //   confirm({
            //     title: '提示',
            //     content: '您已经登出，请重新登录',
            //     onOk () {
            //       store.remove('persist:login')
            //       store.remove('token')
            //       location.reload()
            //     },
            //     onCancel () {}
            //   });
            // }
            return Promise.reject(res.message || 'error')
          }

        }
          return res
        
  },
  error => {
    message.error(error.message || 'error');
    console.log('err' + error) // for debug
    return Promise.reject(error)
  }
)

export default service;
