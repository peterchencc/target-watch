import React, { Component } from 'react'
import axios from 'axios'
import cheerio from 'cheerio'
import moment from 'moment'
import { auth, database } from '../base'
import SignUp from './SignUp'
import SignIn from './SignIn'
import NotFound from './NotFound'
import RecentSearch from './RecentSearch'
import WatchListWrapper from './WatchListWrapper'
import { BrowserRouter as Router, Route, Switch, Link } from 'react-router-dom'

class App extends Component {
  state = {
    showModal: false,
    uid: null,
    displayName: null,
    symbols: {},
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
          this.dbUpdateSymbol(symbol, updatedSymbol)
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

      this.dbUpdateSymbol(symbol, updatedSymbol)
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

  getSymbol = (symbolName) => {
    if (symbolName in this.state.symbols) {
      console.log(
        'getSymbol & fetch data & update',
        this.state.symbols[symbolName]
      )
      this.fetchAndUpdateSymbol(symbolName)
    } else {
      const newSymbol = {
        timestamp: Date.now(),
        name: symbolName,
        currentPrice: '',
        targetPrices: [],
      }
      this.dbCreateSymbol(newSymbol)
      this.fetchAndUpdateSymbol(symbolName)
    }
  }

  fetchAndUpdateSymbol = (symbolName) => {
    this.fetchCurrentPrice(symbolName)
    this.fetchTargetPrices(symbolName)
  }

  dbCreateSymbol = (newSymbol) => {
    database.ref('/symbols/' + newSymbol.name).set({
      ...newSymbol,
    })
  }

  dbUpdateSymbol = (key, updatedSymbol) => {
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
    // console.log('recentSearch', this.state.recentSearch)

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
        console.log('database symbols', symbols)
        this.setState({ symbols })
      })
  }

  componentDidUpdate() {
    console.log('App componentDidUpdate')
  }

  logout = async () => {
    console.log('Logging out!')
    await auth.signOut()
    this.setState({ uid: null })
  }

  render() {
    return (
      <Router>
        <header className="container mx-auto px-2 flex justify-between">
          <Link to="/" className="p-2">
            <img src="/navbar_logo_32.svg" alt="Logo" />
          </Link>

          {this.state.uid ? (
            <div className="flex align-middle">
              <div className="p-2 mx-2 flex justify-center items-center">
                Hi, {this.state.displayName}
              </div>
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
        </header>
        <div className="container mx-auto px-2">
          <Switch>
            <Route exact path="/">
              <RecentSearch
                symbols={this.state.symbols}
                getSymbol={this.getSymbol}
              />
              <WatchListWrapper
                getSymbol={this.getSymbol}
                showModal={this.state.showModal}
                handleShowModal={this.showModal}
                currentUser={this.state.uid}
                symbols={this.state.symbols}
              ></WatchListWrapper>
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
