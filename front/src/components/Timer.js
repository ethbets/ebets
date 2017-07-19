import React from 'react';
import moment from 'moment';

class Clock extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      dateTimestamp : Date.now()
    };
    this.tick = this.tick.bind(this);
  }

  tick() {
    this.setState({
      dateTimestamp: this.state.dateTimestamp - 1000
    });
  }

  componentDidMount() {
    this.interval = setInterval(this.tick, 1000);
  }

  componentWillUnmount() {
    clearInterval(this.interval);
  }

  render() {
    // Calculate the formatted date on the fly
    var secondsToBegin = this.props.date - moment().unix();

    const date = secondsToBegin;
    return(
      <div className='pushRight'>Begins in: {date}s</div>
    );
  }
}
export default Clock;
