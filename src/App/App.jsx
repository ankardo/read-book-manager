import React from 'react';
import { PrivateRoute } from '../_configuration/PrivateRoute';
import MProvider from '../_configuration/Context';
import { history } from '../_utils/history';

import { authenticationService } from '../_services/authentication.service';
import { Router, Route, Switch } from 'react-router-dom';
import SignIn from '../Login/SignIn';
import SignUp from '../Login/SignUp';
import Navbar from '../Navigation/Navbar';

class App extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      currentUser: null
    };
  }

  componentDidMount() {
    authenticationService.currentUser.subscribe(user =>
      this.setState({ currentUser: user })
    );
  }

  logout() {
    authenticationService.logout();
    history.push('/login');
  }
  render() {
    const { currentUser } = this.state;
    return (
      <MProvider>
        <Router history={history}>
          <Navbar user={currentUser}/>
          <Switch>
            <Route exact path="/" component={() => <h1>Home</h1>} />
            <Route path="/login" component={SignIn} />
            <Route path="/signUp" component={SignUp} />
            <PrivateRoute path="/app" component={() => <h1>App</h1>} />
            <Route path="*" component={() => <h1>Page not found</h1>} />
          </Switch>
        </Router>
      </MProvider>
    );
  }
}
export default App;
