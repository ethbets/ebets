import React from 'react';
import { MuiThemeProvider, createMuiTheme } from 'material-ui/styles';
import Reboot from 'material-ui/Reboot';

// Color palette
const black = "#393939";
const greyishBrown = "#3d3d3d";
const coolGreyTwo= "#8b8e90";
const coolGrey = "#95989a";
const fadedBlue= "#5b8db9";
const softBlue= "#65a8e2";
const lightblueTwo = "#61bdee";
const lightBlue= "#60caf6";
const white= "#e4e4e4";

const theme = createMuiTheme({
  palette: {
    type: 'dark',
    primary: {
      light: coolGrey,
      main: greyishBrown,
      dark: black,
      contrastText: lightblueTwo,
    },
    secondary: {
      light: lightBlue,
      main: softBlue,
      dark: fadedBlue,
      contrastText: white,
    },
  },
  overrides: {
    MuiButton: {
      root: {
        color: softBlue,
        '&:hover': {
          color: white,
          backgroundColor: softBlue,
          borderRadius: 3,
          border: 0,
        }
      },
    },
  },
  drawerWidth: 250,
  navBarHeight: 120,
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
