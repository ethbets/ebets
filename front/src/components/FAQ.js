import React, { Component } from 'react';
import HowDoesItWork from '../assets/imgs/Making-a-bet.png';

class FAQ extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    console.log('adasdasdasdas');
    return (
      <div style={{marginLeft: 280, marginTop: 90}}>
        <ul>
          <li>Why are you doing this?</li>
          <li>What are the fees?</li>
          <li>How do you guarantee not to steal my money?</li>
          <li>How do I play?</li>
          <li>What if I don't withdraw the amount I bet?</li>
          <li>Do you plan on going in the live network?</li>
          <li>Why trust just one oracle?</li>
          <li>Why your website is ugly?</li>
          <li>Where are the contracts?</li>
        </ul>
        <img style={{flex: 1,

    resizeMode: 'contain'}} src={HowDoesItWork} />
      </div>
    );
  }
}

export default FAQ;
