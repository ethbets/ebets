import React, { Component } from 'react';
import RaisedButton from 'material-ui/RaisedButton'
import TextField from 'material-ui/TextField'
import Checkbox from 'material-ui/Checkbox'

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
      urlOraclize: '',
      isFeatured: false           
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
    // this.props.bet.addBet(newBet);
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
                hintText="Title"
                defaultValue={this.state.title}
                onChange={this.handleOnChange}
              /><br />
              <TextField
                hintText="Description"
                defaultValue={this.state.description}
                multiLine={true}
                rows={2}
              /><br />
               <TextField
                hintText="Category"
                defaultValue={this.state.category}
                onChange={this.handleOnChange}
              /><br />
              <TextField
                hintText="Team0"
                defaultValue={this.state.team1}
                onChange={this.handleOnChange}
              /><br />
              <TextField
                hintText="Team1"
                defaultValue={this.state.team2}
                onChange={this.handleOnChange}
              /><br />
              <TextField
                hintText="Resolver Address"
                defaultValue={this.state.resolverAddress}
                onChange={this.handleOnChange}
              /><br />
              <TextField
                hintText="UrlOraclize"
                defaultValue={this.state.urlOraclize}
                onChange={this.handleOnChange}
              /><br />
              <Checkbox label="Featured" /><br />         
              <RaisedButton type="submit" label="Create" primary />
            </div>
          </form>
        </div>
      </div>
    )
  }
}

export default BetForm;