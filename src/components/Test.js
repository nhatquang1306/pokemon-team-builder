import React from 'react';
import axios from 'axios';

class Test extends React.Component {
    constructor (props) {
      super(props)
      this.state = {
       text: ""
      }
    }
    componentDidMount() {
      let arr = []
      axios.get("https://pokeapi.co/api/v2/item-category/17/").then(response => {
        response.data.items.forEach(item => arr.push(axios.get(item.url)))
        Promise.all(arr).then(responses => {
          let items = responses.map(response => response.data)
          let text = ""
          items.forEach(item => text += "{name: \"" + item.name.replace(/^./, match => match.toUpperCase()).replace(/-(.)/g, (match, letter) => " " + letter.toUpperCase()) + "\", effect: \"" + (item.effect_entries.length > 0 ? item.effect_entries[0].short_effect.replace(/\n/g, "") : "") + "\", sprite: \"" + item.sprites.default + "\"},\n")
          this.setState({text: text})
        })
      })    
    }
    render() {
      return (
        <div>
          <p>{this.state.text}</p>
        </div>
      );
    }
}
export default Test;