/* Copyright (C) 2017 ethbets
 * All rights reserved.
 * 
 * This software may be modified and distributed under the terms
 * of the BSD license. See the LICENSE file for details.
*/

import React, { Component } from 'react';
import {
  Table,
  TableBody,
  TableHeader,
  TableHeaderColumn,
  TableRow,
  TableRowColumn,
} from 'material-ui/Table';
import RaisedButton from 'material-ui/RaisedButton';
import TextField from 'material-ui/TextField';
import {Card, CardHeader, CardText, CardActions} from 'material-ui/Card';

import Address from 'components/Address';
import isAddress from 'utils/validateAddress';

class ArbiterForm extends Component {
 static tooltips = {
    arbiters: "Arbiters decide bet's outcome",
    arbiterMember: "Member account"
  }

  static formStyle = {
    marginTop: 10
  };

  constructor(props) {
    super(props)
    this.state = {
      members: [],
      name: '',
      alert: {
        open: false,
        type: 'info',
        message: ''
      }
    }
  }

  handleSubmitNewArbiter = event => {
    event.preventDefault();
    // TODO: Improve this
    if(this.state.members.length === 0) {
      this.setState({
        alert: {
          type: 'danger',
          message: 'Error: Arbiter should have at least one member',
          open: true 
        }
      });
    }
    this.props.createStaticArbiterContract(this.state.name, this.state.members);
    // TODO: handle form validations
  }
  
  handleNewMemberChange = (event, inputText) => {
    var newMemberState = {
      memberErrorMessage: null,
      newMember: inputText
    };
    if(!isAddress(inputText)) {
      newMemberState = {
        memberErrorMessage: 'Invalid address'
      };
    }
    this.setState(newMemberState);
  }

  handleArbiterName = (event, inputText) => {
    this.setState({ name: inputText });
  }

  handleAddMember = () => {
    if (this.state.newMember) {
       this.setState(previousState => {
        if (previousState.members.indexOf(previousState.newMember) == -1) {
          return {members: [...previousState.members, previousState.newMember]}
        }
      })
    }
  }

  handleDeleteMember = (address) => () => {
    for (let idx in this.state.members)
      if (this.state.members[idx] === address) {
        this.setState(previousState => {previousState.members.splice(idx, 1);})
        break;
      }
  }

  Members = () => {
    return (
      <Table style={{tableLayout: 'auto'}} fixedHeader={false} selectable={false} >
        <TableHeader adjustForCheckbox={false} displaySelectAll={false}>
          <TableRow>
            <TableHeaderColumn>Address</TableHeaderColumn>
            <TableHeaderColumn>Action</TableHeaderColumn>
          </TableRow>
        </TableHeader>
        <TableBody displayRowCheckbox={false}>
          {this.state.members.map(arbiterAddress => 
            <TableRow key={arbiterAddress}>
              <TableRowColumn><Address address={arbiterAddress}/></TableRowColumn>
              <TableRowColumn>
                <RaisedButton label="Remove" onClick={() => {
                  this.setState(previousState => {
                    previousState.members.splice(previousState.members.indexOf(arbiterAddress), 1);
                    return {members: previousState.members};
                  })
                }} secondary />
              </TableRowColumn>
            </TableRow>
          )}
        </TableBody>
      </Table>
    );
  }

  render() {
    return (
      <div style={ArbiterForm.formStyle} >
        <form onSubmit={this.handleSubmitNewArbiter} >
          <Card>
            <CardHeader title="New Arbiter" />
            <CardText>
              <TextField
                name="name"
                floatingLabelText="Arbiter Name"
                onChange={this.handleArbiterName}
              />
              <div style={{ display: 'flex' }}>
                <TextField
                  name="members"
                  style={{width: 450}}
                  floatingLabelText="New Member"
                  onChange={this.handleNewMemberChange}
                  errorText={this.state.memberErrorMessage}
                />
                <RaisedButton style={{alignSelf: 'flex-end', marginLeft: 20}} label="Add" onClick={this.handleAddMember} primary />
              </div>
              <h4>Current members:</h4>
              { this.state.members.length == 0 ? "No members added yet." : <this.Members /> }
            </CardText>
            <CardActions>
              <RaisedButton type="submit" label="Create Arbiter" primary />
            </CardActions>
          </Card>
        </form>
      </div>
  )}
}

export default ArbiterForm;