/* Copyright (C) 2017 ethbets
 * All rights reserved.
 * 
 * This software may be modified and distributed under the terms
 * of the BSD license. See the LICENSE file for details.
*/
import React from 'react';

const ebetsCategories = [
  {
    name: 'UFC',
    path: 'ufc'
  },
  {
    name: 'E-Sports',
    subcategory: [
      {
        name: 'CS-GO',
        path: 'esports/csgo'
      },
      {
        name: 'League of Legends',
        path: 'esports/lol'
      },
      // {
      //   name: 'League of Legends',
      //   subcategory: [
      //     {
      //       category: 'foo',
      //       subcategory: [
      //         {
      //           name: 'Bar',
      //           path: 'esports/lol/foo/bar'
      //         }
      //       ]
      //     },
      //     {
      //       name: 'EU League',
      //       path: 'esports/lol/eu_league'
      //     },
      //     {
      //       name: 'US League',
      //       path: 'esports/lol/us_league'
      //     },
      //   ]
      // }
    ]
  },
  {
    name: 'Football',
    path: 'football'
  }
]

const getParsedCategories = () => {
  const getCategoriesRecursive = (category) => {
    if (!category.subcategory)
      return [category];
    return category.subcategory.map(cat => (
      getCategoriesRecursive(cat)
    )).reduce((a, b) => {
        return a.concat(b);
      }, []);
  }
  return ebetsCategories.map(categoryList => {
    const cat = getCategoriesRecursive(categoryList);
    return cat.map(category => {
      return <div key={category.path}>
        {category.name}
      </div>
    });
  }).reduce((a, b) => {
    return a.concat(b);
  }, []);
}

export { getParsedCategories, ebetsCategories };