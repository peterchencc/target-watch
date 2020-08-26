import React, { useState } from 'react'

const AddSymbolForm = (props) => {
  const initialFormState = { name: '' }
  const [symbol, setSymbol] = useState(initialFormState)

  const handleInputChange = (event) => {
    const { name, value } = event.target
    setSymbol({ ...symbol, [name]: value })
  }

  const handleFormSubmit = (event) => {
    event.preventDefault()
    if (!symbol.name) return

    props.addSymbol(symbol)
    setSymbol(initialFormState)
  }

  return (
    <form onSubmit={handleFormSubmit}>
      <input
        type="text"
        name="name"
        value={symbol.name}
        onChange={handleInputChange}
        placeholder="Add Symbol"
        className="uppercase shadow appearance-none border rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none"
      />
      <button className="btn btn-blue">Add</button>
    </form>
  )
}

export default AddSymbolForm
