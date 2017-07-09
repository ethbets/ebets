import React, { Component } from 'react';
import RaisedButton from 'material-ui/RaisedButton'
import TextField from 'material-ui/TextField'

class BetForm extends Component {

  constructor(props) {
    super(props)

    this.state = {
      resolverAddress: '',
      title: '',
    }

    this.handleOnChange = this.handleOnChange.bind(this);
    this.handleOnSubmit = this.handleOnSubmit.bind(this);
  }

  handleOnChange = event => {
    const { name, value } = event.target;
    this.setState({ [name]: value })
  }

  handleOnSubmit = event => {
    event.preventDefault();
    // TODO: handle form errors
    const newBet = this.state
    console.log(newBet)
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
                name="resolverAddress"
                type="text"
                defaultValue={this.state.resolverAddress}
                onChange={this.handleOnChange}
                placeholder="Resolver Address"
              />
              <br />
              <TextField 
                name="title"
                type="text"
                value={this.state.title}
                onChange={this.handleOnChange}
                placeholder="Title"
              />
              <br />
              <RaisedButton type="submit" label="Create" primary />
            </div>
          </form>
        </div>
      </div>
    )
  }
}

export default BetForm;