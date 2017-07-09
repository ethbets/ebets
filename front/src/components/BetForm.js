import React, { Component } from 'react';
import RaisedButton from 'material-ui/RaisedButton'
import TextField from 'material-ui/TextField'
import Checkbox from 'material-ui/Checkbox'

import BetDetail from 'components/BetDetail'

class BetForm extends Component {

  constructor(props) {
    super(props)

    this.state = {
      title: '',
      description: '',
      category: '',
      team0: '',
      team1: '',
      resolverAddress: '',
      urlOraclize: ''
    }

    this.handleOnChange = this.handleOnChange.bind(this);
    this.handleOnSubmit = this.handleOnSubmit.bind(this);
  }

  handleOnChange = event => {
    const target = event.target;
    const value = target.type === 'checkbox' ? target.checked : target.value;
    const name = target.name;

    this.setState({ [name]: value });
  }

  handleOnSubmit = event => {
    event.preventDefault();
    // TODO: handle form errors
    const newBet = this.state
    const bet = React.createElement(BetDetail, newBet);
    // TODO: make a POST to store this newBet using web3 api
  }

  render() {
    return (
      <div className="form">
        <div className="formScreen">
          <div className="formTitle">
            <h1>Add Bet</h1>
          </div>

          <form onSubmit={this.handleOnSubmit} >
            <div>
              <TextField 
                name="title"
                value={this.state.title}
                placeholder="Title"
                onChange={this.handleOnChange}
              /><br />
              <TextField
                name="description"
                value={this.state.description}
                placeholder="Description"
                multiLine={true}
                rows={2}
                onChange={this.handleOnChange}
              /><br />
               <TextField
                name="category"
                value={this.state.category}
                placeholder="Category"
                onChange={this.handleOnChange}
              /><br />
              <TextField
                name="team0"
                value={this.state.team0}
                placeholder="Team0"
                onChange={this.handleOnChange}
              /><br />
              <TextField
                name="team1"
                value={this.state.team1}
                placeholder="Team1"
                onChange={this.handleOnChange}
              /><br />
              <TextField
                name="resolverAddress"
                value={this.state.resolverAddress}
                placeholder="Resolver Address"
                onChange={this.handleOnChange}
              /><br />
              <TextField
                name="urlOraclize"
                value={this.state.urlOraclize}
                placeholder="Oraclize URL"
                onChange={this.handleOnChange}
              /><br />
              <RaisedButton type="submit" label="Create" primary />
            </div>
          </form>
        </div>
      </div>
    )
  }
}

export default BetForm;