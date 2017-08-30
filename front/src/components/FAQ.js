/* Copyright (C) 2017 ethbets
 * All rights reserved.
 * 
 * This software may be modified and distributed under the terms
 * of the BSD license. See the LICENSE file for details.
*/

import React, { Component } from 'react';
import { Card, CardHeader, CardText } from 'material-ui/Card';
import HowDoesItWork from '../assets/imgs/Making-a-bet.png';

class FAQ extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div style={{marginLeft: 80, marginRight: 80}}>
        <Card style={{marginBottom: 20}}>
          <CardHeader
            title="What is this?"
            actAsExpander={true}
            showExpandableButton={true}
          />
          <CardText expandable={true}>
            Ebets is an Ethereum based betting platform.
            The bets are implemented as smart contracts, and you can check them out on our <a href='https://github.com/ethbets/ebets/tree/master/contracts'>GitHub</a>.
          </CardText>
        </Card>

        <Card style={{marginBottom: 20}}>
          <CardHeader
            title="How does it work?"
            actAsExpander={true}
            showExpandableButton={true}
          />
          <CardText expandable={true}>
            Users may put their money on existing bets or create their own bets. The bets are usually related
            to sports or e-sports, but not necessarily. When the match ends, an arbiter is invoked to decide
            the outcome. The winners are then allowed to collect their rewards.
          </CardText>
        </Card>

        <Card style={{marginBottom: 20}}>
          <CardHeader
            title="How do I bet?"
            actAsExpander={true}
            showExpandableButton={true}
          />
          <CardText expandable={true}>
            Choose a team to bet on, the amount of money you want to bet, and press Bet!
            By default, you are betting in Ether. You can also bet ERC20 tokens by changing the
            currency field to one of the common tokens, or typing the Ethereum address of the token.
            Once you bet on a team, regardless the currency, you are not allowed to bet on the other team.
          </CardText>
        </Card>

        <Card style={{marginBottom: 20}}>
          <CardHeader
            title="I want to create a bet. What is an arbiter?"
            actAsExpander={true}
            showExpandableButton={true}
          />
          <CardText expandable={true}>
            The arbiter is the entity that decides the outcome of the bet it is assigned to.
            As the arbiter is seen as an Ethereum address, it may be a person, a group of people,
            a smart contract, an oracle, or many other things. Currently we use the Monarch arbiter
            for our bets, but you can of course use any arbiter of your choice when creating a bet.
          </CardText>
        </Card>

        <Card style={{marginBottom: 20}}>
          <CardHeader
            title="What are featured/unfeatured bets?"
            actAsExpander={true}
            showExpandableButton={true}
          />
          <CardText expandable={true}>
            Featured bets are the ones created by the Ebets team. Bets created by users are marked as unfeatured,
            and not shown by default. You can click on Unfeatured on the left menu to enable all the bets to be visible.
            Please keep in mind that we cannot guarantee the quality of the arbiters chosen by users.
          </CardText>
        </Card>

        <Card style={{marginBottom: 20}}>
          <CardHeader
            title="Are there any fees?"
            actAsExpander={true}
            showExpandableButton={true}
          />
          <CardText expandable={true}>
            Ebets keeps 1% of the losing pool.
          </CardText>
        </Card>

        <Card style={{marginBottom: 20}}>
          <CardHeader
            title="How do I know you are not stealing my money?"
            actAsExpander={true}
            showExpandableButton={true}
          />
          <CardText expandable={true}>
            Almost the entire system is controlled by our open source smart contracts,
            available on our <a href='https://github.com/ethbets/ebets/tree/master/contracts'>GitHub</a>.
            The only possible attack against your money, in case a bet uses our Monarchy arbiter,
            is for us to lie about the outcome of a match. For now this is entirely reputation based,
            since one wrong result from us will lead to the fall of Ebets, which we do not want to happen.
            We plan to outsource and build a community of arbiters related to each bet category
            (similar to a justice system, if you will) to improve our system.
          </CardText>
        </Card>

         <Card style={{marginBottom: 20}}>
          <CardHeader
            title="What if the arbiter doesn't decide on any result?"
            actAsExpander={true}
            showExpandableButton={true}
          />
          <CardText expandable={true}>
            The arbiter has a deadline to make a decision. If the decision is not made within this time limit,
            the match is declared a draw and every participant gets their money back.
          </CardText>
        </Card>

        <Card style={{marginBottom: 20}}>
          <CardHeader
            title="What if I win a bet but don't collect my rewards?"
            actAsExpander={true}
            showExpandableButton={true}
          />
          <CardText expandable={true}>
            If you win a bet you will have quite a lot of time to collect your rewards (several days).
            If you don't, the bet will be self-destructed and the remaining money will be collected as fees. 
          </CardText>
        </Card>
      </div>
    );
  }
}

export default FAQ;
