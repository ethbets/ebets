import React from 'react';
import {render} from 'react-dom';
import {Router, useRouterHistory} from 'react-router';
import Routes from './Routes';
import injectTapEventPlugin from 'react-tap-event-plugin';
import {createHashHistory} from 'history';
import {Web3Provider} from 'react-web3';


// Helpers for debugging
window.React = React;

// Needed for onTouchTap
// http://stackoverflow.com/a/34015469/988941
injectTapEventPlugin();

render(
  <Web3Provider>
    <Router
      history={useRouterHistory(createHashHistory)({queryKey: false})}
      onUpdate={() => window.scrollTo(0, 0)}
    >
      {Routes}
    </Router>
  </Web3Provider>
, document.getElementById('app'));
