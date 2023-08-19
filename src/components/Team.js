import React from 'react';
import Pokemon from './Pokemon.js';
import './Team.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faAngleLeft } from '@fortawesome/free-solid-svg-icons';
import { faTimes } from '@fortawesome/free-solid-svg-icons';

const handleMinus = (event) => {
    if (['-', '+', 'e', 'E', '.'].includes(event.key)) {
        event.preventDefault();
    }
}
const natures = [
    { name: "Lonely", effect: "+Atk, -Def" },
    { name: "Adamant", effect: "+Atk, -SpA" },
    { name: "Naughty", effect: "+Atk, -SpD" },
    { name: "Brave", effect: "+Atk, -Spe" },
    { name: "Bold", effect: "+Def, -Atk" },
    { name: "Impish", effect: "+Def, -SpA" },
    { name: "Lax", effect: "+Def, -SpD" },
    { name: "Relaxed", effect: "+Def, -Spe" },
    { name: "Modest", effect: "+SpA, -Atk" },
    { name: "Mild", effect: "+SpA, -Def" },
    { name: "Rash", effect: "+SpA, -SpD" },
    { name: "Quiet", effect: "+SpA, -Spe" },
    { name: "Calm", effect: "+SpD, -Atk" },
    { name: "Gentle", effect: "+SpD, -Def" },
    { name: "Careful", effect: "+SpD, -SpA" },
    { name: "Sassy", effect: "+SpD, -Spe" },
    { name: "Timid", effect: "+Spe, -Atk" },
    { name: "Hasty", effect: "+Spe, -Def" },
    { name: "Jolly", effect: "+Spe, -SpA" },
    { name: "Naive", effect: "+Spe, -SpD" },
    { name: "Serious", effect: "" },
    { name: "Hardy", effect: "" },
    { name: "Docile", effect: "" },
    { name: "Bashful", effect: "" },
    { name: "Quirky", effect: "" }
]
const getNatureMultipliers = (name) => {
    let nature = natures.filter(nature => nature.name === name)[0]
    let arr = [1, 1, 1, 1, 1, 1]
    if (nature.effect === "") return arr;
    let matchIncrease = nature.effect.match(/\+(.{3})/), matchDecrease = nature.effect.match(/-(.{3})/)
    switch (matchIncrease[1]) {
        case "Atk": arr[1] = 1.1; break;
        case "Def": arr[2] = 1.1; break;
        case "SpA": arr[3] = 1.1; break;
        case "SpD": arr[4] = 1.1; break;
        case "Spe": arr[5] = 1.1; break;
        default: break;
    }
    switch (matchDecrease[1]) {
        case "Atk": arr[1] = 0.9; break;
        case "Def": arr[2] = 0.9; break;
        case "SpA": arr[3] = 0.9; break;
        case "SpD": arr[4] = 0.9; break;
        case "Spe": arr[5] = 0.9; break;
        default: break;
    }
    return arr
}

