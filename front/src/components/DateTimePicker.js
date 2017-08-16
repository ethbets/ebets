/* Copyright (C) 2017 ethbets
 * All rights reserved.
 * 
 * This software may be modified and distributed under the terms
 * of the BSD license. See the LICENSE file for details.
*/

import DatePicker from 'material-ui/DatePicker';
import ReactTestUtils from 'react-dom/test-utils';
import TimePickerDialog from './TimePicker/TimePickerDialog';
import lodash from 'lodash';
import moment from 'moment';

import React, { Component } from 'react';

class DateTimePicker extends Component {
  constructor(props) {
    super(props);
    this.state = {
      _selectedDate: null,
      dateTime: this.props.defaultDate
    }
  }
  
  onSelectedDate = (err, dateObject) => {
    this.setState({_selectedDate : moment(dateObject)});
    this.dueDatePicker.show();
  }

  onSelectedTime = (timeObject) => {
      const momentDate = new moment(this.state._selectedDate);
      const momentTime = new moment(timeObject);
      const dateTime = new moment({
          year: momentDate.year(),
          month: momentDate.month(),
          day: momentDate.date(),
          hour: momentTime.hours(),
          minute: momentTime.minutes()
      });
      this.setState({dateTime: dateTime.toDate()});
      this.props.onChange(dateTime);
      this.dueDatePicker.dismiss();
  }

  openTimePicker = () => {
    this.dueDatePicker.show();
  };

  dateTimeFormatter = (date) => {
    var returnDate;
    if (moment(this.props.defaultDate).isAfter(moment(date))) {
      returnDate = this.props.defaultDate;
    }
    else
      returnDate = date;
    return moment(returnDate).format('LLL');
  }

  render() {
    return (
      <div>
        <TimePickerDialog ref={(e) => this.dueDatePicker = e}
                    initialTime={this.props.initialTime}
                    firstDayOfWeek={0}
                    onAccept={this.onSelectedTime}
                  />
        <DatePicker floatingLabelText={this.props.floatingLabelText}
                    formatDate={this.dateTimeFormatter}
                    value={this.state.dateTime}
                    defaultDate={this.props.defaultDate}
                    onChange={this.onSelectedDate}
        />
      </div>
    )
  }

}

export default DateTimePicker;
