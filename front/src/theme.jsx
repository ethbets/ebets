import React from 'react';
import { MuiThemeProvider, createMuiTheme } from 'material-ui/styles';
import Reboot from 'material-ui/Reboot';

const theme = createMuiTheme({
  palette: {
    type: 'light',
  },
  drawerWidth: 240,
});

function withTheme(Component) {
  return props => (
    <MuiThemeProvider theme={theme}>
      <Reboot />
      <Component {...props} />
    </MuiThemeProvider>
  );
}

export default withTheme;
