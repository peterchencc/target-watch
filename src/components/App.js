import React, { Component } from 'react'
import axios from 'axios'
import cheerio from 'cheerio'
import moment from 'moment'
import { auth, database } from '../base'
import List from './List'
import SignUp from './SignUp'
import SignIn from './SignIn'
import NotFound from './NotFound'
import Modal from './Modal'
import { BrowserRouter as Router, Route, Switch, Link } from 'react-router-dom'

class App extends Component {
  state = {
    showModal: false,
    uid: null,
    displayName: null,
    symbols: {},
    currentSymbol: '',
    recentSearch: {},
  }

  handleSubmit = (e) => {
    console.log('handleSubmit start')
    e.preventDefault()

    if (!this.state.currentSymbol) {
      return console.log('no input')
    }

    const newSymbol = {
      timestamp: Date.now(),
      name: this.state.currentSymbol,
      currentPrice: '',
      targetPrices: [],
    }

    const recentSearch = { ...this.state.recentSearch }
    recentSearch[newSymbol.name] = newSymbol.timestamp
    this.setState({ recentSearch })

    this.addSymbol(newSymbol)

    // to fetch finnhub current price api
    this.fetchCurrentPrice(this.state.currentSymbol)

    // to read symbol's data at firebase for target price, and return symbol's data

    // if target price hasn't been updated
    this.fetchTargetPrices(this.state.currentSymbol) // (and return symbol's data?)
    console.log('handleSubmit end')
    e.currentTarget.reset()
  }

  fetchCurrentPrice = async (symbol) => {
    await axios
      .get(
        'https://finnhub.io/api/v1/quote?symbol=' +
          symbol.toUpperCase() +
          '&token=' +
          process.env.REACT_APP_FINNHUB_TOKEN
      )
      .then((response) => {
        let data = response.data
        let current = data.c
        let previousClose = data.pc

        if (current) {
          const updatedSymbol = {
            ...this.state.symbols[symbol],
            currentPrice: current ? current : null,
            previousClose: previousClose ? previousClose : null,
          }
          this.updateSymbol(symbol, updatedSymbol)
        }
      })
  }

  fetchTargetPrices = async (symbol) => {
    console.log('fetchTargetPrices start')

    const targetPrices = await axios
      .get('https://www.benzinga.com/stock/' + symbol + '/ratings')
      .then((response) => {
        let targetPrices = []

        if (response.status === 200) {
          let $ = cheerio.load(response.data)
          const columnName = ['date', 'firm', 'action', 'current', 'pt']

          $('.stock-ratings-calendar tbody tr').each(function (i, tr) {
            let rating = {}
            $(tr)
              .find('td')
              .each(function (i, e) {
                let value = $(e).text() ? $(e).text() : null

                if (value && columnName[i] === 'pt') {
                  rating['pt'] = parseFloat(value.replace(/,/g, ''))
                } else if (value && columnName[i] === 'date') {
                  rating['date'] = value
                } else {
                  rating[columnName[i]] = value
                }
              })
            targetPrices.push(rating)
          })
        }

        return targetPrices
      })
      .catch((error) => {
        console.log(error)
      })

    if (targetPrices.length) {
      const recentTargetsDetail = this.findRecentTargets(targetPrices)

      const updatedSymbol = {
        ...this.state.symbols[symbol],
        targetPrices,
        latestTargetDate: targetPrices[0].date,
        ...recentTargetsDetail,
      }

      this.updateSymbol(symbol, updatedSymbol)
    }
  }

  findRecentTargets = (targetPrices) => {
    const RECENT_TARGET_THRESHOLD = 3
    const RECENT_TARGET_DURATION = [7, 30, 90, 180]
    let recentTargets = []
    let lowestTarget = Number.MAX_VALUE
    let highestTarget = Number.MIN_VALUE
    let currDuration = 0
    let currTargetIndex = 0

    while (currDuration < 4 && currTargetIndex < targetPrices.length) {
      if (
        moment(targetPrices[currTargetIndex].date, 'MM-DD-YYYY') >
        moment().subtract(RECENT_TARGET_DURATION[currDuration], 'days')
      ) {
        recentTargets.push(targetPrices[currTargetIndex])

        if (targetPrices[currTargetIndex].pt) {
          highestTarget = Math.max(
            targetPrices[currTargetIndex].pt,
            highestTarget
          )
          lowestTarget = Math.min(
            targetPrices[currTargetIndex].pt,
            lowestTarget
          )
        }
        currTargetIndex++
      } else {
        if (recentTargets.length >= RECENT_TARGET_THRESHOLD) {
          break
        } else {
          currDuration++
        }
      }
    }

    return {
      recentTargets,
      lowestTarget,
      highestTarget,
      targetsDuration: RECENT_TARGET_DURATION[currDuration],
    }
  }

