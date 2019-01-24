import React, { Component } from 'react';
import Login from './Login';

class App extends Component {
  constructor(props) {
    super(props);
    
    this.state = {status : false};

    chrome.storage.local.get(['authStatus'], (status) => {
      this.setState(status);
    });
  }
  
  render() {
    return (
      <Login />
    );
  }
}

export default App;

