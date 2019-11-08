import React, { Component } from 'react';
import { Menu, Button, Label } from 'semantic-ui-react';
import { authenticationService } from '../_services/authentication.service';

export default class Navbar extends Component {
  state = {};
  checkNavBar = () => {
    this.user = authenticationService.currentUserValue;
    if (authenticationService.currentUserValue) {
      this.leftItems = [
        { key: 'userWelcome', isHeader: true },
        { key: 'home', active: true, name: 'Home' },
        { key: 'books', name: 'Books' },
        { key: 'report', name: "Reading's Yearly Report" },
        { key: 'about', name: 'About' }
      ];
      this.rightItems = [
        {
          key: 'logout',
          name: 'Logout',
          isPrimary: true,
          click: () => {
            authenticationService.logout();
          }
        }
      ];
    } else {
      this.leftItems = [
        { key: 'home', active: true, name: 'Home' },
        { key: 'about', name: 'About' }
      ];
      this.rightItems = [
        {
          key: 'signup',
          name: 'Sign Up',
          isPrimary: false,
          click: () => {
            this.setState({ activeItem: 'signup' });
            this.props.history.push('/signup');
          }
        },
        {
          key: 'login',
          name: 'Login',
          isPrimary: true,
          click: () => {
            this.setState({ activeItem: 'login' });
            this.props.history.push('/login');
          }
        }
      ];
    }
  };

  handleItemClick = (e, { name }) => {
    if (name === 'userWelcome') {
      name = 'home';
    }
    name === 'home'
      ? this.props.history.push('/')
      : this.props.history.push(`/${name}`);
    return this.setState({ activeItem: name });
  };

  render() {
    let { activeItem } = this.state;
    if (activeItem === undefined) {
      if (window.location.pathname.replace('/', '').trim() === '') {
        activeItem = 'home';
      } else {
        activeItem = window.location.pathname.replace('/', '').trim();
      }
    }
    return (
      <Menu>
        {this.checkNavBar()}
        {this.leftItems.map(item => (
          <Menu.Item
            key={item.key}
            name={item.key}
            header={item.isHeader}
            active={activeItem === item.key}
            onClick={this.handleItemClick}
          >
            {item.isHeader && this.user ? (
              <Label>{`Welcome ${this.user.name}`}</Label>
            ) : (
              item.name
            )}
          </Menu.Item>
        ))}
        <Menu.Menu position="right">
          {this.rightItems.map(item => (
            <Menu.Item key={item.key} active={activeItem === item.key}>
              <Button primary={item.isPrimary} onClick={item.click}>
                {item.name}
              </Button>
            </Menu.Item>
          ))}
        </Menu.Menu>
      </Menu>
    );
  }
}
