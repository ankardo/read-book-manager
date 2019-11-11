import React from 'react';
import { authenticationService } from '../_services/authentication.service';
import { MContext } from '../_configuration/Context';
import { Form, Container, Button, FormField, Icon } from 'semantic-ui-react';
import { configureFakeBackend } from '../_utils/fake-backend';
import InfoModal from '../_utils/InfoModal';

class SigIn extends React.Component {
  static contextType = MContext;
  state = {
    email: '',
    password: '',
    hasError: false,
    errorType: '',
    errorMessage: ''
  };
  constructor(props) {
    super(props);
    if (authenticationService.currentUserValue) {
      this.props.history.push('/');
    }
  }
  componentDidMount() {
    configureFakeBackend(this.context.state.database);
  }
  handleSignIn = () => {
    authenticationService
      .login(this.state.email, this.state.password)
      .then(user => {
        const { from } = { from: { pathname: '/' } };
        this.props.history.push(from);
      })
      .catch(error =>
        this.setState({
          hasError: true,
          errorType: "Couldn't Log in",
          errorMessage: error
        })
      );
  };

  render() {
    return (
      <Container>
        <InfoModal
          open={this.state.hasError}
          messageType={this.state.errorType}
          message={this.state.errorMessage}
          onClick={() =>
            this.setState({
              hasError: false,
              errorType: '',
              errorMessage: ''
            })
          }
        />
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
        </Form>
      </Container>
    );
  }
}

export default SigIn;
