import React, { Component } from 'react';
import AppBar from 'material-ui/AppBar';
import Drawer from 'material-ui/Drawer';
import {List, ListItem, makeSelectable} from 'material-ui/List';
import Subheader from 'material-ui/Subheader';

import Divider from 'material-ui/Divider';
import { zIndex } from 'material-ui/styles';

import '../assets/stylesheets/base.css';

const SelectableList = makeSelectable(List);

class NavDrawer extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    const {
      location,
      docked,
      onRequestChangeNavDrawer,
      onChangeList,
      open,
      style,
    } = this.props;

    return (
      <Drawer
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
          <Subheader>Categories</Subheader>
          <ListItem
            primaryText='All'
            value='/category/all_bets'
            href='#/category/all_bets'
          />
          <ListItem
            primaryText='E-Sports'
            primaryTogglesNestedList={true}
            nestedItems={[
                <ListItem
                  primaryText="League of Legends"
                  value="/category/esports/lol"
                  href="#/category/esports/lol"
                />,
                <ListItem
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
            primaryText="Soccer"
            value="/category/football"
            href="#/category/football"
          />
          <Divider />
          <ListItem 
            primaryText='Unfeatured'
            value='/category/unfeatured'
            href='#/category/unfeatured'
            />
        </SelectableList>
      </Drawer>
    );
  }
}

export default NavDrawer;
