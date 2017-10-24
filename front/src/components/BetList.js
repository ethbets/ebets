import React, { Component } from 'react';
import Bet from 'components/Bet';

class BetList extends Component {

  render() {
    var {category, address} = this.props.routeParams;
    var listItems = [];
    if (category !== undefined) {
      var mybets = (category === 'my_bets');
      if (this.props.routeParams.subcategory !== undefined)
        category = category + '/' + this.props.routeParams.subcategory;
      listItems = this.props.bets.map(betCat => 
        <Bet isDetailed={false}
             key={betCat.bet}
             category={betCat.category}
             address={betCat.bet}
             showUnfeatured={this.context.showUnfeatured}
             mybets={mybets}
        />
      );
    }
    if (address !== undefined) {
      listItems = <Bet isDetailed={true}
                       address={address} />
    }
    return (
      <div>
        <h1>{this.props.location.pathname}</h1>
        <ul style={{flexFlow: 'column', justifyContent: 'space-between'}}>
          {listItems}
        </ul>
      </div>
    );
  }
}

export default BetList;