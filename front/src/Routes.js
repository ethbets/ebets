import React from 'react';

import {
  Route,
  IndexRedirect
} from 'react-router';

import Master from './components/Master';
import FAQ from './components/FAQ';
import Ebets from './components/Ebets';
import CreateBet from './components/BetForm';
//import Arbiter from './components/Arbiter';

const Routes = (
  <Route path='/' component={Master}> 
    <IndexRedirect to="/category/all_bets" />
    <Route path='category'>
      <Route path=':category' component={Ebets} />
      <Route path=':category/:subcategory' component={Ebets} />
    </Route>
    <Route path='new_bet' component={CreateBet} />
    <Route path='faq' component={FAQ} />
  </Route>
);

export default Routes;
