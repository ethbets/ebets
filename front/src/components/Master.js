import React, {Component} from 'react';
import PropTypes from 'prop-types';
import AppBar from 'material-ui/AppBar';
import spacing from 'material-ui/styles/spacing';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import {darkWhite, lightWhite, grey900} from 'material-ui/styles/colors';
import withWidth, {MEDIUM, LARGE} from 'material-ui/utils/withWidth';
import WarningIcon from 'material-ui/svg-icons/alert/warning';
import {red500} from 'material-ui/styles/colors';

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
  };

  state = {
    navDrawerOpen: false,
  };

  getChildContext() {
    return {
      muiTheme: this.state.muiTheme,
    };
  }

  componentWillMount() {
    this.setState({
      muiTheme: getMuiTheme(),
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
    if (value) {
      this.props.router.push(value);
    }
  };

  handleChangeMuiTheme = (muiTheme) => {
    this.setState({
      muiTheme: muiTheme,
    });
  };

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
      errorMessage = <div> <WarningIcon color={red500}/> Ebets runs only in the Kovan network, please switch to use the Dapp</div>;
      //this.props.router.push('');
    }
    else if (web3Context.accounts.length === 0) {
      errorMessage = <div> <WarningIcon color={red500}/>
        Make sure you unlock or have at least one account in your wallet
      </div>;
    }
    
    return (
      <div>
        <div style={{marginLeft: 210}}>
          <AppBar
          onLeftIconButtonTouchTap={this.handleTouchTapLeftIconButton}
          title={(errorMessage === null ) ? this.props.location.pathname : errorMessage}
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
        />
      </div>
    );
  }
}

Master.contextTypes = {
  web3: PropTypes.object
};


export default withWidth()(Master);
