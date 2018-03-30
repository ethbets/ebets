/* Copyright (C) 2017 ethbets
 * All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the BSD license. See the LICENSE file for details.
*/
import React from 'react';
import {
  Route,
  Switch,
} from 'react-router-dom';

import Main from './components/Main';
import LandingPage from './components/LandingPage';
import Home from './components/Home';
import FAQ from './components/FAQ';
import Ebets from './components/Ebets';
import CreateBet from './components/BetForm';

const menus = {
  'faq': {
      text:'FAQ',
      path: "/faq",
  },
  'my_bets': {
      text:'My Bets',
      path: "/my_bets",
  },
  'create_bet': {
      text:'Create Bet',
      path: "/new_bet",
  },
  // 'arbiters': {
  //     text:'Arbiters',
  //     path: "/arbiters",
  // },
};

const routes = (
  <Switch>
    <Route exact path="/" component={LandingPage} />
    <Main>
        <Route path="/home" component={Home} />
        <Route path="/categories/:category?/:subcategory?" render={(props)=><Ebets perPage={4} {...props} />} />
        <Route path="/bet/:address" render={(props)=><Ebets perPage={4} {...props} />} />
        <Route path="/new_bet" component={CreateBet} />
        <Route path="/faq" component={FAQ} />
        {/* <Route path="/arbiters" component={Arbiters} /> */}
    </Main>
  </Switch>
);

export { routes, menus };