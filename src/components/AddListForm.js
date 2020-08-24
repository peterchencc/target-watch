import React, { useState } from 'react'

const AddListForm = (props) => {
  const initialFormState = { uid: null, title: '' }
  const [list, setList] = useState(initialFormState)

  const handleInputChange = (event) => {
    const { name, value } = event.target
    setList({ ...list, [name]: value })
  }

  const handleFormSubmit = (event) => {
    event.preventDefault()
    if (!list.title) return
    console.log('create list title', list.title)

    props.addList(list)
    setList(initialFormState)
  }

  return (
    <form id="createWatchList" onSubmit={handleFormSubmit}>
      <input
        type="text"
        name="title"
        value={list.title}
        onChange={handleInputChange}
        placeholder="Name your watch list"
        className="shadow appearance-none border rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none"
      />
    </form>
  )
}

export default AddListForm
