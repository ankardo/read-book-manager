import React from 'react';
import { Form, Container, Button, FormField, Icon } from 'semantic-ui-react';
import { MContext } from '../_configuration/Context';
import InfoModal from '../_utils/InfoModal';

class SignUp extends React.Component {
  static contextType = MContext;
  state = {
    name: '',
    email: '',
    password: '',
    hasError: false,
    errorType: '',
    errorMessage: ''
  };

  handleSignUp = () => {
    const database = this.context.state.database;
    const { name, email, password } = this.state;

    database
      .transaction('rw', database.users, async () => {
        const hasAlreadyRegistered = await database.users
          .where('email')
          .equals(email)
          .first();
        if (hasAlreadyRegistered) {
          this.setState({
            hasError: true,
            errorType: 'Email already registered',
            errorMessage: 'Looks like someone got here first'
          });
        }
        if (
          hasAlreadyRegistered === undefined &&
          this.state.name &&
          this.state.email &&
          this.state.password
        ) {
          await database.users.add({
            name,
            email,
            password
          });
        }
      })
      .then(() => {
        if (!this.state.hasError) this.props.history.push('/login');
      })
      .catch(error => console.error(error.stack || error));
  };
  render() {
    return (
      <MContext.Consumer>
        {() => (
          <Container>
            <InfoModal
              open={this.state.hasError}
              messageType = {this.state.errorType}
              message = {this.state.errorMessage}
              onClick={() =>
                this.setState({
                  hasError: false,
                  errorType: '',
                  errorMessage: ''
                })
              }
            />
            <Form onSubmit={this.handleSignUp}>
              <FormField>
                <label>User Name</label>
                <Form.Input
                  name="name"
                  type="text"
                  placeholder="Your Name"
                  onChange={e => this.setState({ name: e.target.value })}
                >
                  <input type="text" required />
                </Form.Input>
              </FormField>
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
              <Button type="submit">Register Free</Button>
            </Form>
          </Container>
        )}
      </MContext.Consumer>
    );
  }
}

export default SignUp;
