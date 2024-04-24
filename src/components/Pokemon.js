import React from 'react';
import axios from 'axios';
import Select from 'react-select';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faAngleDown } from '@fortawesome/free-solid-svg-icons';
import './Pokemon.css'

// disable these characters in the level input
const handleMinus = (event) => {
    if (['-', '+', 'e', 'E', '.'].includes(event.key)) {
        event.preventDefault();
    }
}

// styling of dropdown component
const selectStyles = {
    control: provided => ({
        ...provided,
        minHeight: 0,
        height: '19px',
        border: '1px solid black',
        borderRadius: '2px'
    }),
    valueContainer: provided => ({
        ...provided,
        padding: '0 3px',
        fontSize: '13.3333px',
        height: '17px'
    }),
    input: provided => ({
        ...provided,
        margin: '0px',
        padding: '0px',
        height: '17px'
    }),
    singleValue: provided => ({
        ...provided,
        margin: '0px',
        height: '17px'
    }),
    placeholder: provided => ({
        ...provided,
        color: 'black',
        margin: '0px'

    }),
    indicatorsContainer: provided => ({
        ...provided,
        width: '14px',
        height: '17px',
    }),
    menu: provided => ({
        ...provided,
        margin: '0px',
    }),
    menuList: provided => ({
        ...provided,
        padding: '0px'
    }),
    option: (provided, state) => ({
        ...provided,
        fontSize: '15px',
        padding: '2px 3px',
        color: state.data === state.selectProps.value ? "white" : "black",
        backgroundColor: state.data === state.selectProps.value ? "darkblue" : "white",
    })
}

// icon for the dropdown menu
const CustomDropdownIndicator = () => {
    return <FontAwesomeIcon icon={faAngleDown} style={{ fontSize: '12px' }} />
};

// all natures and their effects
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

// function to calculate stats based on natures
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

// these properties will be saved in the local storage
const propertiesToSave = ["currentId", "nickname", "level", "gender", "shiny", "form", "heldItem", "ability", "nature", "changeBackMove"]

