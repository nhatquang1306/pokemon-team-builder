import './App.css';
import React from 'react';
import axios from 'axios';
import TeamBuilder from './components/TeamBuilder';

class App extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      pokemons: [],
      forms: [],
    }
  }
  componentDidMount() {
    axios.get('https://pokeapi.co/api/v2/pokemon?offset=0&limit=1010').then(response => {
      let pokemons = response.data.results;
      pokemons.forEach((pokemon, index) => {
        switch (pokemon.name) {
          case 'wormadam-plant': pokemon.name = 'wormadam'; break;
          case 'deoxys-normal': pokemon.name = 'deoxys'; break;
          case 'giratina-altered': pokemon.name = 'giratina'; break;
          case 'shaymin-land': pokemon.name = 'shaymin'; break;
          case 'basculin-red-striped': pokemon.name = 'basculin'; break;
          case 'keldeo-ordinary': pokemon.name = 'keldeo'; break;
          case 'meloetta-aria': pokemon.name = 'meloetta'; break;
          case 'meowstic-male': pokemon.name = 'meowstic'; break;
          case 'aegislash-shield': pokemon.name = 'aegislash'; break;
          case 'zygarde-50': pokemon.name = 'zygarde'; break;
          case 'oricorio-baile': pokemon.name = 'oricorio'; break;
          case 'wishiwashi-solo': pokemon.name = 'wishiwashi'; break;
          case 'minior-red-meteor': pokemon.name = 'minior'; break;
          case 'toxtricity-amped': pokemon.name = 'toxtricity'; break;
          case 'basculegion-male': pokemon.name = 'basculegion'; break;
          case 'enamorus-incarnate': pokemon.name = 'enamorus'; break;
          case 'thundurus-incarnate': pokemon.name = 'thundurus'; break;
          case 'landorus-incarnate': pokemon.name = 'landorus'; break;
          case 'tornadus-incarnate': pokemon.name = 'tornadus'; break;
          case 'urshifu-single-strike': pokemon.name = 'urshifu'; break;
          case 'morpeko-full-belly': pokemon.name = 'morpeko'; break;
          case 'indeedee-male': pokemon.name = 'indeedee'; break;
          case 'darmanitan-standard': pokemon.name = 'darmanitan'; break;
          case 'mimikyu-disguised': pokemon.name = 'mimikyu'; break;
          case 'lycanroc-midday': pokemon.name = 'lycanroc'; break;
          case 'farfetchd': pokemon.name = "farfetch'd"; break;
          case 'sirfetchd': pokemon.name = "sirfetch'd"; break;
          case 'mr-mime': pokemon.name = "mr. Mime"; break;
          case 'mr-rime': pokemon.name = "mr. Rime"; break;
          case 'eiscue-ice': pokemon.name = 'eiscue'; break;
          case 'pumpkaboo-average': pokemon.name = 'pumpkaboo'; break;
          case 'gourgeist-average': pokemon.name = 'gourgeist'; break;
          case 'nidoran-f': pokemon.name = 'nidoran ♀'; break;
          case 'nidoran-m': pokemon.name = 'nidoran ♂'; break;
          default: break;
        }
        if (pokemon.name === "kommo-o" || pokemon.name === "hakamo-o" || pokemon.name === "jangmo-o") {
          pokemon.label = pokemon.name.replace(/^./, match => match.toUpperCase())
        } else if (pokemon.name === "ho-oh" || pokemon.name === "porygon-z") {
          pokemon.label = pokemon.name.replace(/^.|-./g, match => match.toUpperCase())
        }else {
          pokemon.label = pokemon.name.replace(/^./, match => match.toUpperCase()).replace(/-(.)/g, (match, letter) => " " + letter.toUpperCase())
        }
        pokemon.id = index + 1
      });
      this.setState({pokemons: pokemons})
    })
    axios.get('https://pokeapi.co/api/v2/pokemon/?offset=1010&limit=271').then(response => {
      let forms = response.data.results.filter(form => !/power-construct|-totem|-meteor$|^miraidon|^koraidon|^pikachu(?!.*(cap|gmax)$)|floette-eternal|greninja-battle-bond|eevee-starter/.test(form.name))
      this.setState({forms: forms})
    })
  }
  render() {
    return (
      <div className="App">
        <TeamBuilder pokemons={this.state.pokemons} forms={this.state.forms}></TeamBuilder>
      </div>
    );
  }
}

export default App;

