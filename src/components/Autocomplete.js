import React, { useState, useEffect } from 'react'
import axios from 'axios'

const Autocomplete = (props) => {
  const [activeOption, setActiveOption] = useState(0)
  const [filteredOptions, setFilteredOptions] = useState([])
  const [showOptions, setShowOptions] = useState(false)
  const [userInput, setUserInput] = useState('')
  const [stockList, setStockList] = useState([])

  useEffect(() => {
    fetchStockList()
  }, [])

  useEffect(() => {
    if (!userInput) {
      setShowOptions(false)
      setActiveOption(0)
    }
  }, [userInput])

  const fetchStockList = () => {
    axios
      .get(
        'https://finnhub.io/api/v1/stock/symbol?exchange=US' +
          '&token=' +
          process.env.REACT_APP_FINNHUB_TOKEN
      )
      .then((response) => {
        let data = response.data
        setStockList(data)
      })
  }

  const onChange = (e) => {
    if (!stockList.length && e.currentTarget.value.length < 2) {
      fetchStockList()
    }

    const currentValue = e.currentTarget.value.toUpperCase()

    const filteredOptions = stockList
      .filter((option) => {
        return option.symbol.startsWith(currentValue)
      })
      .sort((a, b) => a.symbol.localeCompare(b.symbol))
      .filter((_, idx) => idx < 10)

    setUserInput(currentValue)
    props.setSymbol(currentValue)

    if (filteredOptions.length <= activeOption) {
      setActiveOption(filteredOptions.length)
    }

    setFilteredOptions(filteredOptions)
    setShowOptions(true)
  }

  const onClick = (e) => {
    setActiveOption(0)
    setFilteredOptions([])
    setShowOptions(false)
    setUserInput(e.currentTarget.innerText)
    props.setSymbol(e.currentTarget.innerText)
  }

  const onKeyDown = (e) => {
    if (e.keyCode === 27 || !userInput) {
      setShowOptions(false)
      setActiveOption(0)
    }

    if (filteredOptions[activeOption] && e.keyCode === 13) {
      setUserInput(filteredOptions[activeOption].symbol)
      props.setSymbol(filteredOptions[activeOption].symbol)
      setActiveOption(0)
      setShowOptions(false)
    } else if (e.keyCode === 38) {
      if (activeOption === 0) {
        return
      }
      setActiveOption(activeOption - 1)
      if (filteredOptions[activeOption - 1]) {
        setUserInput(filteredOptions[activeOption - 1].symbol)
      }
    } else if (e.keyCode === 40) {
      if (activeOption - 1 >= filteredOptions.length) {
        return
      }
      setActiveOption(activeOption + 1)
      if (filteredOptions[activeOption + 1]) {
        setUserInput(filteredOptions[activeOption + 1].symbol)
      }
    }
  }

  const OptionList = () => {
    let ulClassName = 'absolute w-48 bg-white border z-50'
    let liClassName = 'px-3'
    if (!filteredOptions.length) {
      return (
        <ul className={ulClassName}>
          <li className={liClassName}>No matching results</li>
        </ul>
      )
    } else {
      return (
        <ul className={ulClassName}>
          {filteredOptions.map((option, index) => {
            let className = liClassName
            if (index === activeOption) {
              className += ' bg-gray-700 text-white'
            }
            return (
              <li className={className} key={index} onClick={onClick}>
                {option.symbol}
              </li>
            )
          })}
        </ul>
      )
    }
  }

  return (
    <>
      <input
        onChange={onChange}
        onKeyDown={onKeyDown}
        value={userInput}
        name="name"
        style={{ textTransform: 'uppercase' }}
        placeholder="Symbol"
        type="text"
        autoComplete="off"
        className="w-48 h-10 appearance-none border rounded rounded-r-none py-2 px-3 text-gray-700 leading-tight focus:outline-none"
      />
      {showOptions && <OptionList />}
    </>
  )
}

export default Autocomplete
