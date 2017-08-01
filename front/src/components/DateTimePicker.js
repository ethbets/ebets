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
      dateTime: null
    }
  }
  
  onSelectedDate = (err, dateObject) => {
    this.setState({_selectedDate : dateObject});
    this.dueDatePicker.show();
  }

  onSelectedTime = (dateObject) => {
      const momentDate = new moment(this.state._selectedDate);
      const momentTime = new moment(dateObject);
      const dateTime = new moment({
          year: momentDate.year(),
          month: momentDate.month(),
          day: momentDate.date(),
          hour: momentTime.hours(),
          minute: momentTime.minutes()
      });
      this.setState({dateTime: dateTime});
      this.props.onChange(dateTime);
      this.dueDatePicker.dismiss();
  }

  openTimePicker = () => {
    this.dueDatePicker.show();
  };

  dateTimeFormatter = (date) => {
    if (this.state.dateTime === null)
      return moment(date).format('LLLL');
    return this.state.dateTime.format('LLLL');
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
                    //value={}
                    onChange={this.onSelectedDate}
        />
      </div>
    )
  }

}

export default DateTimePicker;
