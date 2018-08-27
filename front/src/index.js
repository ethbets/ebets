/* Copyright (C) 2017 ethbets
 * All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the BSD license. See the LICENSE file for details.
*/
import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter as Router } from 'react-router-dom';

import MomentUtils from 'material-ui-pickers/utils/moment-utils';
import MuiPickersUtilsProvider from 'material-ui-pickers/utils/MuiPickersUtilsProvider';

import { routes } from './Routes';

ReactDOM.render(
  <MuiPickersUtilsProvider utils={MomentUtils}>
      <Router>{routes}</Router>
  </MuiPickersUtilsProvider>,
  document.getElementById('root'),
);

if (module.hot) {
  module.hot.accept();
}
