/* Copyright (C) 2017 ethbets
 * All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the BSD license. See the LICENSE file for details.
*/
import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { withStyles } from 'material-ui/styles';
import Button from 'material-ui/Button';
import { Link } from 'react-router-dom';
import withTheme from 'theme';

const styles = theme => ({
  button: {
    margin: theme.spacing.unit,
  },
});

const categories = ({...props}) => <Link to='/categories' {...props} />;

class LandingPage extends Component {
  render() {
    const { classes } = this.props;
    return (
      <div>
        <h1>Welcome to EBETS</h1>
        <Button 
          className={classes.button}
          variant="raised"
          color="primary"
          component={categories}
        >
          Start bet
        </Button>
      </div>
    );
  }
}

LandingPage.propTypes = {
  classes: PropTypes.object.isRequired,
};


export default withTheme(withStyles(styles)(LandingPage));