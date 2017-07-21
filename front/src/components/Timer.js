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
    var seconds = this.props.date - moment().unix();
    var days = seconds / (60 * 60 * 24);
    days = Math.floor(days);
    seconds -= days * (60 * 60 * 24);
    var hours = seconds / (60 * 60);
    hours = Math.floor(hours);
    seconds -= hours * (60 * 60);
    var minutes = seconds / 60;
    minutes = Math.floor(minutes);
    seconds -= minutes * 60;

    if (days > 0)
      return(
        <div className='pushRight'>Begins in: {days}d {hours}h {minutes}m {seconds}s</div>
      );
    else if (hours > 0)
      return(
        <div className='pushRight'>Begins in: {hours}h {minutes}m {seconds}s</div>
      );
    else if (minutes > 0)
      return(
        <div className='pushRight'>Begins in: {minutes}m {seconds}s</div>
      );
    else
      return(
        <div className='pushRight'>Begins in: {seconds}s</div>
      );
  }
}
export default Clock;
