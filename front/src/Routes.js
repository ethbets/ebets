import React from 'react';

import {
  Route,
  Redirect,
  IndexRoute,
} from 'react-router';

import Master from './components/Master';
import Ebets from './components/Ebets';

const Routes = (
  <Route path='/' component={Master}>
    <Route path='category'>
      <Route path=':category' component={Ebets} />
      <Route path=':category/:subcategory' component={Ebets} />
    </Route>
  </Route>
);

export default Routes;
