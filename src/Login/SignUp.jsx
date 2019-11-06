import React from 'react';
import {
  Form,
  Container,
  Button,
  Divider,
  FormField,
  Icon
} from 'semantic-ui-react';
import { Link } from 'react-router-dom';
import { MContext } from '../_configuration/Context';

class SignUp extends React.Component {
  static contextType = MContext;
  state = {
    name: '',
    email: '',
    password: ''
  };

  handleSignUp = () => {
    const database = this.context.state.database;
    const { name, email, password } = this.state;
    const nameEmail = name + email;

    database.open().catch(function(e) {
      console.error('Open failed: ' + e.stack);
    });

    database
      .transaction('rw', database.users, async () => {
        const hasAlreadyRegistered = await database.users
          .where('[name+email]')
          .equals([name, email])
          .first();
        if (hasAlreadyRegistered) {
          alert(`User ${name} already registered`);
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
            password,
            nameEmail
          });
        }
      })
      .catch(e => {
        console.log(e.stack || e);
      });
  };
  render() {
    return (
      <MContext.Consumer>
        {() => (
          <Container>
            <Form onSubmit={this.handleSignUp}>
              {this.state.error && <p>{this.state.error}</p>}
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
              <Divider horizontal />
              <Link to="/login">Sign in</Link>
            </Form>
          </Container>
        )}
      </MContext.Consumer>
    );
  }
}

export default SignUp;
