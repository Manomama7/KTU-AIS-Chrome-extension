import React, { Component } from 'react';
import LoginForm from './LoginForm';

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

  handleChange(event) {
    const { name, value } = event.target;
    this.setState({ [name]: value });
  }

  handleSubmit(event) {
    event.preventDefault();
    this.setState({
      error: false,
      loggingIn: true,
    });

    const { username, password } = this.state;
    setTimeout(() => {
      if (username === 'username' && password === 'password') {
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
    }, 3000);


    // chrome.runtime.getBackgroundPage((backgroundPage) => {
    //   backgroundPage.Authenticate(this.state.username, this.state.password)
    //     .then((response) => {
    //       // TODO: Login success in the UI
    //       console.log('Login success!');
    //       console.log(response);
    //       this.setState({
    //         loggingIn: false,
    //         loggedIn: true,
    //       });

    //       chrome.runtime.getBackgroundPage(bg => bg.StartTimer());
    //     })
    //     .catch((error) => {
    //       console.log('Login failed!');
    //       console.log(error);
    //       this.setState({
    //         loggingIn: false,
    //         error: true,
    //       });
    //     });
    // });
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
