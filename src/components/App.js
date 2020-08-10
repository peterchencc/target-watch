import React, { Component } from 'react'
import axios from 'axios'
import cheerio from 'cheerio'
import moment from 'moment'
import database from '../base'
import Symbol from './Symbol'

class App extends Component {
  state = {
    symbols: {},
    currentSymbol: '',
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
          '&token=bsg07g7rh5r8gpgltss0'
      )
      .then((response) => {
        let current = response.data.c

        if (current) {
          const updatedSymbol = {
            ...this.state.symbols[symbol],
            currentPrice: current ? current : null,
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

  componentDidMount() {
    console.log('ENV_NODE', process.env.NODE_ENV)
    console.log('componentDidMount', this)
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

  render() {
    return (
      <div>
        <h1>Target Watch</h1>

        <form onSubmit={this.handleSubmit}>
          <input
            id="new-symbol"
            type="text"
            placeholder="Symbol"
            onChange={this.handleChange}
            value={this.state.symbol}
            style={{ textTransform: 'uppercase' }}
          />
          <button>Add Symbol</button>
        </form>
        <ul className="symbols">
          {Object.keys(this.state.symbols)
            .reverse()
            .map((key) => (
              <Symbol key={key} index={key} details={this.state.symbols[key]} />
            ))}
        </ul>
      </div>
    )
  }
}

export default App
