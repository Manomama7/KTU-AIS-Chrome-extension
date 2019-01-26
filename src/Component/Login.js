import React, { Component } from 'react';
import LoginForm from './LoginForm';
import { loginAndStartTimer } from '../Utils/KtuApi';

class Login extends Component {
  constructor(props) {
    super(props);

    this.state = {
      username: null,
      password: null,
      error: false,
      loggingIn: false,
      loggedIn: false,
    };

    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleChange({ name, value }) {
    this.setState({ [name]: value });
  }

  handleSubmit(event) {
    event.preventDefault();
    this.setState({
      error: false,
      loggingIn: true,
    });

    const { username, password } = this.state;

    loginAndStartTimer(username, password)
      .then((loggedIn) => {
        if (loggedIn) {
          this.setState({
            loggingIn: false,
            loggedIn: true,
          });
        } else {
          this.setState({
            loggingIn: false,
            error: true,
          });
        }
      });
  }

  render() {
    const { loggingIn, loggedIn, error } = this.state;
    return (
      <LoginForm
        loading={loggingIn}
        success={loggedIn}
        error={error}
        handleFieldChange={this.handleChange}
        handleSubmit={this.handleSubmit}
      />
    );
  }
}

export default Login;
