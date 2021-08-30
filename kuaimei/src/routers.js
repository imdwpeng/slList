/*
 * @Author: your name
 * @Date: 2019-10-24 23:27:44
 * @LastEditTime: 2021-08-25 08:39:53
 * @LastEditors: DWP
 * @Description: In User Settings Edit
 * @FilePath: /github/yingtianmeijie/src/web/routers.js
 */
import React from 'react';
import Loadable from 'react-loadable';
import {TagOutlined, HighlightOutlined, BarChartOutlined, UserOutlined} from '@ant-design/icons'

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
];

const menus = [
  {
    id: 'brand',
    path: '/brand',
    name: '品牌管理',
    icon: TagOutlined
  },
  {
    id: 'anchor',
    path: '/anchor',
    name: '主播管理',
    icon: UserOutlined
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
