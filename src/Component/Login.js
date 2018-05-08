import React, { Component } from 'react';
import './Login.css';

class Login extends Component {
  constructor(props) {
    super(props);

    this.loginError = React.createRef();

    this.state = {
      username: null,
      password: null,
      error: false,
      loggingIn: false,
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

    if (this.state.username === 'username' && this.state.password === 'password') {
      console.log('You have inputted the correct username and password');
    } else {
      this.setState({ error: true });
    }

    // Mimics true login
    setTimeout(() => {
      this.setState({ loggingIn: false });
    }, 3000);
  }

  render() {
    const errorClassNames = `alert alert-danger${this.state.error ? ' show-alert' : ''}`;
    const loginContainerClassNames = `login-container${this.state.loggingIn ? ' logging-in' : ''}`;

    return (
      <div className={loginContainerClassNames} >
        <form className="form-signin text-center" onSubmit={this.handleSubmit}>
          <div className="d-flex mb-3 justify-content-start logo-container">
            <h1 className="login-header">Login</h1>

            <div className="ml-4 text-white d-flex align-items-center loading-spinner" >
              <i className="fas fa-pulse fa-spinner fa-2x" />
            </div>
          </div>
          <fieldset disabled={this.state.loggingIn}>

            <div className="login-form" >
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

                <div className={errorClassNames} ref={this.loginError}>
                  <i className="fas fa-exclamation-circle" /> Wrong username or password
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