class Team extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            keyboardActive: false,
            currentPokemon: null, displaying: "",
            activeElement: null,
            displayPokemons: [true, true, false, false, false, false],
            sprites: ["", "", "", "", "", ""],
            moves: [], searchMove: "", highlightedMoves: [], selectedMoves: [],
            abilities: [], searchAbility: "", highlightedAbility: "", selectedAbilities: [],
            searchItem: "", highlightedItem: "", selectedItems: [],
            statNames: ["HP", "Attack", "Defense", "Special Attack", "Special Defense", "Speed"],
            baseStats: [], maxStats: [], ivs: [], evs: [],
            nature: "", natureMultipliers: [],
            level: null, selectedStats: [], selectedNatures: []
        }
        this.selectItem = this.selectItem.bind(this)
        this.importMoves = this.importMoves.bind(this)
        this.filterMoves = this.filterMoves.bind(this)
        this.selectMove = this.selectMove.bind(this)
        this.importAbilities = this.importAbilities.bind(this)
        this.selectAbility = this.selectAbility.bind(this)
        this.filterAbilities = this.filterAbilities.bind(this)
        this.openItems = this.openItems.bind(this)
        this.filterItems = this.filterItems.bind(this)
        this.selectItem = this.selectItem.bind(this)
        this.openStats = this.openStats.bind(this)
        this.resetProps = this.resetProps.bind(this)
        this.changeStat = this.changeStat.bind(this)
        this.changeNature = this.changeNature.bind(this)
        this.blurStats = this.blurStats.bind(this)
        this.closeDisplaying = this.closeDisplaying.bind(this)
        this.resizeListener = this.resizeListener.bind(this)
        this.scrollListener = this.scrollListener.bind(this)
        this.updateSprite = this.updateSprite.bind(this)
        this.selectDisplayPokemons = this.selectDisplayPokemons.bind(this)
    }
    selectDisplayPokemons(index) {
        if (!this.state.displayPokemons[index] && document.querySelector(".team").clientWidth === 944) {
            let displayPokemons = [false, false, false, false, false, false]
            displayPokemons[index] = true;
            displayPokemons[index % 2 === 0 ? index + 1 : index - 1] = true;
            this.setState({
                displayPokemons: displayPokemons,
                displaying: ""
            })
        } else {
            let displayPokemons = [false, false, false, false, false, false]
            displayPokemons[index] = true;
            this.setState({
                displayPokemons: displayPokemons,
                displaying: ""
            })
        }
    }
    updateSprite(index, sprite) {
        let sprites = [...this.state.sprites]
        sprites[index] = sprite
        this.setState({sprites: sprites})
        localStorage.setItem(this.props.teamName + "sprites", JSON.stringify(sprites))
    }
    blurStats(type, number, event) {
        if (event.target.value === "") {
            this.changeStat(type, number, { target: { value: type === "iv" ? 31 : 0 } })
        }
    }
    changeNature(event) {
        let arr = getNatureMultipliers(event.target.value), arr2 = { ...this.state.selectedNatures }
        arr2[this.state.currentPokemon] = event.target.value
        this.setState({
            nature: event.target.value,
            natureMultipliers: arr,
            selectedNatures: arr2
        })
    }
    changeStat(type, num, event) {
        let value = parseInt(event.target.value)
        if (isNaN(value)) value = null;
        let stats = { ...this.state.selectedStats }
        if (type === "iv") {
            let ivs = [...this.state.ivs]
            value = value > 31 ? 31 : value
            ivs[num] = value
            stats[this.state.currentPokemon] = "iv" + num + value
            this.setState({
                ivs: ivs,
                selectedStats: stats
            })
        } else if (type === "ev") {
            let evs = [...this.state.evs]
            let max = 508 - evs.slice(0, num).concat(evs.slice(num + 1)).reduce((total, value) => total + value, 0)
            value = value > Math.min(252, max) ? Math.min(252, max) : value
            evs[num] = value
            stats[this.state.currentPokemon] = "ev" + num + value
            this.setState({
                evs: evs,
                selectedStats: stats
            })
        }
    }
    filterAbilities(ability) {
        let searchAbility = ability;
        if (this.state.abilities.filter(ability => ability.name === searchAbility).length > 0) {
            searchAbility = ""
        }
        this.setState({
            searchAbility: searchAbility,
            highlightedAbility: ability
        })
    }
    importAbilities(abilities, selectedAbility, index) {
        this.setState({
            currentPokemon: index,
            displaying: "abilities",
            abilities: abilities,
            highlightedAbility: selectedAbility,
            searchAbility: ""
        },)
    }
    importMoves(moves, highlightedMoves, num, scroll, index) {
        let scrollCondition = scroll && moves.filter(move => move.name === highlightedMoves[num]).length > 0
        this.setState({
            activeElement: document.activeElement,
            displaying: "moves",
            moves: moves,
            currentPokemon: index,
            highlightedMoves: highlightedMoves,
            searchMove: "",
        }, () => {
            let items = document.querySelector(".box > .items")
            items.removeEventListener("scroll", this.scrollListener)
            if (scrollCondition) {
                let moves = document.querySelectorAll(".box > .items > .selected")
                for (let i = 0; i < 4; i++) {
                    let moveName = moves[i].querySelector("p").textContent
                    if (moveName === highlightedMoves[num]) {                
                        items.scrollTo({top: moves[i].offsetTop - items.offsetTop, behavior: "smooth"})     
                        break;
                    }     
                }
            }
            if (this.state.keyboardActive) {
                if (!scrollCondition) {
                    items.scrollTo({top: 0, behavior: "smooth"})
                }
                setTimeout(() => {
                    items.addEventListener("scroll", this.scrollListener)
                }, 500)    
            }
        })
    }
    filterMoves(move, arr) {
        let searchMove = move
        if (this.state.moves.filter(move => move.name === searchMove).length > 0) {
            searchMove = ""
        }
        this.setState({ searchMove: searchMove, highlightedMoves: arr })
    }
    selectMove(name) {
        if (this.state.highlightedMoves.filter(move => move === name).length > 0) {
            name = "[delete]" + name;
        }
        let arr = [...this.state.selectedMoves]
        arr[this.state.currentPokemon] = name
        this.setState({
            selectedMoves: arr,
            searchMove: "",
        })
    }
    selectAbility(name) {
        if (this.state.highlightedAbility === name) {
            name = "[delete]" + name;
        }
        let arr = [...this.state.selectedAbilities]
        arr[this.state.currentPokemon] = name
        this.setState({
            selectedAbilities: arr,
            highlightedAbility: name,
            searchAbility: "",
        })
    }
    selectItem(selectedItem) {
        let item = { ...selectedItem }
        if (this.state.highlightedItem === item.name) {
            item.name = "[delete]" + item.name;
        }
        let arr = [...this.state.selectedItems]
        arr[this.state.currentPokemon] = item
        this.setState({
            selectedItems: arr,
            highlightedItem: item.name,
            searchItem: ""
        })
    }
    filterItems(item) {
        let searchItem = item;
        if (heldItems.concat(changeItems).filter(item => item.name === searchItem).length > 0) {
            searchItem = ""
        }
        this.setState({ searchItem: searchItem, highlightedItem: item })
    }
    openItems(heldItem, scroll, num) {
        let scrollCondition = scroll && changeItems.concat(heldItems).filter(item => item.name === heldItem).length > 0;
        this.setState({
            displaying: "items",
            highlightedItem: heldItem,
            activeElement: document.activeElement,
            currentPokemon: num,
            searchItem: "",
        }, () => {
            let items = document.querySelector(".box > .items")
            items.removeEventListener("scroll", this.scrollListener)
            if (scrollCondition) {  
                let selected = document.querySelector(".box > .items > .selected")
                items.scrollTo({top: selected.offsetTop - items.offsetTop, behavior: "smooth"})
            }
            if (this.state.keyboardActive) {
                if (!scrollCondition) {
                    items.scrollTo({top: 0, behavior: "smooth"})
                }
                setTimeout(() => {
                    items.addEventListener("scroll", this.scrollListener)
                }, 500)    
            }
        })
    }
    openStats(baseStats, ivs, evs, level, nature, maxStats, index) {
        let arr = getNatureMultipliers(nature)
        this.setState({
            displaying: "stats",
            baseStats: baseStats,
            ivs: ivs,
            evs: evs,
            level: level,
            nature: nature,
            natureMultipliers: arr,
            currentPokemon: index,
            maxStats: maxStats
        })
    }
    resetProps() {
        this.setState({
            selectedAbilities: ["", "", "", "", "", ""],
            selectedItems: ["", "", "", "", "", ""],
            selectedMoves: ["", "", "", "", "", ""],
            selectedStats: ["", "", "", "", "", ""]
        })
    }
    closeDisplaying() {
        this.setState({
            displaying: "",
            currentPokemon: null
        })
    }
    componentDidMount() {
        window.visualViewport.addEventListener('resize', this.resizeListener)
        this.setState({sprites: JSON.parse(localStorage.getItem(this.props.teamName + "sprites"))})
        if (document.querySelector(".team").clientWidth <= 487) {
            this.setState({displayPokemons: [true, false, false, false, false, false, false]})
            if (Math.min(window.innerWidth, window.screen.width) <= 487) {
                let team = document.querySelector(".team")
                let ratio = Math.min(window.innerWidth, window.screen.width) / 467
                team.style.transform = `scale(${ratio}, ${ratio})`
            }
        }
        
    }
    componentDidUpdate(prevProps, prevState) {
        if ((this.state.currentPokemon !== prevState.currentPokemon || this.state.displaying !== prevState.displaying) && this.state.displaying !== "") {
            let items = document.querySelector(".items")
            if (items && items.offsetWidth !== items.scrollWidth) {
                items.classList.add("scrollbar-present");
            } else if (items) {
                items.classList.remove("scrollbar-present");
            }
            if (Math.min(window.innerWidth, window.screen.width) <= 487) {
                document.querySelector(".box").style.height = (Math.min(window.innerHeight, window.screen.height) - 412) * 467 / Math.min(window.innerWidth, window.screen.width) + "px"
            }
        }
    }
    componentWillUnmount() {
        window.visualViewport.removeEventListener('resize', this.resizeListenerBox)
        window.visualViewport.removeEventListener('resize', this.resizeListenerWindow)
        document.removeEventListener('scroll', this.scrollListener)
    }
    
    scrollListener() {  
        this.state.activeElement.blur()
        let items = document.querySelector(".box > .items")
        items.removeEventListener("scroll", this.scrollListener)
    }

    resizeListener() {
        if (Math.min(window.innerHeight, window.screen.height) - window.visualViewport.height > 150 && Math.abs(Math.min(window.innerWidth, window.screen.width) - window.visualViewport.width) < 30) {
            this.setState({keyboardActive: true})
            let items = document.querySelector(".items")
            if (items) {
                setTimeout(() => {
                    items.addEventListener("scroll", this.scrollListener)
                }, 300)
            }
            window.visualViewport.removeEventListener('resize', this.resizeListener)
        }
    }

    render() {
        const pokemonProps = (index) => {
            return {
                pokemons: this.props.pokemons,
                teamName: this.props.teamName,
                barDisplay: this.state.displayPokemons[index],
                updateSprite: (sprite) => this.updateSprite(index, sprite),
                index: index,
                resetProps: () => this.resetProps(index),
                openStats: (base, ivs, evs, level, nature, maxStats) => this.openStats(base, ivs, evs, level, nature, maxStats, index),
                forms: this.props.forms,
                filterMoves: this.filterMoves,
                filterHeldItem: this.filterItems,
                openItems: (heldItem, scroll) => this.openItems(heldItem, scroll, index),
                filterAbilities: this.filterAbilities,
                exportAbilities: (abilities, selected) => this.importAbilities(abilities, selected, index),
                exportMoves: (moves, highlightedMoves, num, scroll) => this.importMoves(moves, highlightedMoves, num, scroll, index),
                selectedMove: this.state.selectedMoves[index],
                selectedAbility: this.state.selectedAbilities[index],
                selectedItem: this.state.selectedItems[index],
                selectedStat: this.state.selectedStats[index],
                selectedNature: this.state.selectedNatures[index],
                displaying: this.state.displaying,
                isEditing: this.state.currentPokemon === index,
                closeDisplaying: this.closeDisplaying,
            }
        }
        const statCalculation = (number) => {
            return Math.floor(((this.state.baseStats[number] * 2 + this.state.ivs[number] + this.state.evs[number] / 4) * this.state.level / 100 + 5) * this.state.natureMultipliers[number])
        }
        let colors = []
        const points = (num) => {
            const ratio = (num === 0 ? Math.floor((this.state.baseStats[0] * 2 + this.state.ivs[0] + this.state.evs[0] / 4) * this.state.level / 100 + this.state.level + 10) : statCalculation(num)) / this.state.maxStats[num]
            if (ratio >= 0.9) colors[num] = "rgb(87, 242, 87)"
            else if (ratio >= 0.7) colors[num] = "rgb(144, 238, 144)"
            else if (ratio >= 0.45) colors[num] = "rgb(255, 255, 0)"
            else if (ratio >= 0.2) colors[num] = "rgb(255, 165, 0)"
            else colors[num] = "rgb(255, 0, 0)"
            return `0,0 ${100 * ratio},0 ${100 * ratio},12 0,12`
        }
        return (
            <div className="team">
                <div className="taskbar">
                    <button onClick={this.props.returnHome}><FontAwesomeIcon icon={faAngleLeft} />  Home</button>
                    <input readOnly value={this.props.teamName}></input>
                </div>
                <div className="pokemon-bar">
                    {this.state.sprites.map((sprite, index) => (
                        sprite !== "" ?  <img src={sprite} className={this.state.displayPokemons[index] ? "display-bar" : ""} style={{height: 40, width: 40}} alt="" onClick={() => this.selectDisplayPokemons(index)}></img> : <div style={{height: 40, width: 40}} className={this.state.displayPokemons[index] ? "display-bar" : ""} onClick={() => this.selectDisplayPokemons(index)}></div>
                    ))}
                </div>
                <div className="team-pokemons">
                    <Pokemon {...pokemonProps(0)}/>
                    <Pokemon {...pokemonProps(1)} />
                    <Pokemon {...pokemonProps(2)} />
                    <Pokemon {...pokemonProps(3)} />
                    <Pokemon {...pokemonProps(4)} />
                    <Pokemon {...pokemonProps(5)} />
                </div>
                {this.state.displaying === "moves" && (
                    <div className="box">
                        <FontAwesomeIcon icon={faTimes} className="close-icon" onClick={this.closeDisplaying}></FontAwesomeIcon>
                        <div className="box-heading">
                            <p style={{ width: '25%' }}>Name</p>
                            <p>Type</p>
                            <p>Cat.</p>
                            <p>Pow.</p>
                            <p>Acc.</p>
                            <p>PP</p>
                            <p style={{ width: '35%' }}>Effect</p>
                        </div>
                        <div className="items">
                            {this.state.moves.filter(move => move.name.toLowerCase().includes(this.state.searchMove.toLowerCase())).map((move, index) => (
                                <div key={index} onClick={() => this.selectMove(move.name)} className={`item ${this.state.highlightedMoves.filter(highlightedMove => highlightedMove === move.name).length > 0 ? 'selected' : ''}`}>
                                    <p style={{ width: '25%' }}>{move.name}</p>
                                    <p><img src={require('../asset/' + move.type.name + '.png')} alt={move.type.name}></img></p>
                                    <p><img src={require('../asset/' + move.damage_class.name + '.png')} alt={move.damage_class.name}></img></p>
                                    <p>{move.power}</p>
                                    <p>{move.accuracy}</p>
                                    <p>{move.pp * 8 / 5}</p>
                                    <p style={{ fontSize: 12, width: '35%' }}>{move.effect_entries[0] ? move.effect_entries[0].short_effect : ""}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
                {this.state.displaying === "abilities" && (
                    <div className="box">
                        <FontAwesomeIcon icon={faTimes} className="close-icon" onClick={this.closeDisplaying}></FontAwesomeIcon>
                        <div className="box-heading">
                            <p style={{ width: '30%' }}>Name</p>
                            <p style={{ width: '70%' }}>Effect</p>
                        </div>
                        <div className="items">
                            {this.state.abilities.filter(ability => ability.name.toLowerCase().includes(this.state.searchAbility.toLowerCase())).map((ability, index) => (
                                <div key={index} onClick={() => this.selectAbility(ability.name)} className={`item ${this.state.highlightedAbility === ability.name ? 'selected' : ''}`}>
                                    <p style={{ width: '30%' }}>{ability.name}</p>
                                    <p style={{ width: '70%' }}>{ability.effect}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
                {this.state.displaying === "items" && (
                    <div className="box">
                        <FontAwesomeIcon icon={faTimes} className="close-icon" onClick={this.closeDisplaying}></FontAwesomeIcon>
                        <div className="box-heading">
                            <p style={{ width: '30%' }}>Name</p>
                            <p style={{ width: '70%' }}>Effect</p>
                        </div>
                        <div className="items">
                            {heldItems.filter(item => item.name.toLowerCase().includes(this.state.searchItem.toLowerCase())).map((item, index) => (
                                <div key={index} onClick={() => this.selectItem(item)} className={`item ${this.state.highlightedItem === item.name ? 'selected' : ''}`}>
                                    <p style={{ width: '30%', display: 'flex', alignItems: 'center', gap: '5px' }}><img src={item.sprite} alt=""></img>{item.name}</p>
                                    <p style={{ width: '70%' }}>{item.effect}</p>
                                </div>
                            ))}
                            {changeItems.filter(item => item.name.toLowerCase().includes(this.state.searchItem.toLowerCase())).map((item, index) => (
                                <div key={index} onClick={() => this.selectItem(item)} className={`item ${this.state.highlightedItem === item.name ? 'selected' : ''}`}>
                                    <p style={{ width: '30%', display: 'flex', alignItems: 'center', gap: '5px' }}><img style={{ width: 30 }} src={item.sprite} alt=""></img>{item.name}</p>
                                    <p style={{ width: '70%' }}>{item.effect}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
                {this.state.displaying === "stats" && (
                    <div className="box">
                        <FontAwesomeIcon icon={faTimes} className="close-icon" onClick={this.closeDisplaying}></FontAwesomeIcon>
                        <table className="stats-table">
                            <tr>
                                <th style={{ textAlign: "left" }}></th>
                                <th>Base</th>
                                <th style={{ width: "100px" }}></th>
                                <th>IV</th>
                                <th>EV</th>
                                <th>Stat</th>
                            </tr>
                            {[0, 1, 2, 3, 4, 5].map(number => (
                                <tr key={number}>
                                    <td style={{ textAlign: "left" }}>{this.state.statNames[number]}</td>
                                    <td>{this.state.baseStats[number]}</td>
                                    <td style={{ width: "100px" }}>
                                        <svg height="12px" width="100px">
                                            <polygon points={points(number)} fill={colors[number]}></polygon>
                                        </svg>
                                    </td>
                                    <td><input className="stat-input" type="number" min="0" max="31" onKeyDown={handleMinus} onBlur={(event) => this.blurStats("iv", number, event)} value={this.state.ivs[number]} onChange={(event) => this.changeStat("iv", number, event)}></input></td>
                                    <td><input className="stat-input" type="number" min="0" max="252" onKeyDown={handleMinus} onBlur={(event) => this.blurStats("ev", number, event)} value={this.state.evs[number]} onChange={(event) => this.changeStat("ev", number, event)}></input></td>
                                    <td>{number === 0 ? Math.floor((this.state.baseStats[0] * 2 + this.state.ivs[0] + this.state.evs[0] / 4) * this.state.level / 100 + this.state.level + 10) : statCalculation(number)}</td>
                                </tr>
                            ))}
                            <tr>
                                <td className="nature">
                                    <label>Nature:</label>
                                    <select value={this.state.nature} onChange={this.changeNature}>
                                        {natures.map((nature, index) => (
                                            <option key={index} value={nature.name}>{nature.name}{nature.effect.length > 0 ? ` (${nature.effect})` : ""}</option>
                                        ))}
                                    </select>
                                </td>
                                <td></td>
                                <td></td>
                                <td></td>
                                <td className="remaining-ev">Remaining: {508 - this.state.evs.reduce((total, value) => total + value, 0)}</td>
                                <td></td>
                            </tr>
                        </table>
                    </div>
                )}
            </div>
        );
    }
}
const heldItems = [
    { name: "Adamant Orb", effect: "Held by dialga: Holder's dragon- and steel-type moves have 1.2× their usual power.", sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/adamant-orb.png" },
    { name: "Lustrous Orb", effect: "Held by palkia: Holder's dragon- and water-type moves have 1.2× their usual power.", sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/lustrous-orb.png" },
    { name: "Figy Berry", effect: "When the holder has 1/2 its max HP remaining or less, it consumes this item to restore 1/8 its max HP. If the holder dislikes spicy flavors (i.e., has a nature that lowers Attack), it will also become confused.", sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/figy-berry.png" },
    { name: "Wiki Berry", effect: "When the holder has 1/2 its max HP remaining or less, it consumes this item to restore 1/8 its max HP. If the holder dislikes dry flavors (i.e., has a nature that lowers Special Attack), it will also become confused.", sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/wiki-berry.png" },
    { name: "Mago Berry", effect: "When the holder has 1/2 its max HP remaining or less, it consumes this item to restore 1/8 its max HP. If the holder dislikes sweet flavors (i.e., has a nature that lowers Speed), it will also become confused.", sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/mago-berry.png" },
    { name: "Aguav Berry", effect: "When the holder has 1/2 its max HP remaining or less, it consumes this item to restore 1/8 its max HP. If the holder dislikes bitter flavors (i.e., has a nature that lowers Special Defense), it will also become confused.", sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/aguav-berry.png" },
    { name: "Iapapa Berry", effect: "When the holder has 1/2 its max HP remaining or less, it consumes this item to restore 1/8 its max HP. If the holder dislikes sour flavors (i.e., has a nature that lowers Defense), it will also become confused.", sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/iapapa-berry.png" },
    { name: "Occa Berry", effect: "When the holder would take super-effective fire-type damage, it consumes this item to halve the amount of damage taken.", sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/occa-berry.png" },
    { name: "Passho Berry", effect: "When the holder would take super-effective water-type damage, it consumes this item to halve the amount of damage taken.", sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/passho-berry.png" },
    { name: "Wacan Berry", effect: "When the holder would take super-effective electric-type damage, it consumes this item to halve the amount of damage taken.", sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/wacan-berry.png" },
    { name: "Rindo Berry", effect: "When the holder would take super-effective grass-type damage, it consumes this item to halve the amount of damage taken.", sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/rindo-berry.png" },
    { name: "Yache Berry", effect: "When the holder would take super-effective ice-type damage, it consumes this item to halve the amount of damage taken.", sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/yache-berry.png" },
    { name: "Chople Berry", effect: "When the holder would take super-effective fighting-type damage, it consumes this item to halve the amount of damage taken.", sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/chople-berry.png" },
    { name: "Kebia Berry", effect: "When the holder would take super-effective poison-type damage, it consumes this item to halve the amount of damage taken.", sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/kebia-berry.png" },
    { name: "Shuca Berry", effect: "When the holder would take super-effective ground-type damage, it consumes this item to halve the amount of damage taken.", sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/shuca-berry.png" },
    { name: "Coba Berry", effect: "When the holder would take super-effective flying-type damage, it consumes this item to halve the amount of damage taken.", sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/coba-berry.png" },
    { name: "Payapa Berry", effect: "When the holder would take super-effective psychic-type damage, it consumes this item to halve the amount of damage taken.", sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/payapa-berry.png" },
    { name: "Tanga Berry", effect: "When the holder would take super-effective bug-type damage, it consumes this item to halve the amount of damage taken.", sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/tanga-berry.png" },
    { name: "Charti Berry", effect: "When the holder would take super-effective rock-type damage, it consumes this item to halve the amount of damage taken.", sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/charti-berry.png" },
    { name: "Kasib Berry", effect: "When the holder would take super-effective ghost-type damage, it consumes this item to halve the amount of damage taken.", sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/kasib-berry.png" },
    { name: "Haban Berry", effect: "When the holder would take super-effective dragon-type damage, it consumes this item to halve the amount of damage taken.", sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/haban-berry.png" },
    { name: "Colbur Berry", effect: "When the holder would take super-effective dark-type damage, it consumes this item to halve the amount of damage taken.", sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/colbur-berry.png" },
    { name: "Babiri Berry", effect: "When the holder would take super-effective steel-type damage, it consumes this item to halve the amount of damage taken.", sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/babiri-berry.png" },
    { name: "Chilan Berry", effect: "When the holder would take normal-type damage, it consumes this item to halve the amount of damage taken.", sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/chilan-berry.png" },
    { name: "Liechi Berry", effect: "When the holder has 1/4 its max HP remaining or less, it consumes this item to raise its Attack by one stage.", sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/liechi-berry.png" },
    { name: "Ganlon Berry", effect: "When the holder has 1/4 its max HP remaining or less, it consumes this item to raise its Defense by one stage.", sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/ganlon-berry.png" },
    { name: "Salac Berry", effect: "When the holder has 1/4 its max HP remaining or less, it consumes this item to raise its Speed by one stage.", sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/salac-berry.png" },
    { name: "Petaya Berry", effect: "When the holder has 1/4 its max HP remaining or less, it consumes this item to raise its Special Attack by one stage.", sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/petaya-berry.png" },
    { name: "Apicot Berry", effect: "When the holder has 1/4 its max HP remaining or less, it consumes this item to raise its Special Defense by one stage.", sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/apicot-berry.png" },
    { name: "Lansat Berry", effect: "When the holder has 1/4 its max HP remaining or less, it consumes this item to raise its critical hit chance by one stage.", sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/lansat-berry.png" },
    { name: "Starf Berry", effect: "When the holder has 1/4 its max HP remaining or less, it consumes this item to raise a random stat by two stages.", sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/starf-berry.png" },
    { name: "Enigma Berry", effect: "When the holder takes super-effective damage, it consumes this item to restore 1/4 its max HP.", sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/enigma-berry.png" },
    { name: "Micle Berry", effect: "When the holder has 1/4 its max HP remaining or less, it consumes this item, and its next used move has 1.2× its normal accuracy.", sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/micle-berry.png" },
    { name: "Custap Berry", effect: "When the holder has 1/4 its max HP remaining or less, it consumes this item. On the following turn, the holder will act first among moves with the same priority, regardless of Speed.", sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/custap-berry.png" },
    { name: "Jaboca Berry", effect: "When the holder takes physical damage, it consumes this item to damage the attacking Pokémon for 1/8 its max HP.", sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/jaboca-berry.png" },
    { name: "Rowap Berry", effect: "When the holder takes special damage, it consumes this item to damage the attacking Pokémon for 1/8 its max HP.", sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/rowap-berry.png" },
    { name: "Roseli Berry", effect: "Consumed when struck by a super-effective Fairy-type attack to halve the damage.", sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/roseli-berry.png" },
    { name: "Kee Berry", effect: "When the holder is hit by a physical move, increases its Defense by one stage.", sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/kee-berry.png" },
    { name: "Maranga Berry", effect: "When the holder is hit by a special move, increases its Special Defense by one stage.", sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/maranga-berry.png" },
    { name: "Cheri Berry", effect: "When the holder is paralyzed, it consumes this item to cure the paralysis.", sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/cheri-berry.png"},
    { name: "Chesto Berry", effect: "When the holder is asleep, it consumes this item to wake up.", sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/chesto-berry.png"},
    { name: "Pecha Berry", effect: "When the holder is poisoned, it consumes this item to cure the poison.", sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/pecha-berry.png"},
    { name: "Rawst Berry", effect: "When the holder is burned, it consumes this item to cure the burn.", sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/rawst-berry.png"},
    { name: "Aspear Berry", effect: "When the holder is frozen, it consumes this item to thaw itself.", sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/aspear-berry.png"},
    { name: "Leppa Berry", effect: "When the holder is out of PP for one of its moves, it consumes this item to restore 10 of that move's PP.", sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/leppa-berry.png"},
    { name: "Oran Berry", effect: "When the holder has 1/2 its max HP remaining or less, it consumes this item to restore 10 HP.", sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/oran-berry.png"},
    { name: "Persim Berry", effect: "When the holder is confused, it consumes this item to cure the confusion.", sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/persim-berry.png"},
    { name: "Lum Berry", effect: "When the holder is afflicted with a major status ailment, it consumes this item to cure the ailment.", sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/lum-berry.png"},
    { name: "Sitrus Berry", effect: "When the holder has 1/2 its max HP remaining or less, it consumes this item to restore 1/4 its max HP.", sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/sitrus-berry.png"},
    { name: "Bright Powder", effect: "Moves targeting the holder have 0.9× chance to hit.", sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/bright-powder.png" },
    { name: "White Herb", effect: "At the end of each turn, if any of the holder's stats have a negative stat modifier, the holder consumes this item to remove the modifiers from those stats.", sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/white-herb.png" },
    { name: "Macho Brace", effect: "When the holder would gain effort due to battle, it gains double that effort instead.Holder has half its Speed.", sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/macho-brace.png" },
    { name: "Quick Claw", effect: "Whenever the holder attempts to use a move, it has a 3/16 chance to act first among moves with the same priority. If multiple Pokémon have this effect at the same time, Speed is the tie-breaker as normal, but the effect of trick room is ignored.", sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/quick-claw.png" },
    { name: "Mental Herb", effect: "When the holder is attracted, it consumes this item to cure the attraction.", sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/mental-herb.png" },
    { name: "Choice Band", effect: "Holder has 1.5× its Attack. When the holder attempts to use a move, all its other moves are disabled until it leaves battle or loses this item. The restriction ends even if this item is swapped for another Choice itemvia trick or switcheroo.", sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/choice-band.png" },
    { name: "Kings Rock", effect: "Holder's damaging moves have a 10% chance to make their target flinch. This chance applies independently to each hit of a multi-hit move. This item's chance is rolled independently of any other move effects;e.g., a move with a 30% chance to flinch normally will have a 37% total chance to flinch when used with this item, because 3% of the time, both effects activate.Held by poliwhirl or slowbro: Holder evolves into politoed or slowking, respectively, when traded.", sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/kings-rock.png" },
    { name: "Silver Powder", effect: "Holder's bug-type moves have 1.2× their power.", sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/silver-powder.png" },
    { name: "Soul Dew", effect: "Held by Latias or Latios: Increases the holder's Special Attack and Special Defense by 50%.", sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/soul-dew.png" },
    { name: "Deep Sea Tooth", effect: "Held by Clamperl: Doubles the holder's Special Attack. Evolves the holder into Huntail when traded.", sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/deep-sea-tooth.png" },
    { name: "Deep Sea Scale", effect: "Held by Clamperl: Doubles the holder's Special Defense. Evolves the holder into Gorebyss when traded.", sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/deep-sea-scale.png" },
    { name: "Smoke Ball", effect: "In wild battles, attempts to run away on the holder's turn will always succeed.", sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/smoke-ball.png" },
    { name: "Focus Band", effect: "If the holder is attacked for regular damage that would faint it, this item has a 10% chance to prevent the holder's HP from lowering below 1.", sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/focus-band.png" },
    { name: "Scope Lens", effect: "Raises the holder's critical hit counter by 1.", sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/scope-lens.png" },
    { name: "Metal Coat", effect: "Increases the power of the holder's Steel moves by 20%.Held by Onix or Scyther: Evolves the holder into Steelix or Scizor when traded, respectively.", sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/metal-coat.png" },
    { name: "Leftovers", effect: "Heals the holder by 1/16 its max HP at the end of each turn.", sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/leftovers.png" },
    { name: "Light Ball", effect: "Held by Pikachu: Doubles the holder's initial Attack and Special Attack.", sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/light-ball.png" },
    { name: "Soft Sand", effect: "Increases the power of the holder's Ground moves by 20%.", sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/soft-sand.png" },
    { name: "Hard Stone", effect: "Increases the power of the holder's Rock moves by 20%.", sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/hard-stone.png" },
    { name: "Miracle Seed", effect: "Increases the power of the holder's Grass moves by 20%.", sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/miracle-seed.png" },
    { name: "Black Glasses", effect: "Increases the power of the holder's Dark moves by 20%.", sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/black-glasses.png" },
    { name: "Black Belt", effect: "Increases the power of the holder's Fighting moves by 20%.", sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/black-belt.png" },
    { name: "Magnet", effect: "Increases the power of the holder's Electric moves by 20%.", sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/magnet.png" },
    { name: "Mystic Water", effect: "Increases the power of the holder's Water moves by 20%.", sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/mystic-water.png" },
    { name: "Sharp Beak", effect: "Increases the power of the holder's Flying moves by 20%.", sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/sharp-beak.png" },
    { name: "Poison Barb", effect: "Increases the power of the holder's Poison moves by 20%.", sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/poison-barb.png" },
    { name: "Never Melt Ice", effect: "Increases the power of the holder's Ice moves by 20%.", sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/never-melt-ice.png" },
    { name: "Spell Tag", effect: "Increases the power of the holder's Ghost moves by 20%.", sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/spell-tag.png" },
    { name: "Twisted Spoon", effect: "Increases the power of the holder's Psychic moves by 20%.", sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/twisted-spoon.png" },
    { name: "Charcoal", effect: "Increases the power of the holder's Fire moves by 20%.", sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/charcoal.png" },
    { name: "Dragon Fang", effect: "Increases the power of the holder's Dragon moves by 20%.", sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/dragon-fang.png" },
    { name: "Silk Scarf", effect: "Increases the power of the holder's Normal moves by 20%.", sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/silk-scarf.png" },
    { name: "Shell Bell", effect: "Heals the holder by 1/8 of any damage it inflicts.", sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/shell-bell.png" },
    { name: "Sea Incense", effect: "Increases the power of the holder's Water moves by 20%.", sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/sea-incense.png" },
    { name: "Lax Incense", effect: "Increases the holder's Evasion by 5%.", sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/lax-incense.png" },
    { name: "Lucky Punch", effect: "Held by Chansey: Raises the holder's critical hit counter by 2.", sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/lucky-punch.png" },
    { name: "Metal Powder", effect: "Held by Ditto: Increases the holder's initial Defense and Special Defense by 50%.", sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/metal-powder.png" },
    { name: "Thick Club", effect: "Held by Cubone or Marowak: Doubles the holder's Attack.", sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/thick-club.png" },
    { name: "Stick", effect: "Held by Farfetch'd: Raises the holder's critical hit counter by 2.", sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/stick.png" },
    { name: "Wide Lens", effect: "Increases the accuracy of any move the holder uses by 10% (multiplied; i.e. 70% accuracy is increased to 77%).", sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/wide-lens.png" },
    { name: "Muscle Band", effect: "Increases the power of the holder's physical moves by 10%.", sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/muscle-band.png" },
    { name: "Wise Glasses", effect: "Increases the power of the holder's special moves by 10%.", sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/wise-glasses.png" },
    { name: "Expert Belt", effect: "When the holder hits with a super-effective move, its power is raised by 20%.", sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/expert-belt.png" },
    { name: "Light Clay", effect: "The holder's Reflect and Light Screen will create effects lasting for eight turns rather than five. As this item affects the move rather than the barrier itself, the effect is not lost if the holder leaves battle or drops this item.", sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/light-clay.png" },
    { name: "Life Orb", effect: "Damage from the holder's moves is increased by 30%. On each turn the holder uses a damage-inflicting move, it takes 10% its max HP in damage.", sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/life-orb.png" },
    { name: "Power Herb", effect: "Whenever the holder uses a move that requires a turn to charge first (Bounce, Dig, Dive, Fly, Razor Wind, Skull Bash, Sky Attack, or Solarbeam), this item is consumed and the charge is skipped. Skull Bash still provides a Defense boost.", sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/power-herb.png" },
    { name: "Toxic Orb", effect: "Badly poisons the holder at the end of each turn.", sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/toxic-orb.png" },
    { name: "Flame Orb", effect: "Burns the holder at the end of each turn.", sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/flame-orb.png" },
    { name: "Quick Powder", effect: "Held by Ditto: Doubles the holder's initial Speed.", sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/quick-powder.png" },
    { name: "Focus Sash", effect: "If the holder has full HP and is attacked for regular damage that would faint it, this item is consumed and prevents the holder's HP from lowering below 1. This effect works against multi-hit attacks, but does not work against the effects of Doom Desire or Future Sight.", sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/focus-sash.png" },
    { name: "Zoom Lens", effect: "Raises the holder's Accuracy by 20% when it goes last.Ingame description is incorrect.", sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/zoom-lens.png" },
    { name: "Metronome", effect: "Each time the holder uses the same move consecutively, its power is increased by another 10% of its original, to a maximum of 100%.", sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/metronome.png" },
    { name: "Iron Ball", effect: "Decreases the holder's Speed by 50%. If the holder is Flying or has Levitate, it takes regular damage from Ground attacks and is suspectible to Spikes and Toxic Spikes.", sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/iron-ball.png" },
    { name: "Lagging Tail", effect: "The holder will go last within its move's priority bracket, regardless of Speed. If multiple Pokémon within the same priority bracket are subject to this effect, the slower Pokémon will go first. The holder will move after Pokémon with Stall. If the holder has Stall, Stall is ignored. This item ignores Trick Room.", sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/lagging-tail.png" },
    { name: "Destiny Knot", effect: "When the holder becomes Attracted, the Pokémon it is Attracted to becomes Attracted back.", sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/destiny-knot.png" },
    { name: "Black Sludge", effect: "If the holder is Poison-type, restores 1/16 max HP at the end of each turn. Otherwise, damages the holder by 1/16 its max HP at the end of each turn.", sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/black-sludge.png" },
    { name: "Icy Rock", effect: "The holder's Hail will create a hailstorm lasting for eight turns rather than five. As this item affects the move rather than the weather itself, the effect is not lost if the holder leaves battle or drops this item.", sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/icy-rock.png" },
    { name: "Smooth Rock", effect: "The holder's Sandstorm will create a sandstorm lasting for eight turns rather than five. As this item affects the move rather than the weather itself, the effect is not lost if the holder leaves battle or drops this item.", sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/smooth-rock.png" },
    { name: "Heat Rock", effect: "The holder's Sunny Day will create sunshine lasting for eight turns rather than five. As this item affects the move rather than the weather itself, the effect is not lost if the holder leaves battle or drops this item.", sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/heat-rock.png" },
    { name: "Damp Rock", effect: "The holder's Rain Dance will create rain lasting for eight turns rather than five. As this item affects the move rather than the weather itself, the effect is not lost if the holder leaves battle or drops this item.", sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/damp-rock.png" },
    { name: "Grip Claw", effect: "Increases the duration of the holder's multiturn (2-5 turn) moves by three turns.", sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/grip-claw.png" },
    { name: "Choice Scarf", effect: "Increases the holder's Speed by 50%, but restricts it to the first move it uses until it leaves battle or loses this item. If this item is swapped for another Choice item via Trick or Switcheroo, the holder's restriction is still lifted, but it will again be restricted to the next move it uses.(Quirk: If the holder is switched in by U-Turn and it also knows U-Turn, U-Turn becomes its restricted move.)", sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/choice-scarf.png" },
    { name: "Sticky Barb", effect: "Damaged the holder for 1/8 its max HP. When the holder is struck by a contact move, damages the attacker for 1/8 its max HP; if the attacker is not holding an item, it will take this item.", sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/sticky-barb.png" },
    { name: "Power Bracer", effect: "Decreases the holder's Speed by 50%. Whenever the holder gains Attack effort from battle, increases that effort by 4; this applies before the PokéRUS doubling effect.", sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/power-bracer.png" },
    { name: "Power Belt", effect: "Decreases the holder's Speed by 50%. Whenever the holder gains Defense effort from battle, increases that effort by 4; this applies before the PokéRUS doubling effect.", sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/power-belt.png" },
    { name: "Power Lens", effect: "Decreases the holder's Speed by 50%. Whenever the holder gains Special Attack effort from battle, increases that effort by 4; this applies before the PokéRUS doubling effect.", sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/power-lens.png" },
    { name: "Power Band", effect: "Decreases the holder's Speed by 50%. Whenever the holder gains Special Defense effort from battle, increases that effort by 4; this applies before the PokéRUS doubling effect.", sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/power-band.png" },
    { name: "Power Anklet", effect: "Decreases the holder's Speed by 50%. Whenever the holder gains Speed effort from battle, increases that effort by 4; this applies before the PokéRUS doubling effect.", sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/power-anklet.png" },
    { name: "Power Weight", effect: "Decreases the holder's Speed by 50%. Whenever the holder gains HP effort from battle, increases that effort by 4; this applies before the PokéRUS doubling effect.", sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/power-weight.png" },
    { name: "Shed Shell", effect: "The holder is unaffected by any moves or abilities that would prevent it from actively leaving battle.", sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/shed-shell.png" },
    { name: "Big Root", effect: "HP restored from Absorb, Aqua Ring, Drain Punch, Dream Eater, Giga Drain, Ingrain, Leech Life, Leech Seed, and Mega Drain is increased by 30%. Damage inflicted is not affected.", sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/big-root.png" },
    { name: "Choice Specs", effect: "Increases the holder's Special Attack by 50%, but restricts it to the first move it uses until it leaves battle or loses this item. If this item is swapped for another Choice item via Trick or Switcheroo, the holder's restriction is still lifted, but it will again be restricted to the next move it uses.(Quirk: If the holder is switched in by U-Turn and it also knows U-Turn, U-Turn becomes its restricted move.)", sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/choice-specs.png" },
    { name: "Odd Incense", effect: "Increases the power of the holder's Psychic moves by 20%.", sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/odd-incense.png" },
    { name: "Rock Incense", effect: "Increases the power of the holder's Rock moves by 20%.", sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/rock-incense.png" },
    { name: "Full Incense", effect: "The holder will go last within its move's priority bracket, regardless of Speed. If multiple Pokémon within the same priority bracket are subject to this effect, the slower Pokémon will go first. The holder will move after Pokémon with Stall. If the holder has Stall, Stall is ignored. This item ignores Trick Room.", sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/full-incense.png" },
    { name: "Wave Incense", effect: "Increases the power of the holder's Water moves by 20%.", sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/wave-incense.png" },
    { name: "Rose Incense", effect: "Increases the power of the holder's Grass moves by 20%.", sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/rose-incense.png" },
    { name: "Razor Claw", effect: "Raises the holder's critical hit counter by 1.Held by Sneasel: Evolves the holder into Weavile when it levels up during the night.", sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/razor-claw.png" },
    { name: "Razor Fang", effect: "When the holder attacks with most damaging moves, provides an extra 11.7% (30/256) chance for the target to flinch.Held by Gligar: Evolves the holder into Gliscor when it levels up.", sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/razor-fang.png" },
    { name: "Griseous Orb", effect: "Held by giratina: Holder's dragon and ghost moves have 1.2× their base power. Holder is in Origin Forme.This item cannot be held by any Pokémon but Giratina. When you enter the Union Room or connect to Wi-Fi, this item returns to your bag.", sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/griseous-orb.png" },
    { name: "Eviolite", effect: "Held by a Pokémon that is not fully evolved: Holder has 1.5× Defense and Special Defense.", sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/eviolite.png" },
    { name: "Float Stone", effect: "Holder has 0.5× weight.", sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/float-stone.png" },
    { name: "Rocky Helmet", effect: "When the holder is hit by a contact move, the attacking Pokémon takes 1/6 its max HP in damage.", sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/rocky-helmet.png" },
    { name: "Air Balloon", effect: "Holder is immune to ground-type moves, spikes, toxic spikes, and arena trap. This effect does not apply during gravity or ingrain. When the holder takes damage from a move, this item is consumed.", sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/air-balloon.png" },
    { name: "Red Card", effect: "When the holder takes damage directly from a move and does not faint, it switches out for another random, non-fainted Pokémon in its party.This effect does not activate if another effect prevents the holder from switching out.", sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/red-card.png" },
    { name: "Ring Target", effect: "When one of the user's types would render it immune to damage, that type is ignored for damage calculation.", sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/ring-target.png" },
    { name: "Binding Band", effect: "Moves used by the holder that trap and damage a target for multiple turns (e.g. bind, fire spin) inflict twice their usual per-turn damage.", sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/binding-band.png" },
    { name: "Absorb Bulb", effect: "When the holder takes water-type damage from a move, its Special Attack rises by one stage and this item is consumed.", sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/absorb-bulb.png" },
    { name: "Cell Battery", effect: "When the holder takes electric-type damage from a move, its Attack rises by one stage and this item is consumed.", sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/cell-battery.png" },
    { name: "Eject Button", effect: "When the holder takes damage directly from a move and does not faint, it switches out for another non-fainted Pokémon in its party, as chosen by the Trainer.This effect does not activate if another effect prevents the holder from switching out.", sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/eject-button.png" },
    { name: "Pass Orb", effect: "Acts as currency to activate Pass Powers in the Entralink.", sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/pass-orb.png" },
    { name: "Weakness Policy", effect: "When the holder is hit by a super effective move, its Attack and Special Attack raise by two stages.", sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/weakness-policy.png" },
    { name: "Assault Vest", effect: "Raises the holder's Special Defense to 1.5×. Prevents the holder from selecting a status move.", sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/assault-vest.png" },
    { name: "Luminous Moss", effect: "If the holder is hit by a damaging Water move, it consumes this item and raises its Special Defense by one stage.", sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/luminous-moss.png" },
    { name: "Snowball", effect: "If the holder is hit by a damaging Ice move, raises its Attack by one stage.", sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/snowball.png" },
    { name: "Safety Goggles", effect: "Prevents damage from powder moves and the damage from Hail and Sandstorm.", sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/safety-goggles.png" },
    { name: "Adrenaline Orb", effect: "Makes wild Pokémon more likely to summon allies. increases the holder's Speed by one stage when affected by Intimidate.", sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/adrenaline-orb.png" },
    { name: "Terrain Extender", effect: "When the holder changes the Terrain (whether by move or ability), it will last 8 turns instead of 5.", sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/terrain-extender.png" },
    { name: "Protective Pads", effect: "Prevents side effects of contact moves used on the holder.", sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/protective-pads.png" },
    { name: "Electric Seed", effect: "If the holder enters battle during Electric Terrain, or if Electric Terrain is activated while the holder is in battle, this item is consumed and the holder's Defense raises by one stage.", sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/electric-seed.png" },
    { name: "Psychic Seed", effect: "If the holder enters battle during Psychic Terrain, or if Psychic Terrain is activated while the holder is in battle, this item is consumed and the holder's Special Defense raises by one stage.", sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/psychic-seed.png" },
    { name: "Misty Seed", effect: "If the holder enters battle during Misty Terrain, or if Misty Terrain is activated while the holder is in battle, this item is consumed and the holder's Special Defense raises by one stage.", sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/misty-seed.png" },
    { name: "Grassy Seed", effect: "If the holder enters battle during Grassy Terrain, or if Grassy Terrain is activated while the holder is in battle, this item is consumed and the holder's Defense raises by one stage.", sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/grassy-seed.png" },
    { name: "Booster Energy", effect: "This item will boost the highest stat of a Pokémon with the ability Protosynthesis or Quark Drive", sprite: "https://www.serebii.net/itemdex/sprites/boosterenergy.png"}
]
const changeItems = [
    { name: "Gengarite", effect: "Allows Gengar to Mega Evolve into Mega Gengar.", sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/gengarite.png", pokemon: "gengar" },
    { name: "Gardevoirite", effect: "Allows Gardevoir to Mega Evolve into Mega Gardevoir.", sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/gardevoirite.png", pokemon: "gardevoir" },
    { name: "Ampharosite", effect: "Allows Ampharos to Mega Evolve into Mega Ampharos.", sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/ampharosite.png", pokemon: "ampharos" },
    { name: "Venusaurite", effect: "Allows Venusaur to Mega Evolve into Mega Venusaur.", sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/venusaurite.png", pokemon: "venusaur" },
    { name: "Charizardite X", effect: "Allows Charizard to Mega Evolve into Mega Charizard X.", sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/charizardite-x.png", pokemon: "charizard" },
    { name: "Charizardite Y", effect: "Allows Charizard to Mega Evolve into Mega Charizard Y.", sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/charizardite-y.png", pokemon: "charizard" },
    { name: "Blastoisinite", effect: "Allows Blastoise to Mega Evolve into Mega Blastoise.", sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/blastoisinite.png", pokemon: "blastoise" },
    { name: "Mewtwonite X", effect: "Allows Mewtwo to Mega Evolve into Mega Mewtwo X.", sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/mewtwonite-x.png", pokemon: "mewtwo" },
    { name: "Mewtwonite Y", effect: "Allows Mewtwo to Mega Evolve into Mega Mewtwo Y.", sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/mewtwonite-y.png", pokemon: "mewtwo" },
    { name: "Blazikenite", effect: "Allows Blaziken to Mega Evolve into Mega Blaziken.", sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/blazikenite.png", pokemon: "blaziken" },
    { name: "Medichamite", effect: "Allows Medicham to Mega Evolve into Mega Medicham.", sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/medichamite.png", pokemon: "medicham" },
    { name: "Houndoominite", effect: "Allows Houndoom to Mega Evolve into Mega Houndoom.", sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/houndoominite.png", pokemon: "houndoom" },
    { name: "Aggronite", effect: "Allows Aggron to Mega Evolve into Mega Aggron.", sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/aggronite.png", pokemon: "aggron" },
    { name: "Banettite", effect: "Allows Banette to Mega Evolve into Mega Banette.", sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/banettite.png", pokemon: "banette" },
    { name: "Tyranitarite", effect: "Allows Tyranitar to Mega Evolve into Mega Tyranitar.", sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/tyranitarite.png", pokemon: "tyranitar" },
    { name: "Scizorite", effect: "Allows Scizor to Mega Evolve into Mega Scizor.", sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/scizorite.png", pokemon: "scizor" },
    { name: "Pinsirite", effect: "Allows Pinsir to Mega Evolve into Mega Pinsir.", sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/pinsirite.png", pokemon: "pinsir" },
    { name: "Aerodactylite", effect: "Allows Aerodactyl to Mega Evolve into Mega Aerodactyl.", sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/aerodactylite.png", pokemon: "aerodactyl" },
    { name: "Lucarionite", effect: "Allows Lucario to Mega Evolve into Mega Lucario.", sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/lucarionite.png", pokemon: "lucario" },
    { name: "Abomasite", effect: "Allows Abomasnow to Mega Evolve into Mega Abomasnow.", sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/abomasite.png", pokemon: "abomasnow" },
    { name: "Kangaskhanite", effect: "Allows Kangaskhan to Mega Evolve into Mega Kangaskhan.", sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/kangaskhanite.png", pokemon: "kangaskhan" },
    { name: "Gyaradosite", effect: "Allows Gyarados to Mega Evolve into Mega Gyarados.", sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/gyaradosite.png", pokemon: "gyarados" },
    { name: "Absolite", effect: "Allows Absol to Mega Evolve into Mega Absol.", sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/absolite.png", pokemon: "absol" },
    { name: "Alakazite", effect: "Allows Alakazam to Mega Evolve into Mega Alakazam.", sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/alakazite.png", pokemon: "alakazam" },
    { name: "Heracronite", effect: "Allows Heracross to Mega Evolve into Mega Heracross.", sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/heracronite.png", pokemon: "heracross" },
    { name: "Mawilite", effect: "Allows Mawile to Mega Evolve into Mega Mawile.", sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/mawilite.png", pokemon: "mawile" },
    { name: "Manectite", effect: "Allows Manectric to Mega Evolve into Mega Manectric.", sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/manectite.png", pokemon: "manectric" },
    { name: "Garchompite", effect: "Allows Garchomp to Mega Evolve into Mega Garchomp.", sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/garchompite.png", pokemon: "garchomp" },
    { name: "Latiasite", effect: "Allows Latias to Mega Evolve into Mega Latias.", sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/latiasite.png", pokemon: "latias" },
    { name: "Latiosite", effect: "Allows Latios to Mega Evolve into Mega Latios.", sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/latiosite.png", pokemon: "latios" },
    { name: "Swampertite", effect: "Allows Swampert to Mega Evolve into Mega Swampert.", sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/swampertite.png", pokemon: "swampert" },
    { name: "Sceptilite", effect: "Allows Sceptile to Mega Evolve into Mega Sceptile.", sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/sceptilite.png", pokemon: "sceptile" },
    { name: "Sablenite", effect: "Allows Sableye to Mega Evolve into Mega Sableye.", sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/sablenite.png", pokemon: "sableye" },
    { name: "Altarianite", effect: "Allows Altaria to Mega Evolve into Mega Altaria.", sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/altarianite.png", pokemon: "altaria" },
    { name: "Galladite", effect: "Allows Gallade to Mega Evolve into Mega Gallade.", sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/galladite.png", pokemon: "gallade" },
    { name: "Audinite", effect: "Allows Audino to Mega Evolve into Mega Audino.", sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/audinite.png", pokemon: "audino" },
    { name: "Metagrossite", effect: "Allows Metagross to Mega Evolve into Mega Metagross.", sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/metagrossite.png", pokemon: "metagross" },
    { name: "Sharpedonite", effect: "Allows Sharpedo to Mega Evolve into Mega Sharpedo.", sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/sharpedonite.png", pokemon: "sharpedo" },
    { name: "Slowbronite", effect: "Allows Slowbro to Mega Evolve into Mega Slowbro.", sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/slowbronite.png", pokemon: "slowbro" },
    { name: "Steelixite", effect: "Allows Steelix to Mega Evolve into Mega Steelix.", sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/steelixite.png", pokemon: "steelix" },
    { name: "Pidgeotite", effect: "Allows Pidgeot to Mega Evolve into Mega Pidgeot.", sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/pidgeotite.png", pokemon: "pidgeot" },
    { name: "Glalitite", effect: "Allows Glalie to Mega Evolve into Mega Glalie.", sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/glalitite.png", pokemon: "glalie" },
    { name: "Diancite", effect: "Allows Diancie to Mega Evolve into Mega Diancie.", sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/diancite.png", pokemon: "diancie" },
    { name: "Cameruptite", effect: "Allows Camerupt to Mega Evolve into Mega Camerupt.", sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/cameruptite.png", pokemon: "camerupt" },
    { name: "Lopunnite", effect: "Allows Lopunny to Mega Evolve into Mega Lopunny.", sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/lopunnite.png", pokemon: "lopunny" },
    { name: "Salamencite", effect: "Allows Salamence to Mega Evolve into Mega Salamence.", sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/salamencite.png", pokemon: "salamence" },
    { name: "Beedrillite", effect: "Allows Beedrill to Mega Evolve into Mega Beedrill.", sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/beedrillite.png", pokemon: "beedrill" },
    { name: "Douse Drive", effect: "Held by genesect: Holder's buster is blue, and its techno blast is water-type.", sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/douse-drive.png", pokemon: "genesect", changeEffect: "form", formTarget: "genesect-douse" },
    { name: "Shock Drive", effect: "Held by genesect: Holder's buster is yellow, and its techno blast is electric-type.", sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/shock-drive.png", pokemon: "genesect", changeEffect: "form", formTarget: "genesect-shock" },
    { name: "Burn Drive", effect: "Held by genesect: Holder's buster is red, and its techno blast is fire-type.", sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/burn-drive.png", pokemon: "genesect", changeEffect: "form", formTarget: "genesect-burn" },
    { name: "Chill Drive", effect: "Held by genesect: Holder's buster is white, and its techno blast becomes ice-type.", sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/chill-drive.png", pokemon: "genesect", changeEffect: "form", formTarget: "genesect-chill" },
    { name: "Normalium Z", effect: "Allows a Pokémon to use the Z-move equivalents of its Normal moves.", sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/normalium-z--held.png", pokemon: "arceus", changeEffect: "form", formTarget: "" },
    { name: "Firium Z", effect: "Allows a Pokémon to use the Z-move equivalents of its Fire moves.", sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/firium-z--held.png", pokemon: "arceus", changeEffect: "form", formTarget: "arceus-fire" },
    { name: "Waterium Z", effect: "Allows a Pokémon to use the Z-move equivalents of its Water moves.", sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/waterium-z--held.png", pokemon: "arceus", changeEffect: "form", formTarget: "arceus-water" },
    { name: "Electrium Z", effect: "Allows a Pokémon to use the Z-move equivalents of its Electric moves.", sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/electrium-z--held.png", pokemon: "arceus", changeEffect: "form", formTarget: "arceus-electric" },
    { name: "Grassium Z", effect: "Allows a Pokémon to use the Z-move equivalents of its Grass moves.", sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/grassium-z--held.png", pokemon: "arceus", changeEffect: "form", formTarget: "arceus-grass" },
    { name: "Icium Z", effect: "Allows a Pokémon to use the Z-move equivalents of its Ice moves.", sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/icium-z--held.png", pokemon: "arceus", changeEffect: "form", formTarget: "arceus-ice" },
    { name: "Fightinium Z", effect: "Allows a Pokémon to use the Z-move equivalents of its Fighting moves.", sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/fightinium-z--held.png", pokemon: "arceus", changeEffect: "form", formTarget: "arceus-fighting" },
    { name: "Poisonium Z", effect: "Allows a Pokémon to use the Z-move equivalents of its Poison moves.", sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/poisonium-z--held.png", pokemon: "arceus", changeEffect: "form", formTarget: "arceus-poison" },
    { name: "Groundium Z", effect: "Allows a Pokémon to use the Z-move equivalents of its Ground moves.", sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/groundium-z--held.png", pokemon: "arceus", changeEffect: "form", formTarget: "arceus-ground" },
    { name: "Flyinium Z", effect: "Allows a Pokémon to use the Z-move equivalents of its Flying moves.", sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/flyinium-z--held.png", pokemon: "arceus", changeEffect: "form", formTarget: "arceus-flying" },
    { name: "Psychium Z", effect: "Allows a Pokémon to use the Z-move equivalents of its Psychic moves.", sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/psychium-z--held.png", pokemon: "arceus", changeEffect: "form", formTarget: "arceus-psychic" },
    { name: "Buginium Z", effect: "Allows a Pokémon to use the Z-move equivalents of its Bug moves.", sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/buginium-z--held.png", pokemon: "arceus", changeEffect: "form", formTarget: "arceus-bug" },
    { name: "Rockium Z", effect: "Allows a Pokémon to use the Z-move equivalents of its Rock moves.", sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/rockium-z--held.png", pokemon: "arceus", changeEffect: "form", formTarget: "arceus-rock" },
    { name: "Ghostium Z", effect: "Allows a Pokémon to use the Z-move equivalents of its Ghost moves.", sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/ghostium-z--held.png", pokemon: "arceus", changeEffect: "form", formTarget: "arceus-ghost" },
    { name: "Dragonium Z", effect: "Allows a Pokémon to use the Z-move equivalents of its Dragon moves.", sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/dragonium-z--held.png", pokemon: "arceus", changeEffect: "form", formTarget: "arceus-dragon" },
    { name: "Darkinium Z", effect: "Allows a Pokémon to use the Z-move equivalents of its Dark moves.", sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/darkinium-z--held.png", pokemon: "arceus", changeEffect: "form", formTarget: "arceus-dark" },
    { name: "Steelium Z", effect: "Allows a Pokémon to use the Z-move equivalents of its Steel moves.", sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/steelium-z--held.png", pokemon: "arceus", changeEffect: "form", formTarget: "arceus-steel" },
    { name: "Fairium Z", effect: "Allows a Pokémon to use the Z-move equivalents of its Fairy moves.", sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/fairium-z--held.png", pokemon: "arceus", changeEffect: "form", formTarget: "arceus-fairy" },
    { name: "Pikanium Z", effect: "Allows pikachu to upgrade volt tackle into catastropika.", sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/pikanium-z--held.png", pokemon: "pikachu", changeEffect: "move", moveSource: "Volt Tackle", moveTarget: "catastropika" },
    { name: "Decidium Z", effect: "Allows decidueye to upgrade spirit shackle into sinister arrow raid.", sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/decidium-z--held.png", pokemon: "decidueye", changeEffect: "move", moveSource: "Spirit Shackle", moveTarget: "sinister-arrow-raid" },
    { name: "Incinium Z", effect: "Allows incineroar to upgrade darkest lariat into malicious moonsault.", sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/incinium-z--held.png", pokemon: "incineroar", changeEffect: "move", moveSource: "Darkest Lariat", moveTarget: "malicious-moonsault" },
    { name: "Primarium Z", effect: "Allows primarina to upgrade sparkling aria into oceanic operetta.", sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/primarium-z--held.png", pokemon: "primarina", changeEffect: "move", moveSource: "Sparkling Aria", moveTarget: "oceanic-operetta" },
    { name: "Tapunium Z", effect: "Allows tapu koko, tapu lele, tapu bulu, and tapu fini to upgrade natures madness into guardian of alola.", sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/tapunium-z--held.png", pokemon: ["tapu-koko", "tapu-lele", "tapu-bulu", "tapu-fini"], changeEffect: "move", moveSource: "Natures Madness", moveTarget: "guardian-of-alola" },
    { name: "Marshadium Z", effect: "Allows marshadow to upgrade spectral thief into soul stealing 7 star strike.", sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/marshadium-z--held.png", pokemon: "marshadow", changeEffect: "move", moveSource: "Spectral Thief", moveTarget: "soul-stealing-7-star-strike" },
    { name: "Aloraichium Z", effect: "Allows Alola raichu to upgrade thunderbolt into stoked sparksurfer.", sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/aloraichium-z--held.png", pokemon: "raichu", changeEffect: "move", moveSource: "Thunderbolt", moveTarget: "stoked-sparksurfer", moveChangeForm: "raichu-alola"},
    { name: "Snorlium Z", effect: "Allows snorlax to upgrade giga impact into pulverizing pancake.", sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/snorlium-z--held.png", pokemon: "snorlax", changeEffect: "move", moveSource: "Giga Impact", moveTarget: "pulverizing-pancake" },
    { name: "Eevium Z", effect: "Allows eevee to upgrade last resort into extreme evoboost.", sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/eevium-z--held.png", pokemon: "eevee", changeEffect: "move", moveSource: "Last Resort", moveTarget: "extreme-evoboost" },
    { name: "Mewnium Z", effect: "Allows mew to upgrade psychic into genesis supernova.", sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/mewnium-z--held.png", pokemon: "mew", changeEffect: "move", moveSource: "Psychic", moveTarget: "genesis-supernova" },
    { name: "Pikashunium Z", effect: "Allows cap-wearing pikachu to upgrade thunderbolt into 10 000 000 volt thunderbolt.", sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/pikashunium-z--held.png", pokemon: "pikachu", changeEffect: "move", moveSource: "Thunderbolt", moveTarget: "10-000-000-volt-thunderbolt", moveChangeForm: "cap" },
    { name: "Fighting Memory", effect: "Changes Silvally to its Fighting form. Changes Multi-Attack's type to Fighting.", sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/fighting-memory.png", pokemon: "silvally", changeEffect: "form", formTarget: "silvally-fighting" },
    { name: "Flying Memory", effect: "Changes Silvally to its Flying form. Changes Multi-Attack's type to Flying.", sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/flying-memory.png", pokemon: "silvally", changeEffect: "form", formTarget: "silvally-flying" },
    { name: "Poison Memory", effect: "Changes Silvally to its Poison form. Changes Multi-Attack's type to Poison.", sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/poison-memory.png", pokemon: "silvally", changeEffect: "form", formTarget: "silvally-poison" },
    { name: "Ground Memory", effect: "Changes Silvally to its Ground form. Changes Multi-Attack's type to Ground.", sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/ground-memory.png", pokemon: "silvally", changeEffect: "form", formTarget: "silvally-ground" },
    { name: "Rock Memory", effect: "Changes Silvally to its Rock form. Changes Multi-Attack's type to Rock.", sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/rock-memory.png", pokemon: "silvally", changeEffect: "form", formTarget: "silvally-rock" },
    { name: "Bug Memory", effect: "Changes Silvally to its Bug form. Changes Multi-Attack's type to Bug.", sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/bug-memory.png", pokemon: "silvally", changeEffect: "form", formTarget: "silvally-bug" },
    { name: "Ghost Memory", effect: "Changes Silvally to its Ghost form. Changes Multi-Attack's type to Ghost.", sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/ghost-memory.png", pokemon: "silvally", changeEffect: "form", formTarget: "silvally-ghost" },
    { name: "Steel Memory", effect: "Changes Silvally to its Steel form. Changes Multi-Attack's type to Steel.", sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/steel-memory.png", pokemon: "silvally", changeEffect: "form", formTarget: "silvally-steel" },
    { name: "Fire Memory", effect: "Changes Silvally to its Fire form. Changes Multi-Attack's type to Fire.", sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/fire-memory.png", pokemon: "silvally", changeEffect: "form", formTarget: "silvally-fire" },
    { name: "Water Memory", effect: "Changes Silvally to its Water form. Changes Multi-Attack's type to Water.", sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/water-memory.png", pokemon: "silvally", changeEffect: "form", formTarget: "silvally-water" },
    { name: "Grass Memory", effect: "Changes Silvally to its Grass form. Changes Multi-Attack's type to Grass.", sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/grass-memory.png", pokemon: "silvally", changeEffect: "form", formTarget: "silvally-grass" },
    { name: "Electric Memory", effect: "Changes Silvally to its Electric form. Changes Multi-Attack's type to Electric.", sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/electric-memory.png", pokemon: "silvally", changeEffect: "form", formTarget: "silvally-electric" },
    { name: "Psychic Memory", effect: "Changes Silvally to its Psychic form. Changes Multi-Attack's type to Psychic.", sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/psychic-memory.png", pokemon: "silvally", changeEffect: "form", formTarget: "silvally-psychic" },
    { name: "Ice Memory", effect: "Changes Silvally to its Ice form. Changes Multi-Attack's type to Ice.", sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/ice-memory.png", pokemon: "silvally", changeEffect: "form", formTarget: "silvally-ice" },
    { name: "Dragon Memory", effect: "Changes Silvally to its Dragon form. Changes Multi-Attack's type to Dragon.", sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/dragon-memory.png", pokemon: "silvally", changeEffect: "form", formTarget: "silvally-dragon" },
    { name: "Dark Memory", effect: "Changes Silvally to its Dark form. Changes Multi-Attack's type to Dark.", sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/dark-memory.png", pokemon: "silvally", changeEffect: "form", formTarget: "silvally-dark" },
    { name: "Fairy Memory", effect: "Changes Silvally to its Fairy form. Changes Multi-Attack's type to Fairy.", sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/fairy-memory.png", pokemon: "silvally", changeEffect: "form", formTarget: "silvally-fairy" },
    { name: "Flame Plate", effect: "Fire-Type moves from holder do 20% more damage. Changes Arceus's and Judgment's type to Fire.", sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/flame-plate.png", pokemon: "arceus", changeEffect: "form", formTarget: "arceus-fire" },
    { name: "Splash Plate", effect: "Water-Type moves from holder do 20% more damage. Changes Arceus's and Judgment's type to Water.", sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/splash-plate.png", pokemon: "arceus", changeEffect: "form", formTarget: "arceus-water" },
    { name: "Zap Plate", effect: "Electric-Type moves from holder do 20% more damage. Changes Arceus's and Judgment's type to Electric.", sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/zap-plate.png", pokemon: "arceus", changeEffect: "form", formTarget: "arceus-electric" },
    { name: "Meadow Plate", effect: "Grass-Type moves from holder do 20% more damage. Changes Arceus's and Judgment's type to Grass.", sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/meadow-plate.png", pokemon: "arceus", changeEffect: "form", formTarget: "arceus-grass" },
    { name: "Icicle Plate", effect: "Ice-Type moves from holder do 20% more damage. Changes Arceus's and Judgment's type to Ice.", sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/icicle-plate.png", pokemon: "arceus", changeEffect: "form", formTarget: "arceus-ice" },
    { name: "Fist Plate", effect: "Fighting-Type moves from holder do 20% more damage. Changes Arceus's and Judgment's type to Fighting.", sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/fist-plate.png", pokemon: "arceus", changeEffect: "form", formTarget: "arceus-fighting" },
    { name: "Toxic Plate", effect: "Poison-Type moves from holder do 20% more damage. Changes Arceus's and Judgment's type to Poison.", sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/toxic-plate.png", pokemon: "arceus", changeEffect: "form", formTarget: "arceus-poison" },
    { name: "Earth Plate", effect: "Ground-Type moves from holder do 20% more damage. Changes Arceus's and Judgment's type to Ground.", sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/earth-plate.png", pokemon: "arceus", changeEffect: "form", formTarget: "arceus-ground" },
    { name: "Sky Plate", effect: "Flying-Type moves from holder do 20% more damage. Changes Arceus's and Judgment's type to Flying.", sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/sky-plate.png", pokemon: "arceus", changeEffect: "form", formTarget: "arceus-flying" },
    { name: "Mind Plate", effect: "Psychic-Type moves from holder do 20% more damage. Changes Arceus's and Judgment's type to Psychic.", sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/mind-plate.png", pokemon: "arceus", changeEffect: "form", formTarget: "arceus-psychic" },
    { name: "Insect Plate", effect: "Bug-Type moves from holder do 20% more damage. Changes Arceus's and Judgment's type to Bug.", sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/insect-plate.png", pokemon: "arceus", changeEffect: "form", formTarget: "arceus-bug" },
    { name: "Stone Plate", effect: "Rock-Type moves from holder do 20% more damage. Changes Arceus's and Judgment's type to Rock.", sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/stone-plate.png", pokemon: "arceus", changeEffect: "form", formTarget: "arceus-rock" },
    { name: "Spooky Plate", effect: "Ghost-Type moves from holder do 20% more damage. Changes Arceus's and Judgment's type to Ghost.", sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/spooky-plate.png", pokemon: "arceus", changeEffect: "form", formTarget: "arceus-ghost" },
    { name: "Draco Plate", effect: "Dragon-Type moves from holder do 20% more damage. Changes Arceus's and Judgment's type to Dragon.", sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/draco-plate.png", pokemon: "arceus", changeEffect: "form", formTarget: "arceus-dragon" },
    { name: "Dread Plate", effect: "Dark-Type moves from holder do 20% more damage. Changes Arceus's and Judgment's type to Dark.", sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/dread-plate.png", pokemon: "arceus", changeEffect: "form", formTarget: "arceus-dark" },
    { name: "Iron Plate", effect: "Steel-Type moves from holder do 20% more damage. Changes Arceus's and Judgment's type to Steel.", sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/iron-plate.png", pokemon: "arceus", changeEffect: "form", formTarget: "arceus-steel" },
    { name: "Pixie Plate", effect: "Fairy-Type moves from holder do 20% more damage. Changes Arceus's and Judgment's type to Fairy.", sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/pixie-plate.png", pokemon: "arceus", changeEffect: "form", formTarget: "arceus-fairy" },
    { name: "Rusted Sword", effect: "Changes Zacian to its Crowned Sword form.", sprite: "https://www.serebii.net/itemdex/sprites/rustedsword.png", pokemon: "zacian", changeEffect: "form", formTarget: "zacian-crowned" },
    { name: "Rusted Shield", effect: "Changes Zamazenta to its Crowned Shield form.", sprite: "https://www.serebii.net/itemdex/sprites/rustedshield.png", pokemon: "zamazenta", changeEffect: "form", formTarget: "zamazenta-crowned" }
]
export default Team;
