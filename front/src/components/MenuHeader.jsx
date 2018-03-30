/* Copyright (C) 2017 ethbets
 * All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the BSD license. See the LICENSE file for details.
*/
import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';

import { withStyles } from 'material-ui/styles';

import { menus } from 'Routes';
import Item from 'components/Item';

const styles = (theme) => ({
  container: {
    height: theme.navBarHeight,
    display: 'flex',
    flexDirection: 'row',
    padding: 0,
  }
});

const MenuHeader = (props) => {
  const { classes } = props;
  const renderMenuItem = ({text, path}, key) => {
    return (
      <Item 
        key={key}
        path={path}
        text={text}
      />
    );
  }
  const menuList = _.map(menus, renderMenuItem);
  return (
    <div className={classes.container}> {menuList} </div>
  );
};

MenuHeader.propTypes = {
  classes: PropTypes.object.isRequired,
}

export default withStyles(styles)(MenuHeader);
