/* Copyright (C) 2017 ethbets
 * All rights reserved.
 * 
 * This software may be modified and distributed under the terms
 * of the BSD license. See the LICENSE file for details.
*/

import React from 'react';

import {Route, IndexRedirect} from 'react-router';

import Master from 'components/Master';
import FAQ from 'components/FAQ';
import Ebets from 'components/Ebets';
import CreateBet from 'components/BetForm';
import Arbiters from 'components/Arbiters';

const Routes = (
  <Route path='/' component={Master}> 
    <IndexRedirect to="/category/all_bets" />
    <Route path='category'>
      <Route path=':category' component={Ebets} perPage={4} />
      <Route path=':category/:subcategory' component={Ebets} perPage={4} />
    </Route>

    <Route path='bet/:address' component={Ebets} perPage={4} />
    <Route path='new_bet' component={CreateBet} />
    <Route path='faq' component={FAQ} />
    <Route path='arbiters' component={Arbiters} />
  </Route>
);

export default Routes;
