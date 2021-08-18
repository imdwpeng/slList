/*
 * @Author: Eric
 * @Date: 2019-10-24 23:27:44
 * @LastEditors: DWP
 * @LastEditTime: 2021-08-18 10:48:12
 * @Description: 樱田美睫官网
 */
import React, { Component } from 'react';
import { Route, Switch, Link } from 'react-router-dom';
import { Layout, Menu } from 'antd';
import { MenuUnfoldOutlined, MenuFoldOutlined } from '@ant-design/icons';
import logo from './static/logo.png';
import logoCollapsed from './static/logo.collapsed.png';
import { routers, menus } from './routers';
import './App.less';

const { Sider, Content } = Layout;

class App extends Component {
  constructor(props) {
    super(props);
    let { hash } = window.location;
    hash = hash.replace('#/', '');
    this.state = {
      collapsed: false,
      current: hash || 'statistics'
    };
  }

  toggle = () => {
    this.setState({
      collapsed: !this.state.collapsed
    });
  };

  handleClick = (e) => {
    this.setState({ current: e.key });
  };

  render() {
    const { collapsed, current } = this.state;

    return (
      <Layout style={{ height: '100%' }}>
        <Sider
          trigger={null}
          collapsible
          collapsed={collapsed}
        >
          <div className="logo">
            <img
              style={{ height: '100%' }}
              src={collapsed ? logoCollapsed : logo}
              alt=""
            />
          </div>
          <div className="triggerBox">
            {
              React.createElement(this.state.collapsed ? MenuUnfoldOutlined : MenuFoldOutlined, {
                className: 'trigger',
                onClick: this.toggle
              })
            }
          </div>
          <Menu
            theme="dark"
            mode="inline"
            selectedKeys={[current]}
            onClick={this.handleClick}
          >
            {
              menus.map((item) => {
                return (
                  <Menu.Item key={item.id}>
                    <Link to={item.path}>
                      {
                        React.createElement(item.icon)
                      }
                      <span>{item.name}</span>
                    </Link>
                  </Menu.Item>
                );
              })
            }
          </Menu>
        </Sider>
        <Layout>
          <Content
            style={{
              margin: 10,
              padding: 10,
              background: '#fff',
              minHeight: 280
            }}
          >
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
          </Content>
        </Layout>
      </Layout>
    );
  }
}

export default App;
