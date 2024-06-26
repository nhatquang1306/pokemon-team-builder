import React from 'react';
import './TeamBuilder.css';
import Team from './Team.js';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPencilAlt, faTrashAlt } from '@fortawesome/free-solid-svg-icons';

class TeamBuilder extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      displaying: "teams",
      createName: "",
      teams: [],
      teamPokemons: [],
      message: "",
      currentTeam: "",
      editingName: false,
      currentEdit: null,
      ignoreScroll: false,
    }
    this.createTeam = this.createTeam.bind(this)
    this.createTeamEnter = this.createTeamEnter.bind(this)
    this.editCreateName = this.editCreateName.bind(this)
    this.openTeam = this.openTeam.bind(this)
    this.confirmTeamName = this.confirmTeamName.bind(this)
    this.deleteTeam = this.deleteTeam.bind(this)
    this.enableNameEdit = this.enableNameEdit.bind(this)
    this.removeMessage = this.removeMessage.bind(this)
    this.returnHome = this.returnHome.bind(this)
  }

  // go back to homepage from the team page
  returnHome() {
    // get teams from local storage
    let teams = JSON.parse(localStorage.getItem("teams"))
    if (teams) {
      let arr = []
      // get the sprites from local storage
      teams.forEach(team => arr.push(JSON.parse(localStorage.getItem(team + "sprites"))))
      this.setState({
        teams: teams,
        teamPokemons: arr,
        displaying: "teams"
      }, () => {
        document.querySelector(".create").addEventListener("keydown", this.createTeamEnter)
      })
    }
  }

  // when loading into the page, load teams for local storage
  componentDidMount() {
    document.querySelector(".create").addEventListener("keydown", this.createTeamEnter)
    let teams = JSON.parse(localStorage.getItem("teams"))
    if (teams) {
      let arr = []
      // get the sprites from local storage
      teams.forEach(team => arr.push(JSON.parse(localStorage.getItem(team + "sprites"))))
      this.setState({
        teams: teams,
        teamPokemons: arr
      })
    }
  }

  componentDidUpdate(prevProps, prevState) {
    // when the error message shows up, change the height of the teams component
    if (this.state.message !== prevState.message) {
      let teams = document.querySelector(".teams")
      if (teams && this.state.message === "") {
        teams.style.maxHeight = "calc(100vh - 82px)"
      } else if (teams) {
        teams.style.maxHeight = "calc(100vh - 111px)"
      }
    }
  }

  // event listener so user can hit enter to create teams
  createTeamEnter(event) {
    if (event.key === "Enter") {
      this.createTeam()
    }
  }

  // remove event listener before unmounting
  componentWillUnmount() {
    document.querySelector(".create").removeEventListener("keydown", this.createTeamEnter)
  }

  // remove error message
  removeMessage() {
    this.setState({message: ""})
    document.removeEventListener("click", this.removeMessage)
  }

  // create a team, user can't create a team with same name or create more than 10 teams
  createTeam() {
    let teams = [...this.state.teams]
    if (teams.includes(this.state.createName) && this.state.createName !== "") {
      document.removeEventListener("click", this.removeMessage)
      this.setState({message: "There is already a team with that name."})
      setTimeout(() => {
        document.addEventListener("click", this.removeMessage)
      }, 300)
    } else if (this.state.teams.length >= 10) {
      document.removeEventListener("click", this.removeMessage)
      this.setState({message: "You can only create 10 teams."})
      setTimeout(() => {
        document.addEventListener("click", this.removeMessage)
      }, 300)
    } else {
      let name = this.state.createName
      if (name === "") {
        // set team name to untitled if it is left blank
        for (let i = 1; i <= 10; i++) {
          if (!teams.includes("Untitled " + i)) {
            name = "Untitled " + i;
            break;
          }
        }
      }
      teams.push(name)
      this.setState({
        createName: "",
        teams: teams,
        teamPokemons: [...this.state.teamPokemons, ["", "", "", "", "", ""]]
      })
      // update the local storage with a new team
      localStorage.setItem("teams", JSON.stringify(teams))
      localStorage.setItem(name + "sprites", JSON.stringify(["", "", "", "", "", ""]))
    }
  }

  // edit the team name in the create input field
  editCreateName(event) {
    this.setState({createName: event.target.value})
  }

  // go to the team page
  openTeam(event, team) {
    if (event.target.closest(".icon, .edit")) return
    this.setState({
      displaying: "team details",
      currentTeam: team,
      editingName: false
    })
  }

  // edit the name of an existing team
  confirmTeamName(event) {
    if (event.key !== "Enter") return;
    let input = document.querySelector(".edit")
    let team = this.state.teams[this.state.currentEdit]
    if (input.value === team) {
      this.setState({editingName: false})
      return;
    } else if (this.state.teams.includes(input.value) || input.value === "") {
      // add a shake effect if team name is illegal
      input.classList.add("shake")
      setTimeout(() => {
        input.classList.remove("shake")
      }, 500)
      return;
    }
    // modify local storage with new team name
    let sprites = localStorage.getItem(team + "sprites")
    localStorage.removeItem(team + "sprites")
    localStorage.setItem(input.value + "sprites", sprites)
    for (let i = 0; i <= 5; i++) {
      let pokemon = localStorage.getItem(team + i)
      if (pokemon) {
        localStorage.removeItem(team + i)
        localStorage.setItem(input.value + i, pokemon) 
      }
    }
    let teams = this.state.teams
    teams[this.state.currentEdit] = input.value
    this.setState({
      teams: teams,
      editingName: false
    })
    localStorage.setItem("teams", JSON.stringify(teams))
    input.removeEventListener("keydown", this.confirmTeamName)
  }

  // enable the editing of existing team name
  enableNameEdit(index) {
    if (this.state.editingName && this.state.currentEdit === index) {
      this.confirmTeamName({key: "Enter"})
      return;
    }
    this.setState({
      editingName: true,
      currentEdit: index
    }, () => {
      let input = document.querySelector(".edit")
      input.value = this.state.teams[index]
      input.addEventListener("keydown", this.confirmTeamName)
    })
  }

  // delete a team, with a confirmation box
  deleteTeam(index) {
    const result = window.confirm("Are you sure you want to delete this team?")
    if (result) {
      let teams = this.state.teams
      let pokemons = this.state.teamPokemons
      // remove the team from local storage
      localStorage.removeItem(teams[index] + "sprites")
      for (let i = 0; i <= 5; i++) {
        localStorage.removeItem(teams[index] + i)
      }
      teams.splice(index, 1)
      pokemons.splice(index, 1)
      this.setState({
        editingName: false,
        teams: teams,
        teamPokemons: pokemons
      })
      localStorage.setItem("teams", JSON.stringify(teams))
    }
  }


  render() {
    return ( 
      this.state.displaying === "team details" ? <Team pokemons={this.props.pokemons} forms={this.props.forms} returnHome={this.returnHome} teamName={this.state.currentTeam}/> : (
        <div className="team-builder">
          <div className="create-team">
            <input id="create-input" type="text" placeholder="Team Name" className="create" value={this.state.createName} onChange={this.editCreateName} maxLength="15"></input>
            <button onClick={this.createTeam}>Create Team</button>
            {this.state.message.length > 0 && <p>{this.state.message}</p>}
          </div>
          <div className="teams">
          {this.state.teams.map((team, index) => (
            <div className="team-box" key={index} onClick={(event) => this.openTeam(event, team)}>
              <div className="team-info">
                {this.state.editingName && this.state.currentEdit === index ? <input className="edit" type="text" maxLength="15"></input> : <p>{team}</p>}
                <FontAwesomeIcon icon={faPencilAlt} className="icon" onClick={() => this.enableNameEdit(index)}/>
                <FontAwesomeIcon icon={faTrashAlt} className="icon" onClick={() => this.deleteTeam(index)}/>
              </div>  
              <div className="sprites">
              {this.state.teamPokemons[index][0] === "" ? <div className="placeholder"></div> : <img src={this.state.teamPokemons[index][0]} alt=''></img>}
              {this.state.teamPokemons[index][1] === "" ? <div className="placeholder"></div> : <img src={this.state.teamPokemons[index][1]} alt=''></img>}
              {this.state.teamPokemons[index][2] === "" ? <div className="placeholder"></div> : <img src={this.state.teamPokemons[index][2]} alt=''></img>}
              {this.state.teamPokemons[index][3] === "" ? <div className="placeholder"></div> : <img src={this.state.teamPokemons[index][3]} alt=''></img>}
              {this.state.teamPokemons[index][4] === "" ? <div className="placeholder"></div> : <img src={this.state.teamPokemons[index][4]} alt=''></img>}
              {this.state.teamPokemons[index][5] === "" ? <div className="placeholder"></div> : <img src={this.state.teamPokemons[index][5]} alt=''></img>}
              </div>
            </div>  
          ))}
          </div>
        </div>)
    );
  }
}


export default TeamBuilder;