  handleChange = (e) => {
    this.setState({ currentSymbol: e.target.value.toUpperCase() })
  }

  addSymbol = (newSymbol) => {
    database.ref('/symbols/' + newSymbol.name).set({
      ...newSymbol,
    })
  }

  updateSymbol = (key, updatedSymbol) => {
    let updates = {}
    updates[key] = updatedSymbol
    database.ref('symbols').update(updates)
  }

  showModal = (e) => {
    this.setState({
      showModal: !this.state.showModal,
    })
  }

  componentDidMount() {
    console.log('App componentDidMount')
    const localStorageRef = localStorage.getItem('recent-search')
    if (localStorageRef) {
      this.setState({ recentSearch: JSON.parse(localStorageRef) })
    }

    auth.onAuthStateChanged((user) => {
      if (user) {
        console.log('User is signed in.')
        console.log('user', user)
        // this.authHandler({ user })

        // 1. set the state of the user to reflect the current user
        this.setState({
          uid: user.uid,
          displayName: user.displayName,
        })
      } else {
        console.log('No user is signed in.')
      }
    })

    database
      .ref('symbols')
      .orderByChild('timestamp')
      .on('value', (snapshot) => {
        let symbols = {}
        snapshot.forEach((snap) => {
          symbols[snap.key] = snap.val()
        })
        console.log('symbols', symbols)
        this.setState({ symbols })
      })
  }

  componentDidUpdate() {
    console.log('App componentDidUpdate')
    localStorage.setItem(
      'recent-search',
      JSON.stringify(this.state.recentSearch)
    )
  }

  logout = async () => {
    console.log('Logging out!')
    await auth.signOut()
    this.setState({ uid: null })
  }

  render() {
    return (
      <Router>
        <div className="container mx-auto px-2">
          <header className="flex justify-between">
            <Link to="/">
              <h1 className="leading-relaxed">
                <span role="img" aria-label="img">
                  📈
                </span>{' '}
                Target Watch
              </h1>
            </Link>
            <nav className="">
              {this.state.uid ? (
                <div className="flex">
                  <div className="p-2 mx-2">Hi, {this.state.displayName}</div>
                  <button
                    className="p-2"
                    onClick={() => {
                      this.logout()
                    }}
                  >
                    Sign out
                  </button>
                </div>
              ) : (
                <div className="flex">
                  <Link className="p-2 mx-2" to="/signup">
                    sign up
                  </Link>
                  <Link className="p-2 mx-2" to="/signin">
                    sign in
                  </Link>
                </div>
              )}
            </nav>
          </header>

          <Switch>
            <Route exact path="/">
              <form onSubmit={this.handleSubmit}>
                <input
                  id="new-symbol"
                  type="text"
                  placeholder="Symbol"
                  onChange={this.handleChange}
                  value={this.state.symbol}
                  style={{ textTransform: 'uppercase' }}
                  className="shadow appearance-none border rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none"
                />
                <button className="btn btn-blue">Add Symbol</button>
              </form>

              <List
                selectedSymbols={this.state.recentSearch}
                symbols={this.state.symbols}
                title="All Recent Search"
              ></List>

              <section>
                <div className="flex justify-between">
                  <div className="text-xl">Watchlist</div>
                  <button
                    onClick={(e) => {
                      this.showModal(e)
                    }}
                  >
                    + Create Watchlist
                  </button>
                </div>

                <List
                  selectedSymbols={{}}
                  symbols={this.state.symbols}
                  title="Tech"
                ></List>
              </section>
              <Modal
                onClose={this.showModal}
                show={this.state.showModal}
                title="Create a new watch list"
              >
                hello
              </Modal>
            </Route>
            <Route exact path="/signup">
              <SignUp />
            </Route>
            <Route exact path="/signin">
              <SignIn />
            </Route>
            <Route component={NotFound} />
          </Switch>
        </div>
      </Router>
    )
  }
}

export default App
