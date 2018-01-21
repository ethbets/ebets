/* Copyright (C) 2017 ethbets
 * All rights reserved.
 * 
 * This software may be modified and distributed under the terms
 * of the BSD license. See the LICENSE file for details.
*/

import React from 'react';
import {render} from 'react-dom';
import {Router, useRouterHistory} from 'react-router';
import Routes from './Routes';
import injectTapEventPlugin from 'react-tap-event-plugin';
import {createHashHistory} from 'history';

// Helpers for debugging
window.React = React;

// Needed for onTouchTap
// http://stackoverflow.com/a/34015469/988941
injectTapEventPlugin();
class Index extends React.Component {
  constructor(props) {
    super(props);
  }
  render() {
    return (
        <Router
          history={useRouterHistory(createHashHistory)({queryKey: false})}
          onUpdate={() => window.scrollTo(0, 0)}
        >
          {Routes}
        </Router>
    );
  }
}

render(<Index />, document.getElementById('app'));
