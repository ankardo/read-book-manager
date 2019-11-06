import React from 'react';
import { authenticationService } from '../_services/authentication.service';
import {
  Form,
  Container,
  Button,
  FormField,
  Icon,
  Divider
} from 'semantic-ui-react';
import { Link } from 'react-router-dom';
import { MContext } from '../_configuration/Context';
import { configureFakeBackend } from '../_utils/fake-backend';

class SigIn extends React.Component {
  static contextType = MContext;
  state = {
    email: '',
    password: ''
  };
  constructor(props) {
    super(props);
    if (authenticationService.currentUserValue) {
      this.props.history.push('/app');
    }
  }
  componentDidMount(){
    configureFakeBackend(this.context.state.database);
  }
  handleSignIn = () => {
    
    authenticationService
      .login(this.state.email, this.state.password)
      .then(user => {
        const { from } = {from: { pathname: '/' }};
        this.props.history.push(from);
      })
      .catch(e => alert(e));
  }

  render() {
    return (
      <Container>
        <Form onSubmit={this.handleSignIn}>
          <FormField>
            <label>Email</label>

            <Form.Input
              name="email"
              type="email"
              iconPosition="left"
              placeholder="Your Email"
              onChange={e => this.setState({ email: e.target.value })}
            >
              <Icon name="at" />
              <input type="email" required />
            </Form.Input>
          </FormField>
          <FormField>
            <label>Password</label>
            <Form.Input
              name="password"
              type="password"
              placeholder="Your Password"
              onChange={e => this.setState({ password: e.target.value })}
            >
              <input type="password" required />
            </Form.Input>
          </FormField>
          <Button type="submit">Login</Button>
          <Divider horizontal />
          <Link to="/signUp">Not registered? Sign Up!</Link>
        </Form>
      </Container>
    );
  }
}

export default SigIn;
