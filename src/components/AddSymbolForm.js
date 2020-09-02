import React, { useState } from 'react'
import Autocomplete from './Autocomplete'

const AddSymbolForm = (props) => {
  const initialFormState = { name: '' }
  const [symbol, setSymbol] = useState(initialFormState)

  const handleFormSubmit = (event) => {
    console.log('AddSymbolForm handleFormSubmit')
    event.preventDefault()
    if (!symbol.name) return

    props.addSymbol(symbol)
    setSymbol(initialFormState)
  }

  const updateSymbol = (value) => {
    setSymbol({ ...symbol, name: value })
  }

  return (
    <form onSubmit={handleFormSubmit} className="ml-auto mr-4">
      <Autocomplete setSymbol={updateSymbol} />
      <button className="btn btn-blue">Add</button>
    </form>
  )
}

export default AddSymbolForm
