/* Copyright (C) 2017 ethbets
 * All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the BSD license. See the LICENSE file for details.
*/
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { withRouter } from 'react-router'

import { withStyles } from 'material-ui/styles';

import withTheme from '../theme';
import NavBar from './NavBar';
import AppDrawer from './AppDrawer';

const styles = theme => ({
  root: {
    backgroundColor: theme.palette.primary.main,
    display: 'flex',
    alignItems: 'stretch',
    minHeight: '100vh',
    width: '100%',
    height: '100%',
    marginTop: theme.spacing.unit * 3,
    zIndex: 1,
    overflow: 'hidden',
  },
  appFrame: {
    width: '100%',
    height: '100%',
    position: 'relative',
    display: 'flex',
  },
  content: {
    width: '100%',
    height: 'calc(100% - 100px)',
    marginLeft: theme.drawerWidth,
    marginTop: 100,
    flexGrow: 1,
    padding: theme.spacing.unit * 3,
    transition: theme.transitions.create(['margin', 'width'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    [theme.breakpoints.down('md')]: {
      marginLeft: 0,
    },
  },
  contentShift: {
    width: `calc(100% - ${theme.drawerWidth}px)`,
    marginLeft: theme.drawerWidth,
    transition: theme.transitions.create(['margin', 'width'], {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
  },
});

class Main extends Component {
  constructor(props) {
    super(props);

    this.state = {
      mobileOpen: false,
    };
  }

  handleDrawerToggle = () => {
    this.setState({ mobileOpen: !this.state.mobileOpen });
  }

  render() {
    const { classes, children, location } = this.props;
    const { mobileOpen } = this.state;
    return (
      <div className={classes.root} >
        <div className={classes.appFrame}>
          {/* <Header /> */}
          <NavBar
            location={location}
            mobileOpen={mobileOpen}
            handleDrawerToggle={this.handleDrawerToggle}
          />
          {/* <Notifications />*/}
          <AppDrawer
            mobileOpen={mobileOpen}
            handleDrawerToggle={this.handleDrawerToggle}
          />
          {/* <Content /> */}
          <main
            className={classNames(classes.content, mobileOpen && classes.contentShift)}
          >
            {children}
          </main>
          {/* <Footer /> */}
        </div>
      </div>
    );
  }
}

Main.propTypes = {
  children: PropTypes.node.isRequired,
  classes: PropTypes.object.isRequired,
  location: PropTypes.object.isRequired,
};

export default withRouter(withTheme(withStyles(styles)(Main)));
