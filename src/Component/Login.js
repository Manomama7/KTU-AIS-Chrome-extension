import React, { Component } from 'react';
import './Login.css';

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

    chrome.runtime.getBackgroundPage((backgroundPage) => {
      backgroundPage.Authenticate(this.state.username, this.state.password)
        .then((response) => {
          // TODO: Login success in the UI
          console.log('Login success!');
          console.log(response);
          this.setState({
            loggingIn: false,
            loggedIn: true,
          });
        })
        .catch((error) => {
          console.log('Login failed!');
          console.log(error);
          this.setState({
            loggingIn: false,
            error: true,
          });
        });
    });
  }

  render() {
    const errorClassNames = `alert alert-danger${this.state.error ? ' show-alert' : ''}`;
    const loginContainerClassNames = `login-container${this.state.loggingIn ? ' logging-in' : ''}`;
    const formContainerClassNames = `login-form ${this.state.loggedIn ? 'minimized' : ''}`;
    const formClassNames = `form-signin text-center ${this.state.loggedIn ? 'logged-in' : ''}`;

    return (
      <div className={loginContainerClassNames} >
        <form className={formClassNames} onSubmit={this.handleSubmit}>
          <div className="d-flex mb-3 justify-content-start logo-container">
            <div className="login-success-bubble" >
              Hi, student!
              <div className="arrow" />
            </div>

            <h1 className="login-header">Login</h1>

            <div className="ml-4 text-white d-flex align-items-center loading-spinner" >
              <i className="fas fa-pulse fa-spinner fa-2x" />
            </div>
          </div>
          <fieldset disabled={this.state.loggingIn}>

            <div className={formContainerClassNames} >
              <div>
                <div className="mb-4">
                  <div className="form-group form-group-1">
                    <input
                      type="text"
                      name="username"
                      className="form-control"
                      placeholder="Email"
                      onChange={this.handleChange}
                      required
                    />
                  </div>

                  <div className="form-group form-group-2">
                    <input
                      type="password"
                      name="password"
                      className="form-control"
                      placeholder="Password"
                      onChange={this.handleChange}
                      required
                    />
                  </div>
                </div>

                <div className={errorClassNames}>
                  <i className="fas fa-exclamation-circle" />
                   Wrong username or password
                </div>

                <button
                  className="btn btn-outline-light btn-lg btn-block form-group-3"
                  type="submit"
                >
                Log in
                </button>
              </div>
            </div>
          </fieldset>
        </form>
      </div>
    );
  }
}

export default Login;
