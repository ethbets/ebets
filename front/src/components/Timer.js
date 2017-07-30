import React from 'react';
import moment from 'moment';

import Chip from 'material-ui/Chip';
import * as MColors from 'material-ui/styles/colors';

import { betTimeStates, betState } from './betStates';

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
    // Match open
    if (moment().unix() < this.props.beginDate) {
      this.props.updateState(betTimeStates.matchOpen);
    }
    // Match running
    else if ((moment().unix() >= this.props.beginDate) &&
        (moment().unix() < this.props.endDate)) {
      this.props.updateState(betTimeStates.matchRunning);
    }// Match end
    else if ((moment().unix() >= this.props.endDate) &&
        (moment().unix() < this.props.resolverDeadline)) {
      this.props.updateState(betTimeStates.matchEnded);
    }
    // Match expired
    else if ((moment().unix() >= this.props.resolverDeadline) &&
        (moment().unix() < this.props.terminateDeadline)) {
      this.props.updateState(betTimeStates.matchExpired);
    }
    // Match can selfdestruct
    else if (moment().unix() > this.props.terminateDeadline) {
      this.props.updateState(betTimeStates.matchDestruct);
      clearInterval(this.interval);
    }
  }

  componentDidMount() {
    this.interval = setInterval(this.tick, 1000);
  }

  componentWillUnmount() {
    clearInterval(this.interval);
  }

  render() {
    var deltaSeconds;
    var msgString;
    if (this.props.parentState === betState.matchOpen) {
      deltaSeconds = this.props.beginDate.toNumber() - moment().unix();
      msgString = 'Begins in: ';
    }
    else if (this.props.parentState === betState.matchRunning) {
      deltaSeconds = this.props.endDate.toNumber() - moment().unix();
      msgString = 'Ends in: '
    }
    else if (this.props.parentState === betState.shouldCallArbiter) {
      deltaSeconds = this.props.resolverDeadline.toNumber() - moment().unix();
      msgString = 'Should call arbiter in: '
    }
    else if (this.props.parentState === betState.calledArbiter) {
      deltaSeconds = this.props.resolverDeadline.toNumber() - moment().unix();
      msgString = 'Arbiter must answer in: '
    }
    else if (this.props.parentState === betState.betExpired) {
      deltaSeconds = this.props.terminateDeadline.toNumber() - moment().unix();
      msgString = 'Bet expired, must decide to draw in: '
    }
    else {
      // Bet expired!
      if (moment().unix() > this.props.terminateDeadline.toNumber()) {
        msgString = 'Bet terminated, can call self-destruct!'
        return (
          <div className='pushRight'>
            <Chip backgroundColor={MColors.white}>
              {msgString}
            </Chip>
          </div>
        );
      }
      else {
        deltaSeconds = this.props.terminateDeadline.toNumber() - moment().unix();
        msgString = 'Have decision, must collect reward in: '
      }
    }

    var days = deltaSeconds / (60 * 60 * 24);
    days = Math.floor(days);
    deltaSeconds -= days * (60 * 60 * 24);
    var hours = deltaSeconds / (60 * 60);
    hours = Math.floor(hours);
    deltaSeconds -= hours * (60 * 60);
    var minutes = deltaSeconds / 60;
    minutes = Math.floor(minutes);
    deltaSeconds -= minutes * 60;

    var result_str;
    if (days > 0)
      result_str = days + 'd ' + hours + 'h ' + minutes + 'm ' + deltaSeconds + 's';
    else if (hours > 0)
      result_str = hours + 'h ' + minutes + 'm ' + deltaSeconds + 's';
    else if (minutes > 0)
      result_str = minutes + 'm ' + deltaSeconds + 's';
    else
      result_str = deltaSeconds + 's';

    return(
        <div className='pushRight'>
          <Chip backgroundColor={MColors.white}>
            {msgString} {result_str}
          </Chip>
        </div>
      );
  }
}
export default Clock;
