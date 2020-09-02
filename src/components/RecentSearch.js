import React, { useState, useEffect } from 'react'
import Autocomplete from './Autocomplete'
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

  const clearRecentSearch = () => {
    setRecentSearch([])
  }

  return (
    <div>
      <div className="flex justify-center  p-12 m-6">
        <form onSubmit={handleFormSubmit}>
          <Autocomplete setSymbol={setSymbol} />
          <button className="btn btn-blue rounded-l-none">Search</button>
        </form>
      </div>

      <div className="">
        <section className="my-8">
          <div className="flex justify-between border-b border-gray-400">
            <div className="text-xl py-2">All Recent Search</div>
            <button onClick={clearRecentSearch}>clear</button>
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
