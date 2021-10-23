import React, { Component } from 'react';
import './App.css';
import MyJointJS from './MyJointJS.js';
import Button from '@material-ui/core/Button';

class App extends Component {
  render() {
    return (
      <div className="App">
        <MyJointJS></MyJointJS>
      </div>
    );
  }
}

export default App;
