import React from 'react';
import { PrivateRoute } from '../_configuration/PrivateRoute';
import MProvider from '../_configuration/Context';
import { history } from '../_utils/history';

import { authenticationService } from '../_services/authentication.service';
import { Router, Route, Switch } from 'react-router-dom';
import SignIn from '../Login/SignIn';
import SignUp from '../Login/SignUp';
import Books from '../Books/Books';
import Navbar from '../Navigation/Navbar';

class App extends React.Component {
  componentDidMount() {
    authenticationService.currentUser.subscribe(user =>
      this.setState({ currentUser: user })
    );
  }
  render() {
    return (
      <MProvider>
        <Router history={history}>
          <Navbar history={history} />

          <Switch>
            <Route exact path="/" component={() => <h1>Home</h1>} />
            <Route exact path="/about" component={() => <h1>About</h1>} />
            <Route path="/login" component={SignIn} />
            <Route path="/signUp" component={SignUp} />
            <PrivateRoute path="/books" component={Books} />
            <PrivateRoute path="/report" component={Books} />
            <Route path="*" component={() => <h1>Page not found</h1>} />
          </Switch>
        </Router>
      </MProvider>
    );
  }
}
export default App;
