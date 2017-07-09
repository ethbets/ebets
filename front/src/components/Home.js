import React, { Component } from 'react';
import BetDetail from 'components/BetDetail';

class Home extends Component {

  render() {
    return (
      <div>
        <h1 className="page-title">Home</h1>
        <BetDetail />
      </div>
    );
  }
}

export default Home;