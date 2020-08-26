import React, { useState, useEffect } from 'react'
import Symbol from './Symbol'

const RecentSearch = (props) => {
  const { symbols } = props

  const [recentSearch, setRecentSearch] = useState(() => {
    const localData = localStorage.getItem('recent-search')
    return localData ? JSON.parse(localData) : []
  })

  useEffect(() => {
    localStorage.setItem('recent-search', JSON.stringify(recentSearch))
  }, [recentSearch])

  const [symbol, setSymbol] = useState('')

  const handleInputChange = (event) => {
    setSymbol(event.target.value)
  }

  const handleFormSubmit = (event) => {
    event.preventDefault()
    if (!symbol) return

    const currentSymbol = {
      timestamp: Date.now(),
      name: symbol.toUpperCase(),
    }
    props.getSymbol(currentSymbol.name)
    // add this symbol into RecentSearch
    setRecentSearch([...recentSearch, currentSymbol])
    setSymbol('')
  }

  return (
    <div>
      <form onSubmit={handleFormSubmit}>
        <input
          id="new-symbol"
          type="text"
          placeholder="Symbol"
          onChange={handleInputChange}
          value={symbol}
          style={{ textTransform: 'uppercase' }}
          className="shadow appearance-none border rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none"
        />
        <button className="btn btn-blue">Search</button>
      </form>

      <div className="">
        <section className="my-8">
          <div className="flex justify-between border-b border-gray-400">
            <div className="text-xl py-2">All Recent Search</div>
          </div>

          {recentSearch && recentSearch.length > 0 ? (
            <div className="py-4 grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {recentSearch
                .sort((a, b) => b.timestamp - a.timestamp)
                .map((symbol) => (
                  <Symbol
                    key={symbol.timestamp}
                    name={symbol.name}
                    data={symbols[symbol.name]}
                    getSymbol={props.getSymbol}
                  />
                ))}
            </div>
          ) : (
            <div className="flex justify-center align-middle py-6">
              No Symbols
            </div>
          )}
        </section>
      </div>
    </div>
  )
}

export default RecentSearch
