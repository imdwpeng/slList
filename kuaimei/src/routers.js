/*
 * @Author: your name
 * @Date: 2019-10-24 23:27:44
 * @LastEditTime: 2021-08-17 18:48:11
 * @LastEditors: DWP
 * @Description: In User Settings Edit
 * @FilePath: /github/yingtianmeijie/src/web/routers.js
 */
import React from 'react';
import Loadable from 'react-loadable';
import {TagOutlined, HighlightOutlined, BarChartOutlined} from '@ant-design/icons'

const loadable = filename => Loadable({
  loader: () => import(`./containers/${filename}/index.js`),
  loading: () => (''),
  render(loaded, props) {
    const Component = loaded.default;
    return <Component {...props} />;
  }
});

// 路由配置对象
const routers = [
  {
    path: '/',
    exact: true,
    component: loadable('Statistics')
  },
  {
    path: '/brand',
    exact: true,
    component: loadable('BrandManage')
  },
  {
    path: '/record',
    exact: true,
    component: loadable('Manage')
  },
  {
    path: '/statistics',
    exact: true,
    component: loadable('Statistics')
  },
];

const menus = [
  {
    id: 'brand',
    path: '/brand',
    name: '品牌管理',
    icon: TagOutlined
  },
  {
    id: 'record',
    path: '/record',
    name: '数据录入',
    icon: HighlightOutlined
  },
  {
    id: 'statistics',
    path: '/statistics',
    name: '数据分析',
    icon: BarChartOutlined
  },
];

export { routers, menus };
