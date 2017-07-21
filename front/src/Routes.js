import React from 'react';

import {
  Route,
  Redirect,
  IndexRoute,
  IndexRedirect
} from 'react-router';

import Master from './components/Master';
import Ebets from './components/Ebets';
import CreateBet from './components/BetForm';

const Routes = (
  <Route path='/' component={Master}> 
    <IndexRedirect to="/category/all_bets" />
    <Route path='category'>
      <Route path=':category' component={Ebets} />
      <Route path=':category/:subcategory' component={Ebets} />
    </Route>
    <Route path='new_bet' component={Ebets} />
  </Route>
);

export default Routes;
