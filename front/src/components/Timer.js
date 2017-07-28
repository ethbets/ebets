import React from 'react';
import moment from 'moment';

import Chip from 'material-ui/Chip';
import * as MColors from 'material-ui/styles/colors';

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

    if (this.props.parentState !== betTimeStates.matchBegin)
      return null;

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

    var result_str;
    if (days > 0)
      result_str = days + 'd ' + hours + 'h ' + minutes + 'm ' + secondsToBegin + 's';
    else if (hours > 0)
      result_str = hours + 'h ' + minutes + 'm ' + secondsToBegin + 's';
    else if (minutes > 0)
      result_str = minutes + 'm ' + secondsToBegin + 's';
    else
      result_str = secondsToBegin + 's';

    return(
        <div className='pushRight'>
          <Chip backgroundColor={MColors.blueGrey50}>
            {result_str}
          </Chip>
        </div>
      );

  }
}
export default Clock;
