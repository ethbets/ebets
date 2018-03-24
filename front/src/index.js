/* Copyright (C) 2017 ethbets
 * All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the BSD license. See the LICENSE file for details.
*/
import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter as Router } from 'react-router-dom';

import { routes } from './Routes';

import './assets/stylesheets/index.css';

ReactDOM.render(
  <Router>{routes}</Router>,
  document.getElementById('root'),
);

if (module.hot) {
  module.hot.accept();
}
