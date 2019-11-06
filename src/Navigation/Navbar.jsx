import React, { Component } from 'react';
import { Menu } from 'semantic-ui-react';
import { Link } from 'react-router-dom';
import { authenticationService } from '../_services/authentication.service';

export default class Navbar extends Component {
  state = {
    leftItems: [{ key: 'about', active: true, name: 'About' }],
    rightItems: [
      { key: 'signup', name: 'Sign Up' },
      { key: 'login', name: 'Login' }
    ]
  };

  componentDidMount() {
    if (authenticationService.currentUserValue) {
      this.setState({
        leftItems: [
          { key: 'books', name: 'Books that you read' },
          { key: 'report', name: 'Yearly Report' }
        ],
        rightItems: [
          {
            key: 'logout',
            name: 'Logout',

            click: () => {
              authenticationService.logout();
            }
          }
        ]
      });
    } else {
      this.setState({
        leftItems: [{ key: 'about', active: true, name: 'About' }],
        rightItems: [
          { key: 'signup', name: 'Sign Up' },
          { key: 'login', name: 'Login' }
        ]
      });
    }
  }

  handleItemClick = (e, { name }) => this.setState({ activeItem: name });

  render() {
    return (
      <Menu>
        {this.state.leftItems.map(item => (
          <Menu.Item key={item.key}>
            <Link to={item.key}>{item.name}</Link>
          </Menu.Item>
        ))}
        <Menu.Menu position="right">
          {this.state.rightItems.map(item => (
            <Menu.Item key={item.key}>
              <Link to={item.key}>{item.name}</Link>
            </Menu.Item>
          ))}
        </Menu.Menu>
      </Menu>
    );
  }
}
