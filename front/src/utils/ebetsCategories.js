/* Copyright (C) 2017 ethbets
 * All rights reserved.
 * 
 * This software may be modified and distributed under the terms
 * of the BSD license. See the LICENSE file for details.
*/
import React from 'react';

const ebetsCategories = [
  {
    name: 'All',
    path: 'all_bets'
  },
  {
    name: 'Fighting',
    subcategory: [
      {
        name: 'Boxing',
        path: 'fighting/boxing'
      },
      {
        name: 'MMA',
        subcategory: [
          {
            name: 'UFC',
            path: 'fighting/ufc'
          },
          {
            name: 'Bellator',
            path: 'fighting/bellator'
          },
          {
            name: 'Invicta FC',
            path: 'fighting/invictafc'
          }
        ]
      }
    ]
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
      //       name: 'foo',
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
    subcategory: [
      {
        name: 'UEFA Champions League',
        path: 'football/uefachampionsleague'
      },
      {
        name: 'UEFA Europa League',
        path: 'football/uefaeuropaleague'
      },
      {
        name: 'La Liga',
        path: 'football/laliga'
      },
      {
        name: 'Bundesliga',
        path: 'football/bundesliga'
      },
      {
        name: 'Brasileirão',
        path: 'football/brasileirao'
      },
      {
        name: 'Premier League',
        path: 'football/premierleague'
      },
      {
        name: 'Serie A',
        path: 'football/seriea'
      },
      {
        name: 'Ligue 1',
        path: 'football/ligue1'
      }
    ]
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