class Pokemon extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            loading: false,
            currentId: null,
            currentMove: null, selectDisabled: false,
            pokemon: { name: "" }, sprite: "",
            nickname: "", level: null, gender: null, shiny: "No",
            highlightedMoves: ["", "", "", ""], importedMoves: [], moves: [],
            replacedMove: {}, newMove: "", changeBackMove: false,
            changeBackForm: false, needToReimport: false,
            heldItem: "", abilities: [], ability: "",
            gender_rate: 10, has_gender_differences: false,
            forms: [], form: "", defaultForm: "Default",
            ivs: [], evs: [], nature: "", natureMultipliers: [],
            coords: "", maxStats: []
        }
        this.moveRefs = [React.createRef(), React.createRef(), React.createRef(), React.createRef()]
        this.choosePokemon = this.choosePokemon.bind(this);
        this.exportMoves = this.exportMoves.bind(this);
        this.filterMoves = this.filterMoves.bind(this);
        this.changeNickname = this.changeNickname.bind(this);
        this.changeLevel = this.changeLevel.bind(this);
        this.changeGender = this.changeGender.bind(this);
        this.changeShiny = this.changeShiny.bind(this);
        this.resetLevel = this.resetLevel.bind(this);
        this.changeForm = this.changeForm.bind(this);
        this.exportAbilities = this.exportAbilities.bind(this)
        this.filterAbilities = this.filterAbilities.bind(this)
        this.filterHeldItem = this.filterHeldItem.bind(this)
        this.openItems = this.openItems.bind(this)
        this.openStats = this.openStats.bind(this)
        this.changeMinorForm = this.changeMinorForm.bind(this)
        this.changeMoveType = this.changeMoveType.bind(this)
        this.replaceMove = this.replaceMove.bind(this)
        this.revertMove = this.revertMove.bind(this)
        this.autocompleteAbility = this.autocompleteAbility.bind(this)
        this.autocompleteItem = this.autocompleteItem.bind(this)
        this.autocompleteMove = this.autocompleteMove.bind(this)
        this.disableSelect = this.disableSelect.bind(this)
    }

    // change nickname of pokemon
    changeNickname(event) {
        this.setState({ nickname: event.target.value.length > 12 ? this.state.nickname : event.target.value })
    }

    // open the select items menu, scroll is a boolean value indicating whether to scroll to the held item in the menu
    openItems(scroll) {
        if (this.state.currentId !== null) {
            this.props.openItems(this.state.heldItem, scroll);
        }
    }

    // dynamically filter the items menu when typing in the input box
    filterHeldItem(event) {
        if (this.state.currentId !== null && !this.state.loading) {
            let item = changeItems.filter(item => item.name === event.target.value)[0]
            // if the previous item is tied to the pokemon form, switch back pokemon form to default 
            if (this.state.form.includes("-mega") || (["arceus", "genesect", "silvally", "zacian", "zamazenta"].includes(this.state.pokemon.name) && this.state.form !== "")) {
                this.changeForm({ target: { value: "" }, item: { name: event.target.value } })
            // if the new item can change pokemon form, call function to change its form, if the item can change pokemon move, call function to change its move
            } else if (item !== undefined && item.pokemon.includes(this.state.pokemon.name) && item.hasOwnProperty("changeEffect")) {
                if (item.changeEffect.includes("form")) this.changeForm({ target: { value: item.formTarget }, item: item })
                else if (item.changeEffect.includes("move")) {
                    if (!item.hasOwnProperty("moveChangeForm") || this.state.form.includes(item.moveChangeForm)) {
                        this.replaceMove(item)
                    }
                    this.setState({ heldItem: event.target.value })
                }
            // if the pokemon has a move tied to the previous item, revert it to original move
            } else if (this.state.changeBackMove) {
                this.revertMove()
                this.setState({ heldItem: event.target.value })
            // if none of the above, update state with the new item
            } else {
                this.setState({ heldItem: event.target.value })
            }
            // call the props to filter the items menu
            this.props.filterHeldItem(event.target.value)
        }
    }
    
    // change form of pokemon
    changeForm(event) {
        // if the pokemon already has the designated form, return
        if (this.state.form === event.target.value) {
            if (event.hasOwnProperty("item")) this.setState({ heldItem: event.item.name })
            return
        }
        this.setState({
            form: event.target.value,
            loading: true,
            heldItem: event.hasOwnProperty("item") ? event.item.name : this.state.heldItem
        }, () => {
            // call the api to get form information
            if (this.state.forms.filter(form => form.name === event.target.value).length > 0) {
                axios.get("https://pokeapi.co/api/v2/pokemon/" + event.target.value).then(response => {
                    let pokemon = { ...this.state.pokemon }
                    let changeBackForm = false
                    let itemChanged = false
                    pokemon.abilities = response.data.abilities
                    pokemon.stats = response.data.stats
                    pokemon.types = response.data.types
                    this.importAbilities(response)
                    // if the api returns a list of moves, call the api again for moves information
                    if (response.data.moves.length > 0) {
                        this.importMoves(response)
                        pokemon.moves = response.data.moves
                        // if the form is a mega evolution or has crowned in its name, update the pokemon with needed item
                        if ((response.data.name.includes("mega") && this.state.pokemon.name !== "rayquaza") || response.data.name.includes("crowned")) {
                            changeBackForm = true
                            let item = this.state.heldItem
                            if (response.data.name.includes("mega")) {
                                item = changeItems.filter(item => item.pokemon === this.state.pokemon.name && item.effect.includes("Mega Evolve"))[event.target.value.endsWith("y") && ["mewtwo", "charizard"].includes(this.state.pokemon.name) ? 1 : 0].name
                            } else if (response.data.name.includes("crowned")) {
                                item = changeItems.filter(item => item.pokemon === this.state.pokemon.name)[0].name
                            }
                            if (item !== this.state.heldItem) {
                                this.setState({ heldItem: item })
                                itemChanged = true
                            }
                        }
                    // if the form is a gmax, call the api on the default form to get its moves
                    } else if (response.data.name.includes("gmax")) {
                        let id = event.target.value.endsWith('10227/') ? 10191 : event.target.value.endsWith('10228/') ? 10184 : this.state.currentId
                        axios.get('https://pokeapi.co/api/v2/pokemon/' + id).then(response2 => {
                            pokemon.moves = response2.data.moves
                            this.importMoves(response2)
                        })
                    }
                    this.setState({
                        needToReimport: true,
                        changeBackForm: changeBackForm,
                        pokemon: pokemon
                    }, () => {
                        this.updateStats()
                        if (this.props.isEditing && this.props.displaying === "stats") this.openStats()
                        else if (itemChanged && this.props.isEditing && this.props.displaying === "items") this.openItems(true)
                    })
                })
            } else {
                // if reverting to default form, call api to get moves and abilities
                if (this.state.needToReimport || event.target.value === "") {
                    axios.get('https://pokeapi.co/api/v2/pokemon/' + this.state.currentId).then(response => {
                        let pokemon = { ...this.state.pokemon }
                        let item = this.state.heldItem
                        let needToReimport = this.state.needToReimport
                        let itemChanged = false
                        if (this.state.needToReimport) {
                            pokemon.moves = response.data.moves;
                            pokemon.abilities = response.data.abilities;
                            pokemon.stats = response.data.stats;
                            if (event.target.value !== "" && this.state.pokemon.name !== "alcremie") {
                                this.importMoves(response, event)
                            } else {
                                this.importMoves(response)
                            }
                            this.importAbilities(response)
                        }
                        if (event.target.value === "") {
                            pokemon.types = response.data.types;
                            // if the pokemon is 1 of these 5, revert the special move type to normal
                            if (["arceus", "genesect", "silvally", "zacian", "zamazenta"].includes(this.state.pokemon.name)) {
                                if (["arceus", "genesect", "silvally"].includes(this.state.pokemon.name)) this.changeMoveType("normal")
                                if (!event.hasOwnProperty("item")) {
                                    item = ""
                                    itemChanged = true
                                }
                            }
                        }
                        this.setState({
                            pokemon: pokemon,
                            changeBackForm: false,
                            needToReimport: false,
                            heldItem: item,
                            loading: !needToReimport && event.target.value !== "" && this.state.pokemon.name !== "alcremie" ? true : false
                        }, () => {
                            if (needToReimport) {
                                this.updateStats()
                                if (this.props.isEditing && this.props.displaying === "stats") {
                                    this.openStats()
                                }
                            }
                            if (itemChanged && this.props.isEditing && this.props.displaying === "items") {
                                this.openItems()
                            }
                            if (!needToReimport && event.target.value !== "" && this.state.pokemon.name !== "alcremie") {
                                this.changeMinorForm(event)
                            }
                        })
                    })
                } else if (event.target.value !== "" && this.state.pokemon.name !== "alcremie") {
                    this.changeMinorForm(event)
                }
            }
        })
    }

    // this method allows for form change without importing new moves and abilities
    changeMinorForm(event) {
        let item = this.state.heldItem
        let changeBackForm = false
        let itemChanged = false;
        // if the pokemon is 1 of these 3, give it the needed held item and change move type accordingly
        if (["arceus", "genesect", "silvally"].includes(this.state.pokemon.name)) {
            let form = event.target.value.replace(new RegExp(`${this.state.pokemon.name}-`), "")
            if (!event.hasOwnProperty("item")) {
                item = changeItems.filter(item => item.pokemon === this.state.pokemon.name && (this.state.pokemon.name === "arceus" ? item.effect.toLowerCase().startsWith(form) : item.name.toLowerCase().startsWith(form)))[0].name
                itemChanged = true
            }
            this.changeMoveType(form)
            changeBackForm = true
        }
        // call the api to get the new type
        axios.get('https://pokeapi.co/api/v2/pokemon-form/' + event.target.value).then(response => {
            this.setState({
                pokemon: { ...this.state.pokemon, types: response.data.types },
                changeBackForm: changeBackForm,
                heldItem: item,
                needToReimport: false,
                loading: false
            }, () => {
                if (itemChanged && this.props.isEditing && this.props.displaying === "items") this.openItems(true)
            })
        })
    }

    // change the type of a specified move
    changeMoveType(form) {     
        let importedMoves = [...this.state.importedMoves]
        let moves = [...this.state.moves]
        let moveName = ""
        switch (this.state.pokemon.name) {
            case "arceus": moveName = "Judgment"; break;
            case "genesect":
                switch (form) {
                    case "douse": form = "water"; break;
                    case "shock": form = "electric"; break;
                    case "burn": form = "fire"; break;
                    case "chill": form = "ice"; break;
                    default: break;
                }
                moveName = "Techno Blast";
                break;
            case "silvally": moveName = "Multi-Attack"; break;
            default: break;
        }
        // update the state with new move type
        importedMoves.find(move => move.name === moveName).type.name = form
        moves.find(move => move.name === moveName).type.name = form
        this.setState({
            importedMoves: importedMoves,
            moves: moves
        }, () => {
            if (this.props.isEditing && this.props.displaying === "moves") {
                this.exportMoves(this.state.currentMove)
            }
        })
    }

    // if the input field is left blank, set level to 100
    resetLevel() {
        if (this.state.level === null && this.state.currentId !== null) {
            this.changeLevel({ target: { value: 100 } })
        }
    }

    // set the shiny state of pokemon
    changeShiny(event) {
        let value = "No"
        if (event.target.value === "No") {
            value = "Yes"
        }
        this.setState({ shiny: value })
    }

    // set the gender of pokemon
    changeGender(event) {
        if (this.state.currentId !== null) {
            this.setState({ gender: event.target.value })
        }
        // if the pokemon is 1 of these 3, change its form
        if (["meowstic", "basculegion", "indeedee"].includes(this.state.pokemon.name)) {
            this.changeForm({ target: { value: event.target.value === "Male" ? "" : this.state.pokemon.name + "-female" } })
        }
    }

    // set the level of the pokemon
    changeLevel(event) {
        let level = parseInt(event.target.value)
        if (isNaN(level)) {
            this.setState({ level: null })
            return
        // only allow levels from 1 to 100    
        } else if (level > 100) {
            level = 100
        } else if (level < 1) {
            level = 1
        }
        this.setState({ level: level }, () => {
            if (this.state.currentId !== null) {
                if (this.props.isEditing && this.props.displaying === "stats") {
                    this.openStats()
                }
                // update stats according to level
                this.updateStats()
                let arr = [], arr2 = []
                // update available moves according to level
                this.state.pokemon.moves.filter(move => move.version_group_details.filter(version => version.level_learned_at <= level).length > 0).forEach(move => arr.push(move.move.name.replace(/^./, match => match.toUpperCase()).replace(/-(.)/g, (match, letter) => " " + letter.toUpperCase())))
                arr2 = this.state.importedMoves.filter(move => arr.includes(move.name))
                if (this.state.moves.length !== arr2.length) {
                    this.setState({ moves: arr2 }, () => {
                        if (this.props.isEditing && this.props.displaying === "moves") {
                            this.exportMoves(this.state.currentMove)
                        }
                    })
                }
            }
        })
    }

    // choose pokemon from the dropdown menu
    choosePokemon(option, state) {
        if (this.state.currentId === option.id) {
            return
        }
        this.setState({loading: true})
        this.props.closeDisplaying() 
        axios.get('https://pokeapi.co/api/v2/pokemon/' + option.id).then(response => {
            let pokemon = response.data;
            let defaultForm = "Default";
            // set the default forms of the following pokemon
            switch (pokemon.name) {
                case 'wormadam-plant': pokemon.name = 'wormadam'; defaultForm = 'Plant'; break;
                case 'deoxys-normal': pokemon.name = 'deoxys'; defaultForm = 'Normal'; break;
                case 'giratina-altered': pokemon.name = 'giratina'; defaultForm = 'Altered'; break;
                case 'shaymin-land': pokemon.name = 'shaymin'; defaultForm = 'Land'; break;
                case 'basculin-red-striped': pokemon.name = 'basculin'; defaultForm = 'Red Striped'; break;
                case 'keldeo-ordinary': pokemon.name = 'keldeo'; defaultForm = 'Ordinary'; break;
                case 'meloetta-aria': pokemon.name = 'meloetta'; defaultForm = 'Aria'; break;
                case 'meowstic-male': pokemon.name = 'meowstic'; defaultForm = 'Male'; break;
                case 'aegislash-shield': pokemon.name = 'aegislash'; defaultForm = 'Shield'; break;
                case 'zygarde-50': pokemon.name = 'zygarde'; defaultForm = '50%'; break;
                case 'oricorio-baile': pokemon.name = 'oricorio'; defaultForm = 'Baile'; break;
                case 'wishiwashi-solo': pokemon.name = 'wishiwashi'; defaultForm = 'Solo'; break;
                case 'minior-red-meteor': pokemon.name = 'minior'; defaultForm = 'Meteor'; break;
                case 'toxtricity-amped': pokemon.name = 'toxtricity'; defaultForm = 'Amped'; break;
                case 'basculegion-male': pokemon.name = 'basculegion'; defaultForm = 'Male'; break;
                case 'enamorus-incarnate': pokemon.name = 'enamorus'; defaultForm = 'Incarnate'; break;
                case 'thundurus-incarnate': pokemon.name = 'thundurus'; defaultForm = 'Incarnate'; break;
                case 'landorus-incarnate': pokemon.name = 'landorus'; defaultForm = 'Incarnate'; break;
                case 'tornadus-incarnate': pokemon.name = 'tornadus'; defaultForm = 'Incarnate'; break;
                case 'urshifu-single-strike': pokemon.name = 'urshifu'; defaultForm = 'Single Strike'; break;
                case 'unown': defaultForm = 'A'; break;
                case 'morpeko-full-belly': pokemon.name = 'morpeko'; defaultForm = "Full Belly"; break;
                case 'indeedee-male': pokemon.name = 'indeedee'; defaultForm = "Male"; break;
                case 'darmanitan-standard': pokemon.name = 'darmanitan'; defaultForm = "Standard"; break;
                case 'mimikyu-disguised': pokemon.name = 'mimikyu'; defaultForm = "Disguised"; break;
                case 'lycanroc-midday': pokemon.name = 'lycanroc'; defaultForm = "Midday"; break;
                case 'eiscue-ice': pokemon.name = 'eiscue'; defaultForm = "Ice"; break;
                case 'arceus': pokemon.forms = pokemon.forms.filter(form => form.name !== 'arceus-unknown'); defaultForm = 'Normal'; break;
                case 'floette': pokemon.forms = pokemon.forms.filter(form => form.name !== 'floette-eternal'); defaultForm = "Red"; break;
                case 'flabebe': defaultForm = "Red"; break;
                case 'pumpkaboo-average': pokemon.name = 'pumpkaboo'; defaultForm = 'Average'; break;
                case 'gourgeist-average': pokemon.name = 'gourgeist'; defaultForm = 'Average'; break;
                case 'mothim': pokemon.forms = pokemon.forms.slice(0, 1); break;
                case 'scatterbug': case 'spewpa': case 'pichu': pokemon.forms = pokemon.forms.slice(0, 1); break;
                case 'gastrodon': case 'shellos': defaultForm = "West"; break;
                case 'deerling': case 'sawsbuck': defaultForm = "Spring"; break;
                case 'vivillon': defaultForm = "Meadow"; break;
                case 'xerneas': defaultForm = "Active"; break;
                case 'silvally': defaultForm = "Normal"; break;
                case 'alcremie':
                    let arr = [], arr2 = ["berry", "clover", "flower", "love", "ribbon", "star", "strawberry"]
                    pokemon.forms.forEach(form => {
                        for (const element of arr2) {
                            if (form.name !== "alcremie-vanilla-cream" && element !== "strawberry") {
                                arr.push({ ...form, name: form.name + "-" + element })
                            }
                        }
                    })
                    pokemon.forms = arr;
                    defaultForm = "Vanilla Cream Strawberry";
                    break;
                default: break;
            }
            // set state with the default properties
            this.setState({
                currentId: option.id,
                pokemon: pokemon,
                currentMove: null,
                forms: this.props.forms.filter(form => form.name.startsWith(pokemon.name + "-")),
                defaultForm: defaultForm,
                heldItem: state ? state.heldItem : "",
                form: "",
                nickname: state ? state.nickname : "",
                level: state ? state.level : 100,
                shiny: state ? state.shiny : "No",
                ivs: state ? state.ivs : [31, 31, 31, 31, 31, 31],
                evs: state ? state.evs : [0, 0, 0, 0, 0, 0],
                nature: state ? state.nature : "Serious",
                natureMultipliers: state ? getNatureMultipliers(state.nature) : [1, 1, 1, 1, 1, 1],
                needToReimport: state ? true : false,
                changeBackForm: false,    
                changeBackMove: state ? state.changeBackMove : false,
                highlightedMoves: state ? state.highlightedMoves : ["", "", "", ""],
                ability: state ? state.ability : ""
            }, () => {
                if (state && state.form !== "") {
                    let object = {target: {value: state.form}}
                    this.changeForm(object)
                } else {
                    this.updateStats()
                    this.importMoves(response)
                    this.importAbilities(response)
                }       
            })
        })
        // call api to get the genders for pokemon if it has a special gender rate
        axios.get('https://pokeapi.co/api/v2/pokemon-species/' + option.id).then(response => {
            let gender = "Male";
            if (response.data.gender_rate === -1) {
                gender = "Genderless"
            } else if (response.data.gender_rate === 8) {
                gender = "Female"
            }
            this.setState({
                gender: state !== undefined ? state.gender : gender,
                gender_rate: response.data.gender_rate,
                has_gender_differences: response.data.has_gender_differences
            })
        })
    }

    // call the api for all possible abilities
    importAbilities(response) {
        let arr = []
        response.data.abilities.forEach(ability => {
            arr.push(axios.get(ability.ability.url))
        })
        Promise.all(arr).then(responses => {
            let importedAbilities = responses.map(response => response.data)
            let arr = []
            importedAbilities.forEach(ability => {
                if (arr.filter(a => a.name === ability.name.replace(/^./, match => match.toUpperCase()).replace(/-(.)/g, (match, letter) => " " + letter.toUpperCase())).length <= 0) {
                    arr.push({
                        name: ability.name.replace(/^./, match => match.toUpperCase()).replace(/-(.)/g, (match, letter) => " " + letter.toUpperCase()),
                        effect: ability.effect_entries.length > 0 ? ability.effect_entries.filter(entry => entry.language.name === "en")[0].effect : ""
                    })
                }
            })
            this.setState({
                abilities: arr,
            }, () => {
                if (this.props.isEditing && this.props.displaying === "abilities") this.exportAbilities()
            })
        })
    }

    // call the api for all possible moves
    importMoves(response, changeMinorForm) {
        let arr = []
        response.data.moves.forEach(move => arr.push(axios.get(move.move.url)))
        Promise.all(arr).then(responses => {
            let importedMoves = responses.map(response => response.data);
            importedMoves.forEach(move => {
                // modify the move names to be more accurate
                move.name = move.name.replace(/^./, match => match.toUpperCase()).replace(/-(.)/g, (match, letter) => " " + letter.toUpperCase())
                if (move.name === "Multi Attack") {
                    move.name = "Multi-Attack"
                }
                else if (move.name === "U Turn") {
                    move.name = "U-turn"
                }
                if (move.effect_entries[0]) move.effect_entries[0].short_effect = move.effect_entries[0].short_effect.replace(/\$effect_chance/, move.effect_chance)
            });
            let arr2 = [], arr3 = importedMoves
            // filter moves based on current level
            if (this.state.level < 100 && this.state.level > 0) {
                response.data.moves.filter(move => move.version_group_details.filter(version => version.level_learned_at <= this.state.level).length > 0).forEach(move => arr2.push(move.move.name.replace(/^./, match => match.toUpperCase()).replace(/-(.)/g, (match, letter) => " " + letter.toUpperCase())))
                arr3 = importedMoves.filter(move => arr2.includes(move.name))
            }
            this.setState({
                importedMoves: importedMoves,
                moves: arr3,
            }, () => {
                // change form of pokemon if method call requires it
                if (changeMinorForm !== undefined) {
                    this.changeMinorForm(changeMinorForm)
                // give it the required move if the current held item needs it
                } else if (this.state.changeBackMove && !["pikachu", "raichu"].includes(this.state.pokemon.name)) {
                    let item = changeItems.filter(item => item.name === this.state.heldItem)[0]
                    this.replaceMove(item)
                // special case for pikachu and raichu
                } else if (["pikachu", "raichu"].includes(this.state.pokemon.name)) {
                    let item = changeItems.filter(item => item.name === this.state.heldItem)[0]
                    // give it the required move if it has the right item and right form
                    if (item !== undefined && (this.state.form.includes(item.moveChangeForm) || (this.state.changeBackMove && !item.hasOwnProperty("moveChangeForm")))) {
                        this.replaceMove(item)
                    // if it doesn't have the right move and right form, revert the changed move to defalut move
                    } else if (this.state.changeBackMove && !this.state.form.includes(item.moveChangeForm)) {
                        let highlightedMoves = [...this.state.highlightedMoves]
                        let index = highlightedMoves.findIndex(move => move === this.state.newMove)
                        if (index !== -1) highlightedMoves[index] = this.state.replacedMove.name
                        this.setState({
                            highlightedMoves: highlightedMoves,
                            changeBackMove: false,
                            loading: false,
                        })
                    } else {
                        this.setState({loading: false})
                    }
                } else {
                    this.setState({loading: false})
                }
                if (this.props.isEditing && this.props.displaying === "moves") {
                    this.exportMoves(this.state.currentMove)
                }
            })
        })
    }

    // export moves to parent component
    exportMoves(num, scroll) {
        if (this.state.currentId !== null) {
            this.props.exportMoves(this.state.moves, this.state.highlightedMoves, num, scroll)
            this.setState({ currentMove: num })
        }
    }

    // export abilities to parent component
    exportAbilities() {
        if (this.state.currentId !== null) {
            this.props.exportAbilities(this.state.abilities, this.state.ability)
        }
    }
    
    // dynamically filter abilities when typing in the input field
    filterAbilities(event) {
        if (this.state.currentId !== null) {
            this.setState({ ability: event.target.value })
            this.props.filterAbilities(event.target.value)
        }
    }

    // dynamically filter moves when typing in the input field
    filterMoves(event, num) {
        if (this.state.currentId === null) return;
        let arr = [...this.state.highlightedMoves];
        arr[num] = event.target.value;
        this.props.filterMoves(event.target.value, arr)
        this.setState({ highlightedMoves: arr })
    }

    // revert the changed move to its original move, and give the pokemon a new move
    revertAndReplaceMove(item) {
        let importedMoves = [...this.state.importedMoves]
        let moves = [...this.state.moves]
        let highlightedMoves = [...this.state.highlightedMoves]
        let pokemon = { ...this.state.pokemon }
        // revert to original move that was saved in the state
        importedMoves[importedMoves.findIndex(move => move.name === this.state.newMove)] = this.state.replacedMove
        moves[moves.findIndex(move => move.name === this.state.newMove)] = this.state.replacedMove
        let index1 = highlightedMoves.findIndex(move => move === this.state.newMove)
        if (index1 !== -1) highlightedMoves[index1] = this.state.replacedMove.name
        pokemon.moves[pokemon.moves.findIndex(move => move.move.name === this.state.newMove)].move.name = this.state.replacedMove.name.toLowerCase().replace(/\s/, "-")
        // call the api to get new move information
        axios.get("https://pokeapi.co/api/v2/move/" + item.moveTarget).then(response => {
            let newMove = {...response.data, name: item.moveTarget.replace(/^./, match => match.toUpperCase()).replace(/-(.)/g, (match, letter) => " " + letter.toUpperCase())}
            if (highlightedMoves.findIndex(move => move === item.moveSource) !== -1) highlightedMoves[highlightedMoves.findIndex(move => move === item.moveSource)] = newMove.name
            let index2 = importedMoves.findIndex(move => move.name === item.moveSource)
            let replacedMove = importedMoves[index2]
            importedMoves[index2] = newMove
            moves[moves.findIndex(move => move.name === item.moveSource)] = newMove
            pokemon.moves[pokemon.moves.findIndex(move => move.move.name === item.moveSource.toLowerCase().replace(/\s/, "-"))].move.name = newMove.name
            pokemon = { ...pokemon, moves: pokemon.moves }
            this.setState({
                changeBackMove: true,
                importedMoves: importedMoves,
                moves: moves,
                pokemon: pokemon,
                replacedMove: replacedMove,
                newMove: newMove.name,
                highlightedMoves: highlightedMoves
            })
        })
    }

    // replace move with a new move according to item description
    replaceMove(item) {
        let pokemon = { ...this.state.pokemon }
        let importedMoves = [...this.state.importedMoves]
        let moves = [...this.state.moves]
        let highlightedMoves = [...this.state.highlightedMoves]
        // call api to get move information and update the chosen moves as needed
        axios.get("https://pokeapi.co/api/v2/move/" + item.moveTarget).then(response => {
            if (pokemon.moves.filter(move => move.move.name === item.moveSource.toLowerCase().replace(/\s/, "-")).length === 0) return;
            let newMove = { ...response.data, name: response.data.name.replace(/^./, match => match.toUpperCase()).replace(/-(.)/g, (match, letter) => " " + letter.toUpperCase()) }
            if (highlightedMoves.findIndex(move => move === item.moveSource) !== -1) highlightedMoves[highlightedMoves.findIndex(move => move === item.moveSource)] = newMove.name
            let index = importedMoves.findIndex(move => move.name === item.moveSource)
            let replacedMove = { ...importedMoves[index] }
            importedMoves[index] = newMove
            moves[moves.findIndex(move => move.name === item.moveSource)] = newMove
            pokemon.moves[pokemon.moves.findIndex(move => move.move.name === item.moveSource.toLowerCase().replace(/\s/, "-"))].move.name = newMove.name
            pokemon = { ...pokemon, moves: pokemon.moves }
            this.setState({
                newMove: newMove.name,
                changeBackMove: true,
                replacedMove: replacedMove,
                importedMoves: importedMoves,
                moves: moves,
                pokemon: pokemon,
                highlightedMoves: highlightedMoves,
                loading: false,
            })
        })
    }

    // revert move to the original move saved in the state, change chosen moves if needed
    revertMove() {
        let importedMoves = [...this.state.importedMoves]
        let moves = [...this.state.moves]
        let highlightedMoves = [...this.state.highlightedMoves]
        let pokemon = { ...this.state.pokemon }
        importedMoves[importedMoves.findIndex(move => move.name === this.state.newMove)] = this.state.replacedMove
        moves[moves.findIndex(move => move.name === this.state.newMove)] = this.state.replacedMove
        let index1 = highlightedMoves.findIndex(move => move === this.state.newMove)
        if (index1 !== -1) highlightedMoves[index1] = this.state.replacedMove.name
        pokemon.moves[pokemon.moves.findIndex(move => move.move.name === this.state.newMove)].move.name = this.state.replacedMove.name.toLowerCase().replace(/\s/, "-")
        this.setState({
            changeBackMove: false,
            importedMoves: importedMoves,
            moves: moves,
            pokemon: pokemon,
            highlightedMoves: highlightedMoves
        })
    }
    
    // disable the select dropdown
    disableSelect(event) {
        if (event.target.tagName === "SELECT") {
            this.setState({selectDisabled: true})
        } else {
            this.setState({selectDisabled: false})
        }
    }

    componentDidMount() {
        // disable the select dropdown on mobile devices
        if (Math.min(window.innerWidth, window.screen.width) <= 767) {
            document.addEventListener('touchstart', this.disableSelect)
        }
        // get pokemon information from the local storage
        const state = JSON.parse(localStorage.getItem(this.props.teamName + this.props.index));
        if (state && state.currentId !== null) {
            setTimeout(() => this.choosePokemon({id: state.currentId}, state), 10)                
        }
        let pokemons = Array.from(document.querySelectorAll(".pokemon"))
        pokemons.forEach((pokemon, index) => {
            // add event listener for enter and tab to autocomplete abilities, moves, and items
            if (index === this.props.index) {
                pokemon.querySelector(".others > div:first-child > input").addEventListener("keydown", this.autocompleteAbility)
                pokemon.querySelector(".others > div:last-child > input").addEventListener("keydown", this.autocompleteItem)
                let moves = Array.from(pokemon.querySelectorAll(".moves > input"))
                moves.forEach(move => move.addEventListener("keydown", this.autocompleteMove))
            }
        }) 
    }

    // method to autocomplete ability if it matches the beginning of an ability
    autocompleteAbility(event) {
        if ((event.key === "Tab" || event.key === "Enter") && this.state.currentId !== null && this.state.ability !== "" && this.state.abilities.filter(a => a.name.toLowerCase().includes(this.state.ability.toLowerCase())).length === 1) {
            let ability = this.state.abilities.filter(a => a.name.toLowerCase().includes(this.state.ability.toLowerCase()))
            if (ability.length === 1 && ability[0] !== this.state.ability) this.setState({ability: ability[0].name})
        }
    }

    // method to autocomplete item if it matches the beginning of an item
    autocompleteItem(event) {
        if ((event.key === "Tab" || event.key === "Enter") && this.state.currentId !== null && this.state.heldItem !== "") {
            let item = heldItems.concat(changeItems).filter(i => i.name.toLowerCase().includes(this.state.heldItem.toLowerCase()))
            if (item.length === 1 && item[0] !== this.state.heldItem) this.setState({heldItem: item[0].name})
        }
    }

    // method to autocomplete move if it matches the beginning of a move
    autocompleteMove(event) {
        if ((event.key === "Tab" || event.key === "Enter") && this.state.currentId !== null && this.state.highlightedMoves[this.state.currentMove] !== "") {
            event.preventDefault();
            let highlightedMoves = [...this.state.highlightedMoves]
            let move = this.state.moves.filter(m => m.name.toLowerCase().includes(highlightedMoves[this.state.currentMove].toLowerCase()))
            if (move.length === 1 && move[0] !== highlightedMoves[this.state.currentMove]) {
                highlightedMoves[this.state.currentMove] = move[0].name
                this.setState({highlightedMoves: highlightedMoves})
            }
            this.moveRefs[this.state.currentMove + 1 === 4 ? 0 : this.state.currentMove + 1].current.focus()
        }
    }

    // remove event listeners before unmounting
    componentWillUnmount() {
        document.removeEventListener('touchstart', this.disableSelect)
        let pokemons = Array.from(document.querySelectorAll(".pokemon"))
        pokemons.forEach((pokemon, index) => {
            if (index === this.props.index) {
                pokemon.querySelector(".others > div:first-child > input").removeEventListener("keydown", this.autocompleteAbility)
                pokemon.querySelector(".others > div:last-child > input").removeEventListener("keydown", this.autocompleteItem)
                let moves = Array.from(pokemon.querySelectorAll(".moves > input"))
                moves.forEach(move => move.removeEventListener("keydown", this.autocompleteMove))
            }
        })
    }

    componentDidUpdate(prevProps, prevState) {
        // update local storage everytime the user modifies the pokemon
        if (this.state.currentId !== null) {
            let update = false
            for (let i = 0; i <= 3; i++) {
                if (this.state.highlightedMoves[i] !== prevState.highlightedMoves[i]) {
                    update = true;
                    break;
                }
            }
            for (let i = 0; i <= 5; i++) {
                if (update) break;
                if (this.state.ivs[i] !== prevState.ivs[i] || this.state.evs[i] !== prevState.evs[i]) update = true;
            }
            for (let i = 0; i < propertiesToSave.length; i++) {
                if (update) break;
                if (this.state[propertiesToSave[i]] !== prevState[propertiesToSave[i]]) update = true;
            }
            if (update) {
                localStorage.setItem(this.props.teamName + this.props.index, JSON.stringify({
                    currentId: this.state.currentId,
                    nickname: this.state.nickname,
                    level: this.state.level,
                    shiny: this.state.shiny,
                    gender: this.state.gender,
                    heldItem: this.state.heldItem,
                    ability: this.state.ability,
                    form: this.state.form,
                    highlightedMoves: this.state.highlightedMoves,
                    changeBackMove: this.state.changeBackMove,
                    ivs: this.state.ivs,
                    evs: this.state.evs,
                    nature: this.state.nature,
                }))
            }
        }
        
        // update the moveset and move on to next move
        if (this.props.selectedMove !== prevProps.selectedMove && this.props.selectedMove !== "") {
            let arr = [...this.state.highlightedMoves]
            if (this.props.selectedMove.startsWith("[delete]")) {
                while (arr.indexOf(this.props.selectedMove.substring(8)) !== -1) {
                    arr[arr.indexOf(this.props.selectedMove.substring(8))] = "";
                }
                this.setState({ highlightedMoves: arr }, () => {
                    this.moveRefs[prevState.currentMove].current.focus();
                })
            } else {
                arr[this.state.currentMove] = this.props.selectedMove;
                this.setState({ highlightedMoves: arr }, () => this.moveRefs[prevState.currentMove + 1 === 4 ? 0 : prevState.currentMove + 1].current.focus())
            }
            this.props.resetProps()
        }
        // update the ability
        if (this.props.selectedAbility !== prevProps.selectedAbility && this.props.selectedAbility !== "") {
            if (this.props.selectedAbility.startsWith("[delete]")) {
                this.setState({ ability: "" })
            } else {
                this.setState({ ability: this.props.selectedAbility })
            }
            this.props.resetProps()
        }
        // update the held item
        if (this.props.selectedItem !== prevProps.selectedItem && this.props.selectedItem !== "") {
            let item = this.props.selectedItem
            if (!item.name.startsWith("[delete]") && item.hasOwnProperty("changeEffect") && item.pokemon.includes(this.state.pokemon.name) && this.state.form.includes(item.moveChangeForm !== undefined ? item.moveChangeForm : "")) {
                // modify form if item requires it
                if (item.changeEffect.includes("form")) {
                    this.changeForm({ target: { value: item.formTarget }, item: item })
                }
                // modify move if item requires it
                if (item.changeEffect.includes("move")) {
                    this.setState({ heldItem: item.name }, () => {
                        if (this.state.pokemon.name === "pikachu" && this.state.changeBackMove && this.state.newMove.toLowerCase().replace(/\s/, "") !== item.moveTarget.toLowerCase().replace(/-/, "")) {
                            this.revertAndReplaceMove(item)
                        } else if (this.state.form.includes(item.moveChangeForm) || !item.hasOwnProperty("moveChangeForm")) this.replaceMove(item)
                    })
                }
            // if pokemon has a modified form, revert it
            } else if (this.state.changeBackForm) {
                this.changeForm({ target: { value: "" }, item: item.name.startsWith("[delete]") ? { ...item, name: "" } : item })
            // if pokemon has a modified move, revert it
            } else if (this.state.changeBackMove) {
                this.setState({ heldItem: item.name.startsWith("[delete]") ? "" : item.name }, () => this.revertMove())
            } else {
                this.setState({ heldItem: item.name.startsWith("[delete]") ? "" : item.name })
            }
            this.props.resetProps()
        }
        // modify stats
        if (this.props.selectedStat !== prevProps.selectedStat && this.props.selectedStat !== "") {
            let changedStat = this.props.selectedStat
            if (this.props.selectedStat.startsWith("iv")) {
                let ivs = [...this.state.ivs]
                ivs[parseInt(changedStat[2])] = changedStat.substring(3) === "null" ? null : parseInt(changedStat.substring(3))
                this.setState({ ivs: ivs }, () => {
                    this.updateStats()
                })
            } else if (this.props.selectedStat.startsWith("ev")) {
                let evs = [...this.state.evs]
                evs[parseInt(changedStat[2])] = changedStat.substring(3) === "null" ? null : parseInt(changedStat.substring(3))
                this.setState({ evs: evs }, () => {
                    this.updateStats()
                })
            }
            this.props.resetProps()
        }
        // modify nature and update stats accordingly
        if (this.props.selectedNature !== prevProps.selectedNature && this.props.selectedNature !== "") {
            this.setState({
                nature: this.props.selectedNature,
                natureMultipliers: getNatureMultipliers(this.props.selectedNature)
            }, () => {
                this.updateStats()
            })
            this.props.resetProps()
        }
        // modify form of pokemon, change form name to a readeable format when applicable
        if (this.state.pokemon.name !== prevState.pokemon.name || this.state.form !== prevState.form || this.state.shiny !== prevState.shiny || this.state.gender !== prevState.gender) {
            let extension = this.state.pokemon.name + (this.state.gender === "Female" && this.state.has_gender_differences ? "-f" : "") + ".png"
            if (this.state.pokemon.name === "xerneas" && this.state.form === "") extension = "xerneas-active.png"
            if (this.state.form !== "") {
                extension = this.state.form.replace(/gmax/, "gigantamax")
                if (this.state.pokemon.name !== "pikachu") {
                    extension = extension.replace(/alola/, "alolan").replace(/galar/, "galarian").replace(/hisui/, "hisuian").replace(/paldea/, "paldean")
                }
                switch (this.state.pokemon.name) {
                    case "minior": extension += "-core"; break;
                    case "necrozma": extension += this.state.form === "necrozma-dusk" ? "-mane" : (this.state.form === "necrozma-dawn" ? "-wings" : ""); break;
                    case "toxtricity": extension = this.state.form.includes("gmax") ? "toxtricity-gigantamax" : extension; break;
                    case "calyrex": extension += "-rider"; break;
                    case "tauros": extension = extension.replace(/-combat-breed/, "").replace(/paldean-(blaze|aqua)-breed/, "$1"); break;
                    case "maushold": extension = extension.replace(/family-of-three/, "family3"); break;
                    case "squawkabilly": extension = extension.replace(/-plumage/, ""); break;
                    case "unown": extension = extension.replace(/exclamation/, "em").replace(/question/, "qm"); break;
                    case "xerneas": extension = "xerneas"; break;
                    case "sinistea": extension = "sinistea"; break;
                    case "polteageist": extension = "polteageist"; break;
                    default: break;
                }
                extension += ".png"
            }
            // update sprite of pokemon
            let sprite = "https://img.pokemondb.net/sprites/home/" + (this.state.shiny === "Yes" ? "shiny/" : "normal/") + extension
            this.setState({ sprite: sprite})
            this.props.updateSprite(sprite)
        }
    }

    // open stats panel
    openStats() {
        if (this.state.currentId !== null) {
            let stats = this.state.pokemon.stats
            this.props.openStats([stats[0].base_stat, stats[1].base_stat, stats[2].base_stat, stats[3].base_stat, stats[4].base_stat, stats[5].base_stat], this.state.ivs, this.state.evs, this.state.level, this.state.nature, this.state.maxStats)
        }
    }

    // update stats of pokemon and redraw the graph
    updateStats() {
        const maxStatCalculation = (num) => { return Math.floor((this.state.pokemon.stats[num].base_stat * 2 + 99) * 1.1) }
        const maxStats = [Math.floor(this.state.pokemon.stats[0].base_stat * 2 + 204), maxStatCalculation(1), maxStatCalculation(2), maxStatCalculation(3), maxStatCalculation(4), maxStatCalculation(5)]
        const otherStatCalculation = (num) => { return Math.floor(((this.state.pokemon.stats[num].base_stat * 2 + this.state.ivs[num] + this.state.evs[num] / 4) * this.state.level / 100 + 5) * this.state.natureMultipliers[num]) }
        const stats = [Math.floor((this.state.pokemon.stats[0].base_stat * 2 + this.state.ivs[0] + this.state.evs[0] / 4) * this.state.level / 100 + this.state.level + 10), otherStatCalculation(1), otherStatCalculation(2), otherStatCalculation(3), otherStatCalculation(4), otherStatCalculation(5)]
        const coords = [
            `43.3,${47 - 47 * (stats[0] / maxStats[0])}`,
            `${45.898 + 23.5 * Math.sqrt(3) * (stats[1] / maxStats[1])},${48.5 - 23.5 * (stats[1] / maxStats[1])}`,
            `${45.898 + 23.5 * Math.sqrt(3) * (stats[2] / maxStats[2])},${51. + 23.5 * (stats[2] / maxStats[2])}`,
            `43.3,${53 + 47 * (stats[5] / maxStats[5])}`,
            `${40.702 - 23.5 * Math.sqrt(3) * (stats[4] / maxStats[4])},${51. + 23.5 * (stats[4] / maxStats[4])}`,
            `${40.702 - 23.5 * Math.sqrt(3) * (stats[3] / maxStats[3])},${48.5 - 23.5 * (stats[3] / maxStats[3])}`,
        ]
        this.setState({
            coords: coords.join(" "),
            maxStats: maxStats
        })
    }

    render() {
        // classify move as illegal or highlighted
        const moveClasses = (index) => {
            return this.props.isEditing && this.props.displaying === "moves" && this.state.currentMove === index ? 'selected' : (!this.state.loading && this.state.highlightedMoves[index] !== '' && (this.state.moves.filter(move => move.name === this.state.highlightedMoves[index]).length === 0 || this.state.highlightedMoves.filter(move => move === this.state.highlightedMoves[index]).length >= 2) ? 'illegal' : '')
        }
        // props for move input field
        const moveProps = (index) => {
            return {
                type: "text",
                ref: this.moveRefs[index],
                onFocus: () => this.exportMoves(index, true),
                value: this.state.highlightedMoves[index],
                onChange: (event) => this.filterMoves(event, index),
                className: moveClasses(index)
            }
        }
        return (
            <div className={`pokemon ${this.props.isEditing ? "current-pokemon" : ""} ${this.props.barDisplay ? "display-pokemon" : ""}`}>
                {this.state.loading && <div className="loading-circle-container"><div className="loading-circle"></div></div>}
                <Select styles={selectStyles} components={{ DropdownIndicator: CustomDropdownIndicator }} className="select" options={this.props.pokemons} value={this.state.currentId !== null ? this.props.pokemons[this.state.currentId - 1] : ""} placeholder="Select a pokemon" onChange={(option) => this.choosePokemon(option, undefined)} isDisabled={this.state.selectDisabled} isSearchable></Select>
                <div className="image">
                    {this.state.pokemon.sprites && (<img src={this.state.sprite} alt=""></img>)}
                </div>
                <div className="types">
                    {this.state.pokemon.types && this.state.pokemon.types.map((type, index) => <img key={index} src={require('../asset/' + type.type.name + '.png')} alt="type"></img>)}
                </div>
                <div className="attributes">
                    <div style={{ width: 'calc(26% - 8.8px)' }}>
                        <label>Nickname</label>
                        <input value={this.state.nickname} onChange={this.changeNickname} type="text" id="nickname" placeholder={this.state.currentId !== null ? this.props.pokemons[this.state.currentId - 1].label : ""}></input>
                    </div>
                    <div>
                        <label>Level</label>
                        <input value={this.state.level} onBlur={this.resetLevel} onChange={this.changeLevel} onKeyDown={handleMinus} type="number" min="1" max="100" id="level"></input>
                    </div>
                    <div style={{ width: 'calc(20% - 8.8px)' }}>
                        <label>Gender</label>
                        {(this.state.gender_rate > 0 && this.state.gender_rate < 8) || this.state.gender === null ? (
                            <select id="gender" value={this.state.gender} onChange={this.changeGender}>
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                            </select>
                        ) : <input value={this.state.gender} readOnly></input>}
                    </div>
                    <div className="shiny">
                        <label>Shiny</label>
                        <input value={this.state.shiny} id="shiny" onClick={this.changeShiny} readOnly></input>
                    </div>
                    <div className="forms" style={{ width: 'calc(26% - 8.8px)' }}>
                        <label>Form</label>
                        {(this.state.pokemon.forms?.length === 1 && this.state.forms.length === 0) || this.state.currentId === null || ["meowstic", "basculegion", "indeedee"].includes(this.state.pokemon.name) ? <input value="Default" readOnly></input> : (
                            <select id="forms" value={this.state.form} onChange={this.changeForm}>
                                <option value="">{this.state.defaultForm}</option>
                                {this.state.forms.map((form, index) => (
                                    <option key={index} value={form.name}>{form.name.replace(/zygarde-10/, "10%").replace(new RegExp(`^${this.state.pokemon.name}-`), "").replace(/^./, match => match.toUpperCase()).replace(/-(.)/g, (match, letter) => " " + letter.toUpperCase())}</option>
                                ))}
                                {this.state.pokemon.forms?.slice(1).map((form, index) => (
                                    <option key={index} value={form.name}>{form.name.replace(new RegExp(`^${this.state.pokemon.name}-`), "").replace(/^./, match => match.toUpperCase()).replace(/-(.)/g, (match, letter) => " " + letter.toUpperCase())}</option>
                                ))}
                            </select>
                        )}
                    </div>
                </div>
                <div className="others">
                    <div>
                        <label>Ability</label>
                        <input type="text" id="ability" onFocus={this.exportAbilities} value={this.state.ability} onChange={this.filterAbilities} className={this.props.isEditing && this.props.displaying === "abilities" ? 'selected' : (!this.state.loading && this.state.ability !== "" && this.state.abilities.filter(ability => ability.name === this.state.ability).length === 0 ? 'illegal' : '')}></input>
                    </div>
                    <div>
                        <label>Item</label>
                        <input type="text" id="item" onFocus={() => this.openItems(true)} value={this.state.heldItem} onChange={this.filterHeldItem} className={this.props.isEditing && this.props.displaying === "items" ? 'selected' : (this.state.heldItem !== ""  && heldItems.concat(changeItems).filter(item => item.name === this.state.heldItem).length === 0 ? 'illegal' : '')}></input>
                    </div>
                </div>
                <div className="moves">
                    <p>Moves</p>
                    <input {...moveProps(0)}></input>
                    <input {...moveProps(1)}></input>
                    <input {...moveProps(2)}></input>
                    <input {...moveProps(3)}></input>
                </div>
                <div className="stats" onClick={this.openStats}>
                    <div style={{ top: 0 }}><p>HP</p></div>
                    <div style={{ bottom: 96, right: 0 }}><p>Atk</p></div>
                    <div style={{ top: 96, right: 0 }}><p>Def</p></div>
                    <div style={{ bottom: 96, left: 0 }}><p>SpA</p></div>
                    <div style={{ top: 96, left: 0 }}><p>SpD</p></div>
                    <div style={{ bottom: 0 }}><p>Spe</p></div>
                    <svg width="90" height="102" style={{ cursor: "pointer" }}>
                        <polygon points="43.3,0 86.6,25 86.6,75 43.3,100 0,75 0,25" fill="transparent" stroke="rgb(111, 111, 111)" strokeWidth="2" transform="translate(1,1)" />
                        <polygon points="43.3,0 86.6,25 86.6,75 43.3,100 0,75 0,25" fill="rgb(255, 255, 255)" transform="translate(1,1)" />
                        <polygon points={this.state.coords} fill="rgb(173, 255, 47)" transform="translate(1,1)" />
                        <line x1="44.3" y1="51" x2="44.3" y2="1" stroke="rgb(154, 154, 154, 0.5)" />
                        <line x1="44.3" y1="51" x2="87.6" y2="26" stroke="rgb(154, 154, 154, 0.5)" />
                        <line x1="44.3" y1="51" x2="87.6" y2="76" stroke="rgb(154, 154, 154, 0.5)" />
                        <line x1="44.3" y1="51" x2="44.3" y2="101" stroke="rgb(154, 154, 154, 0.5)" />
                        <line x1="44.3" y1="51" x2="1" y2="76" stroke="rgb(154, 154, 154, 0.5)" />
                        <line x1="44.3" y1="51" x2="1" y2="26" stroke="rgb(154, 154, 154, 0.5)" />
                    </svg>
                </div>
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
    { name: "Aloraichium Z", effect: "Allows Alola raichu to upgrade thunderbolt into stoked sparksurfer.", sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/aloraichium-z--held.png", pokemon: "raichu", changeEffect: "move", moveSource: "Thunderbolt", moveTarget: "stoked-sparksurfer", moveChangeForm: "raichu-alola" },
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

export default Pokemon;