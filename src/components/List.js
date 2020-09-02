import React, { useState } from 'react'
import { firestore } from '../base'
import Symbol from './Symbol'
import AddSymbolForm from './AddSymbolForm'

const List = (props) => {
  const { list, symbols } = props
  const { id, title } = list
  const [selectedSymbols, setSelectedSymbols] = useState(list.symbols)

  const addSymbol = (symbol) => {
    props.getSymbol(symbol.name.toUpperCase())

    const newSymbol = { name: symbol.name.toUpperCase(), timestamp: Date.now() }

    if (selectedSymbols.some((symbol) => symbol.name === newSymbol.name)) {
      console.log(newSymbol.name + ' is already in ' + title)
      return
    } else {
      const listRef = firestore.collection('watchlists').doc(id)
      listRef
        .update({
          symbols: [...selectedSymbols, newSymbol],
        })
        .then(function () {
          setSelectedSymbols([...selectedSymbols, newSymbol])
          console.log('Document successfully updated!')
        })
        .catch(function (error) {
          // The document probably doesn't exist.
          console.error('Error updating document: ', error)
        })

      console.log('listRef', listRef)
      console.log('addSymbol', symbol)
    }
  }

  return (
    <div className="">
      <section className="my-8">
        <div className="flex justify-between border-b border-gray-400">
          <div className="text-xl py-2">{title}</div>
          <AddSymbolForm addSymbol={addSymbol}></AddSymbolForm>
          <button
            onClick={() => {
              if (window.confirm('Are you sure to delete this list?')) {
                props.deleteList(id)
              }
            }}
          >
            Delete
          </button>
        </div>

        {selectedSymbols.length > 0 ? (
          <div className="py-4 grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {selectedSymbols
              .sort((a, b) => b.timestamp - a.timestamp)
              .map((symbol) => (
                <Symbol
                  key={symbol.name}
                  name={symbol.name}
                  data={symbols[symbol.name]}
                  getSymbol={props.getSymbol}
                />
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

export default List
