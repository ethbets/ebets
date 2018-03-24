/* Copyright (C) 2017 ethbets
 * All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the BSD license. See the LICENSE file for details.
*/
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Link, withRouter } from 'react-router-dom';

import { withStyles } from 'material-ui/styles';
import Typography from 'material-ui/Typography'
import {ListItem} from 'material-ui/List';
import Collapse from 'material-ui/transitions/Collapse';
import Button from 'material-ui/Button';

const styles = () => ({
  item: {
    display: 'block',
    padding: 0,
  },
  subItem: {
    display: 'flex',
    padding: 0,
  },
  button: {
    justifyContent: 'flex-start',
    textTransform: 'none',
    width: '100%',
  },
});

class Item extends Component {
  state = {
    open: false,
  };

  toggleSubItems = () => {
    this.setState({ open: !this.state.open });
  };

  render() {
    const handleButtonClick = () => {
      const { onClick } = this.props;
      if (onClick instanceof Function) {
        onClick();
      }
    };

    const {children, classes, text, path, depth} = this.props;
    const style = {
      paddingLeft: 12 * depth,
    };

    if (path) {
      return (
        <ListItem className={classes.subItem} disableGutters >
          <Button
            component={props => (
              <Link variant="button" to={path} {...props} />
            )}
            className={classes.button}
            disableRipple
            onClick={handleButtonClick}
            style={style}
          >
            <Typography color='secondary' noWrap>{text}</Typography>
          </Button>
        </ListItem>
      );
    }

    return (
      <ListItem className={classes.item} disableGutters >
        <Button
          className={classes.button}
          onClick={this.toggleSubItems}
          style={style}
        >
          <Typography color='secondary' noWrap>{text}</Typography>
        </Button>
        <Collapse in={this.state.open} timeout="auto" unmountOnExit>
          {children}
        </Collapse>
      </ListItem>
    );
  }
}

Item.defaultProps = {
  depth: 0,
  text: '',
};

Item.propTypes = {
  children: PropTypes.node,
  classes: PropTypes.object.isRequired,
  depth: PropTypes.number.isRequired,
  text: PropTypes.string.isRequired,
  path: PropTypes.string,
  onClick: PropTypes.func,
};

export default withStyles(styles)(Item);