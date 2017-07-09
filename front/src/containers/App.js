import React, { Component } from 'react';
import {
  BrowserRouter as Router,
  Route,
  Link
} from 'react-router-dom';
import PropTypes from 'prop-types';
import AppBar from 'material-ui/AppBar';
import Drawer from 'material-ui/Drawer';
import MenuItem from 'material-ui/MenuItem';
import getMuiTheme from 'material-ui/styles/getMuiTheme';

import Home from 'components/Home';
import BetForm from 'components/BetForm';
import Ebets from 'components/Ebets'

import 'containers/App.css';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = { open: false };
    this.toggleNavigation = this.toggleNavigation.bind(this);
  }

  getChildContext() {
    return {
      muiTheme: this.state.muiTheme
    };
  }

  componentWillMount() {
    this.setState({
      muiTheme: getMuiTheme()
    });
  }

  toggleNavigation() {
    this.setState({open: !this.state.open});
  }

  render() {
    return (
      <Router>
        <div id="app">
          <Ebets />
          <AppBar
            title="Ebets"
            onLeftIconButtonTouchTap={this.toggleNavigation} />
          <Drawer
            open={this.state.open}
            docked={false}
            onRequestChange={(open) => this.setState({open})} >
            <AppBar
              title="Ebets"
              showMenuIconButton={false} />
            <Link to="/home" onTouchTap={this.toggleNavigation} className="nav-link">
              <MenuItem>Home</MenuItem>
            </Link>
            <Link to="/new_bets" onTouchTap={this.toggleNavigation} className="nav-link">
              <MenuItem>New Bet</MenuItem>
            </Link>
          </Drawer>
          <div className="page-content">
            {this.props.children}
          </div>
          <Route exact path="/" component={Home}/>
          <Route path="/home" component={Home}/>
          <Route path="/new_bets" component={BetForm}/>
        </div>
      </Router>
    );
  }
}

App.childContextTypes = {
  muiTheme: PropTypes.object.isRequired
};

export default App;
