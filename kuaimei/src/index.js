/*
 * @Author: DWP
 * @Date: 2021-04-27 11:07:32
 * @LastEditors: DWP
 * @LastEditTime: 2021-08-11 13:53:58
 */
import React from 'react';
import ReactDOM from 'react-dom';
import { HashRouter } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import 'antd/dist/antd.css';
import zhCN from 'antd/es/locale/zh_CN';
import App from './App';
import './index.less';

ReactDOM.render(
  <ConfigProvider locale={zhCN}>
    <HashRouter>
      <App />
    </HashRouter>
  </ConfigProvider>,
  document.getElementById('root')
);
