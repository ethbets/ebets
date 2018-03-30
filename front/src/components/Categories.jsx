/* Copyright (C) 2017 ethbets
 * All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the BSD license. See the LICENSE file for details.
*/
import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';

import List from 'material-ui/List';

import { ebetsCategories } from 'utils/ebetsCategories';
import Item from 'components/Item';

const snakeName = (name) => {
  return name.toLowerCase().replace(/ /g,"_");
};

class Categories extends Component {
  constructor(props) {
    super(props);

    this.state = {
      showUnfeatured: false,
    };
  }
 
  reduceSubItems = ({ items, category, depth }) => {
    const subcategory = category.subcategory;
    if (!subcategory) {
      const path = '/categories/' + category.path;
      items.push(
        <Item 
        key={snakeName(category.name)}
        depth={depth}
        path={path}
        text={category.name} 
        />
      );
    } else {
      items.push(
        <Item 
          key={snakeName(category.name)}
          depth={depth}
          text={category.name} 
        >
          {this.renderNavItems(subcategory, depth + 1)}
        </Item>
      );
    }
    return items;
  }

  renderNavItems = (categories, depth) => {
    return (
      <List>
        {categories.reduce(
          (items, category) => this.reduceSubItems({ items, category, depth }), [])
        }
      </List>
    );
  }

  render() {
    return (
      <div>
        {this.renderNavItems(ebetsCategories, 0)}
      </div>
    );
  }
}

export default withRouter(Categories);
