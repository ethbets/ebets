/* Copyright (C) 2017 ethbets
 * All rights reserved.
 * 
 * This software may be modified and distributed under the terms
 * of the BSD license. See the LICENSE file for details.
*/

import React, {Component} from 'react';
import PropTypes from 'prop-types';
import AppBar from 'material-ui/AppBar';
import spacing from 'material-ui/styles/spacing';
import darkBaseTheme from 'material-ui/styles/baseThemes/darkBaseTheme';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import {darkWhite, lightWhite, grey900} from 'material-ui/styles/colors';
import withWidth, {MEDIUM, LARGE} from 'material-ui/utils/withWidth';
import WarningIcon from 'material-ui/svg-icons/alert/warning';
import {red500} from 'material-ui/styles/colors';

import {getParsedCategories} from 'utils/ebetsCategories';

import NavDrawer from './NavDrawer';

class Master extends Component {
  static propTypes = {
    children: PropTypes.node,
    location: PropTypes.object,
    width: PropTypes.number.isRequired,
  };

  static contextTypes = {
    router: PropTypes.object.isRequired,
  };

  static childContextTypes = {
    muiTheme: PropTypes.object,
    showUnfeatured: PropTypes.bool
  };

  state = {
    navDrawerOpen: false,
    showUnfeatured: false
  };

  getChildContext() {
    return {
      muiTheme: this.state.muiTheme,
      showUnfeatured: this.state.showUnfeatured      
    };
  }

  componentWillMount() {
    this.setState({
      muiTheme: getMuiTheme(darkBaseTheme),
    });
  }

  componentWillReceiveProps(nextProps, nextContext) {
    const newMuiTheme = nextContext.muiTheme ? nextContext.muiTheme : this.state.muiTheme;
    this.setState({
      muiTheme: newMuiTheme,
    });
  }

  getStyles() {
    const styles = {
      v1: {
        height: 40,
        backgroundColor: '#2196f3',
        display: 'flex',
        color: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'fixed',
        top: 0,
        width: '100%',
        zIndex: this.state.muiTheme.zIndex.appBar + 1,
      },
      v1Spacer: {
        height: 40,
      },
      appBar: {
        position: 'fixed',
        // Needed to overlap the examples
        zIndex: this.state.muiTheme.zIndex.appBar + 1,
        marginLeft: 30,
        top: 0,
      },
      root: {
        paddingTop: spacing.desktopKeylineIncrement,
        minHeight: 400,
      },
      content: {
        margin: spacing.desktopGutter,
      },
      contentWhenMedium: {
        margin: `${spacing.desktopGutter * 2}px ${spacing.desktopGutter * 3}px`,
      },
      footer: {
        backgroundColor: grey900,
        textAlign: 'center',
      },
      a: {
        color: darkWhite,
      },
      p: {
        margin: '0 auto',
        padding: 0,
        color: lightWhite,
        maxWidth: 356,
      },
      browserstack: {
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        margin: '25px 15px 0',
        padding: 0,
        color: lightWhite,
        lineHeight: '25px',
        fontSize: 12,
      },
      browserstackLogo: {
        margin: '0 3px',
      },
      iconButton: {
        color: darkWhite,
      },
    };

    if (this.props.width === MEDIUM || this.props.width === LARGE) {
      styles.content = Object.assign(styles.content, styles.contentWhenMedium);
    }

    return styles;
  }

  handleTouchTapLeftIconButton = () => {
    this.setState({
      navDrawerOpen: !this.state.navDrawerOpen,
    });
  };

  handleChangeList = (event, value) => {
    if (typeof value === 'object') {
      return;
    }
    if (value) {
      this.props.router.push(value);
    }
  };

  handleChangeMuiTheme = (muiTheme) => {
    this.setState({
      muiTheme: muiTheme,
    });
  };

  toggleUnfeatured = (featured) => {
    this.setState({showUnfeatured: featured});
  }

  tabTitle(path) {
    if (path === '/new_bet')
      return 'New bet';
    if (path === '/faq')
      return 'F.A.Q.';
    if (path === '/arbiters')
      return 'Arbiters';
    if (path.endsWith('/all_bets'))
      return 'All bets';
    if (path.endsWith('/my_bets'))
      return 'My bets';

    var cats = getParsedCategories();
    for(var i in cats) {
      var c = cats[i]
      if (path.endsWith(c.key))
        return c;
    }

    return null;
  }

  tabTitleDiv(path) {
    return (
      <div style={{marginLeft: 12}}>
        {this.tabTitle(path)}
      </div>
    );
  }

  render() {
    const {
      location,
      children,
    } = this.props;

    const styles = this.getStyles();

    styles.navDrawer = {
      zIndex: styles.appBar.zIndex - 1,
    };
    styles.root.paddingLeft = 256;
    styles.footer.paddingLeft = 256;

    const web3Context = this.context.web3;
    var errorMessage = null;
    if (web3Context.networkId !== null && web3Context.networkId !== '42' && web3Context.networkId !== '3') {
      errorMessage = <div style={{display: 'flex', flexFlow: 'row', alignItems: 'center'}}> <WarningIcon color={red500} style={{marginLeft: 12, marginRight: 12}}/>
        <span>Ebets runs only in the Kovan or Ropsten networks, please switch to use the Dapp</span>
      </div>;
      //this.props.router.push('');
    }
    else if (web3Context.accounts.length === 0) {
      errorMessage = <div style={{display: 'flex', flexFlow: 'row', alignItems: 'center'}}> <WarningIcon color={red500} style={{marginLeft: 12, marginRight: 12}}/>
        <span>Make sure you unlock or have at least one account in your wallet</span>
      </div>;
    }
    return (
      <div>
        <div style={{marginLeft: 210}}>
          <AppBar
          onLeftIconButtonTouchTap={this.handleTouchTapLeftIconButton}
          title={(errorMessage === null ) ? this.tabTitleDiv(this.props.location.pathname) : errorMessage}
          zDepth={0}
          style={styles.appBar}
          showMenuIconButton={false}
        />
          <div style={{marginTop: 73}}>
            {children}
          </div>
        </div>
        <NavDrawer
          style={styles.navDrawer}
          location={location}
          docked={true}
          open={true}
          onChangeList={this.handleChangeList}
          onToggleUnfeatured={this.toggleUnfeatured.bind(this)}
        />
      </div>
    );
  }
}

Master.contextTypes = {
  web3: PropTypes.object
};


export default withWidth()(Master);
