import React, { Component } from 'react'
import Symbol from './Symbol'

class List extends Component {
  render() {
    const { title, symbols, selectedSymbols } = this.props

    return (
      <div className="">
        <section className="my-8">
          <div className="flex justify-between border-b border-gray-400">
            <div className="text-xl py-2">{title}</div>
          </div>

          {Object.keys(symbols).length > 0 &&
          Object.keys(selectedSymbols).length > 0 ? (
            <div className="py-4 grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {Object.keys(selectedSymbols)
                .sort((a, b) => {
                  return selectedSymbols[b] - selectedSymbols[a]
                })
                .map((key) => (
                  <Symbol key={key} index={key} details={symbols[key]} />
                ))}
            </div>
          ) : (
            <div className="flex justify-center align-middle py-6">
              No Symbols in this List
            </div>
          )}
        </section>
      </div>
    )
  }
}

export default List
