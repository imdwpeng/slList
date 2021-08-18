/*
 * @Author: your name
 * @Date: 2019-11-06 23:19:48
 * @LastEditTime: 2021-08-17 10:55:30
 * @LastEditors: DWP
 * @Description: In User Settings Edit
 * @FilePath: /github/yingtianmeijie/src/bam/http.js
 */
import axios from 'axios';
import { message } from 'antd';

const get = (url, params = {}, isHideMsg = false) => {
  return new Promise((resolve, reject) => {
    axios.get(url, {
      params
    }).then((response) => {
      const { data: { data, code, msg } } = response;

      if (code === 200) {
        resolve(data);
      } else if (!isHideMsg) {
        message.error(msg);
      } else {
        reject(data);
      }
    }).catch((err) => {
      reject(err);
    });
  });
};

const post = (url, params = {}) => {
  return new Promise((resolve, reject) => {
    axios.post(url, {
      ...params
    }, {
      dataType: 'json',
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    }).then((response) => {
      const { data: { data, code, msg } } = response;
      if (code === 200) {
        resolve(data);
      } else {
        message.error(msg);
      }
    }).catch((err) => {
      reject(err);
    });
  });
};

const postFile = (url, params) => {
  return new Promise((resolve, reject) => {
    axios.post(url, params, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    }).then((response) => {
      const { data: { data, code, msg } } = response;
      if (code === 200) {
        resolve(data);
      } else {
        message.error(msg);
      }
    }).catch((err) => {
      reject(err);
    });
  });
};

const del = (url) => {
  return new Promise((resolve, reject) => {
    axios.delete(url).then((response) => {
      const { data: { data, code, msg } } = response;
      if (code === 200) {
        resolve(data);
      } else {
        message.error(msg);
      }
    }).catch((err) => {
      reject(err);
    });
  });
};

const put = (url, params = {}) => {
  return new Promise((resolve, reject) => {
    axios.put(url, {
      ...params
    }).then((response) => {
      const { data: { data, code, msg } } = response;
      if (code === 200) {
        resolve(data);
      } else {
        message.error(msg);
      }
    }).catch((err) => {
      reject(err);
    });
  });
};

export default { get, post, postFile, del, put };
