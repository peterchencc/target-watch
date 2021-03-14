import React, { useState } from 'react'
import { firestore } from '../base'
import Symbol from './Symbol'
import AddSymbolForm from './AddSymbolForm'
import { SortableContainer, SortableElement } from 'react-sortable-hoc'
import arrayMove from 'array-move'

const List = (props) => {
  const { list, symbols } = props
  const { id, title } = list
  const [selectedSymbols, setSelectedSymbols] = useState(list.symbols)
  const [sortingDisable, setSortingDisable] = useState(true)

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

  const SortableItem = SortableElement(({ value, index }) => (
    <Symbol
      key={index}
      name={value.name}
      data={symbols[value.name]}
      getSymbol={props.getSymbol}
    />
  ))

  const SortableList = SortableContainer(({ items }) => {
    return (
      <div className="py-4 block relative clearfix">
        {items.map((value, index) => (
          <SortableItem
            disabled={sortingDisable}
            key={`item-${index}`}
            index={index}
            value={value}
          />
        ))}
      </div>
    )
  })

  const onSortEnd = ({ oldIndex, newIndex }) => {
    const sortedList = arrayMove(selectedSymbols, oldIndex, newIndex)
    setSelectedSymbols(sortedList)

    const listRef = firestore.collection('watchlists').doc(id)
    listRef
      .update({
        symbols: [...sortedList],
      })
      .then(function () {
        console.log('Document successfully updated!')
      })
      .catch(function (error) {
        // The document probably doesn't exist.
        console.error('Error updating document: ', error)
      })
  }

  return (
    <div className="">
      <section className="my-8">
        <div className="flex justify-between border-b border-gray-400">
          <div className="text-xl py-2">{title}</div>
          <AddSymbolForm addSymbol={addSymbol}></AddSymbolForm>
          <button
            className="btn border ml-2"
            onClick={() => setSortingDisable(!sortingDisable)}
          >
            {sortingDisable ? 'Change Order' : 'Done'}
          </button>
          <button
            className="btn border ml-2"
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
          //grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4
          <div className="py-4">
            <SortableList
              axis="xy"
              items={selectedSymbols}
              onSortEnd={onSortEnd}
            />
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
