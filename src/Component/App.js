import React, { Component } from 'react';
import Login from './Login';

class App extends Component {
  constructor(props) {
    super(props);

    this.state = { status: false };
  }

  componentDidMount() {
    // chrome.storage.local.get(['authStatus'], (status) => {
    //   this.setState({ status });
    // });
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
