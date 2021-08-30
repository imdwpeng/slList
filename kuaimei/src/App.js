/*
 * @Author: Eric
 * @Date: 2019-10-24 23:27:44
 * @LastEditors: DWP
 * @LastEditTime: 2021-08-25 08:42:13
 * @Description: 樱田美睫官网
 */
import React, { Component } from 'react';
import { Route, Switch } from 'react-router-dom';
import { Layout } from 'antd';
import { routers } from './routers';
import './App.less';

const { Content } = Layout;

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      collapsed: false
    };
  }

  toggle = () => {
    this.setState({
      collapsed: !this.state.collapsed
    });
  };

  render() {
    return (
      <Switch>
        {
          routers.map((route, index) => {
            const key = `route_${index}`;
            return (
              <Route
                key={key}
                path={route.path}
                exact={route.exact}
                component={route.component}
              />
            );
          })
        }
        <Route component={Error} />
      </Switch>
    );
  }
}

export default App;
