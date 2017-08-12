import React, { Component } from 'react';
import AppBar from 'material-ui/AppBar';
import Drawer from 'material-ui/Drawer';
import {List, ListItem, makeSelectable} from 'material-ui/List';
import Checkbox from 'material-ui/Checkbox';
import Visibility from 'material-ui/svg-icons/action/visibility';
import VisibilityOff from 'material-ui/svg-icons/action/visibility-off';
import Divider from 'material-ui/Divider';
import { zIndex } from 'material-ui/styles';

//import '../assets/stylesheets/base.css';

const SelectableList = makeSelectable(List);

class NavDrawer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      showUnfeatured: false
    };
  }

  Navigations = () => {
    const {
      location,
      onRequestChangeNavDrawer,
      onChangeList,
    } = this.props;
    const style = {
      marginTop: 16,
      marginLeft:16,
      marginBottom: 16
    };
    return <Drawer
      open={true}
      docked={true}
      onRequestChange={onRequestChangeNavDrawer}
      containerStyle={{zIndex: zIndex.drawer - 100}}
    >
      <AppBar
        title='Ebets'
        showMenuIconButton={false} />
      <SelectableList
        value={location.pathname}
        onChange={onChangeList}
      >
        <ListItem 
          primaryText='FAQ'
          value='/faq'
          href='#/faq'
          />
        <ListItem 
          primaryText='My Bets'
          value='/category/my_bets'
          href='#/category/my_bets'
          />
        <ListItem 
          primaryText='Create bet'
          value='/new_bet'
          href='#/new_bet'
          />
          <ListItem 
          primaryText='Arbiters'
          value='/arbiters'
          href='#/arbiters'
          />
          <Divider />
          <ListItem
            onTouchTap={() => {
              this.props.onToggleUnfeatured(!this.state.showUnfeatured);
              this.setState(previousState => ({showUnfeatured: !previousState.showUnfeatured}))}}
          >
          <Checkbox 
            labelPosition='left'label='Unfeatured'
            checkedIcon={ <Visibility /> }
            uncheckedIcon={ <VisibilityOff /> }
            checked={this.state.showUnfeatured}
          />
          </ListItem>
        <ListItem
          primaryText='All'
          value='/category/all_bets'
          href='#/category/all_bets'
        />
        <ListItem
          primaryText='E-Sports'
          primaryTogglesNestedList={true}
          nestedItems={[
              <ListItem key='1'
                primaryText='League of Legends'
                value='/category/esports/lol'
                href='#/category/esports/lol'
              />,
              <ListItem key='2'
                primaryText='CS-GO'
                value='/category/esports/csgo'
                href='#/category/esports/csgo'
              />,
            ]}
        />
        <ListItem
          primaryText='UFC'
          value='/category/ufc'
          href='#/category/ufc'
        />
        <ListItem
          primaryText='Football'
          value='/category/football'
          href='#/category/football'
        />
      </SelectableList>
    </Drawer>
  }
  render() {
    return <this.Navigations />
  }
}

export default NavDrawer;
