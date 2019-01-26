import React, { Component } from 'react';
import Login from './Login';
import { isLoggedIn } from '../Utils/KtuApi';

class App extends Component {
  constructor(props) {
    super(props);

    this.state = { status: false };
  }

  componentDidMount() {
    isLoggedIn()
      .then((loggedIn) => {
        this.setState({ status: loggedIn });
      });
  }

  render() {
    const { status } = this.state;

    return (
      <div>
        {status ? (
          <h1>
            You are already logged in
          </h1>
        ) : (
          <Login />
        )}
      </div>
    );
  }
}

export default App;
