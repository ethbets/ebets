/* Copyright (C) 2017 ethbets
 * All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the BSD license. See the LICENSE file for details.
*/
import React from 'react';
import PropTypes from 'prop-types';

import { withStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import Drawer from '@material-ui/core/Drawer';
import Hidden from '@material-ui/core/Hidden';

import ebetsLogo from 'assets/imgs/logo-blue.png';
import Categories from 'components/Categories';

const styles = theme => ({
  drawerHeader: {
    backgroundColor: theme.palette.primary.dark,
    height: theme.navBarHeight,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    ...theme.mixins.toolbar,
  },
  drawerPaper: {
    width: theme.drawerWidth,
  },
  toolbar: {
    display: 'flex',
    flexGrow: 1,
    justifyContent: 'center',
    ...theme.mixins.toolbar,
  },
  ebetsLogo: {
    width: 68,
    height: 85,
  },
  menus: {
    margin: 24,
  }
});

const AppDrawer = (props) => {
  const { classes, mobileOpen, handleDrawerToggle } = props;

  const drawer = (
    <div className={classes.menus}>
      <Typography
        variant="title"
        color='secondary'
        noWrap
      >
        Categories
      </Typography>
      <Categories />
    </div>
  );
  return (
    <div>
      <Hidden lgUp>
        <Drawer
          classes={{
            paper: classes.drawerPaper,
          }}
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true,
          }}
        >
          {drawer}
        </Drawer>
      </Hidden>
      <Hidden mdDown>
        <Drawer
          classes={{
            paper: classes.drawerPaper,
          }}
          variant="permanent"
          open={mobileOpen}
        >
          <div className={classes.drawerHeader}>
            <div className={classes.toolbar}>
              <img className={classes.ebetsLogo} src={ebetsLogo} />
            </div>
          </div>
          {drawer}
        </Drawer>
      </Hidden>
    </div>
  );
};

AppDrawer.propTypes = {
  classes: PropTypes.object.isRequired,
  mobileOpen: PropTypes.bool.isRequired,
  handleDrawerToggle: PropTypes.func.isRequired,
};

export default withStyles(styles)(AppDrawer);
