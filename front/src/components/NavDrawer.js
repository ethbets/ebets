/* Copyright (C) 2017 ethbets
 * All rights reserved.
 * 
 * This software may be modified and distributed under the terms
 * of the BSD license. See the LICENSE file for details.
*/

import React, { Component } from 'react';
import AppBar from 'material-ui/AppBar';
import Drawer from 'material-ui/Drawer';
import {List, ListItem, makeSelectable} from 'material-ui/List';
import Checkbox from 'material-ui/Checkbox';
import Visibility from 'material-ui/svg-icons/action/visibility';
import VisibilityOff from 'material-ui/svg-icons/action/visibility-off';
import Divider from 'material-ui/Divider';
import { zIndex } from 'material-ui/styles';

import { ebetsCategories } from 'utils/ebetsCategories';

const SelectableList = makeSelectable(List);

class NavDrawer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      showUnfeatured: false
    };
  }

  Navigations = () => {
    const getCategoriesRecursive = (category) => {
      if (!category.subcategory) {
        return <ListItem key={category.path}
          primaryText={`${category.name}`}
          value={`/category/${category.path}`}
          href={`#/category/${category.path}`}
        />
      }
      let categoryList = category.subcategory.map(cat => {
        return getCategoriesRecursive(cat);
      })

      return <ListItem key={`${category.name}`}
          primaryText={`${category.name}`}
          primaryTogglesNestedList={true}
          nestedItems={categoryList}
        />
    }

    const getCategoriesNav = () => {
      return ebetsCategories.map(category => {
       return getCategoriesRecursive(category);
      });
    }

    const {
      location,
      onRequestChangeNavDrawer,
      onChangeList,
    } = this.props;

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
        {getCategoriesNav()}
      </SelectableList>
    </Drawer>
  }
  render() {
    return <this.Navigations />
  }
}

export default NavDrawer;
