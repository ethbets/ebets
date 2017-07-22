import React from 'react';
import moment from 'moment';
import { betTimeStates } from './betStates';

class Clock extends React.Component {
  secondsToEnd = 0;
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
    // Match is happening
    if (moment().unix() >= this.props.beginDate) {
      if (this.props.parentState !== betTimeStates.matchRunning && 
          this.props.parentState !== betTimeStates.matchEnded) {
        console.log(moment().unix(), this.props.endDate)
        console.log('nottifying match Running');
        this.props.updateState(betTimeStates.matchRunning);
      }
      // Match ended
      if (moment().unix() >= this.props.endDate) {
        if (this.props.parentState !== betTimeStates.matchEnded) {
          console.log('nottifying match end');
          this.props.updateState(betTimeStates.matchEnded);
          this.setState({notifiedParentAboutMatchEnd : true});
        }
      }
    }
  }

  componentDidMount() {
    this.interval = setInterval(this.tick, 1000);
  }

  componentWillUnmount() {
    clearInterval(this.interval);
  }

  render() {
    // Calculate the formatted date on the fly
    var secondsToBegin = this.props.beginDate - moment().unix();
    
    //secondsToBegin = (moment().unix() + 1033) - moment().unix();
    //this.secondsToEnd = 10; 

    var days = secondsToBegin / (60 * 60 * 24);
    days = Math.floor(days);
    secondsToBegin -= days * (60 * 60 * 24);
    var hours = secondsToBegin / (60 * 60);
    hours = Math.floor(hours);
    secondsToBegin -= hours * (60 * 60);
    var minutes = secondsToBegin / 60;
    minutes = Math.floor(minutes);
    secondsToBegin -= minutes * 60;

    if (days > 0)
      return(
        <div className='pushRight'>Begins in: {days}d {hours}h {minutes}m {secondsToBegin}s</div>
      );
    else if (hours > 0)
      return(
        <div className='pushRight'>Begins in: {hours}h {minutes}m {secondsToBegin}s</div>
      );
    else if (minutes > 0)
      return(
        <div className='pushRight'>Begins in: {minutes}m {secondsToBegin}s</div>
      );
    else
      return(
        <div className='pushRight'>Begins in: {secondsToBegin}s</div>
      );
  }
}
export default Clock;
