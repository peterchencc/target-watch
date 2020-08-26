import React, { useState, useEffect } from 'react'
import { firestore } from '../base'
import Modal from './Modal'
import List from './List'
import AddListForm from './AddListForm'

const WatchListWrapper = (props) => {
  const [user, setUser] = useState(props.currentUser)

  useEffect(() => {
    setUser(props.currentUser)
  }, [props])

  const [lists, setLists] = useState([])

  const addList = (list) => {
    const newList = {
      uid: user,
      title: list.title,
      symbols: [],
      timestamp: Date.now(),
    }
    firestore
      .collection('watchlists')
      .add(newList)
      .then(function (docRef) {
        setLists([...lists, { id: docRef.id, ...newList }])
        props.handleShowModal()
      })
      .catch(function (error) {
        console.error('Error adding document: ', error)
      })
  }

  const deleteList = (id) => {
    firestore
      .collection('watchlists')
      .doc(id)
      .delete()
      .then(function () {
        setLists(lists.filter((list) => list.id !== id))
        console.log('Document successfully deleted!')
      })
      .catch(function (error) {
        console.error('Error removing document: ', error)
      })
  }

  useEffect(() => {
    console.log('WatchListWrapper useEffect')
    console.log('props.currentUser', user)
    firestore
      .collection('watchlists')
      .where('uid', '==', user)
      .get()
      .then(function (querySnapshot) {
        const lists = []
        querySnapshot.forEach(function (doc) {
          let data = { id: doc.id, ...doc.data() }
          lists.push(data)
        })
        setLists(lists)
      })
      .catch(function (error) {
        console.log('Error getting documents: ', error)
      })
  }, [user])

  return (
    <section>
      <div className="flex justify-between">
        <div className="text-xl">Watchlist</div>
        <button
          onClick={(e) => {
            props.handleShowModal(e)
          }}
        >
          + Create Watchlist
        </button>
      </div>

      <Modal
        onClose={props.handleShowModal}
        show={props.showModal}
        title="Create a new watch list"
        actionTitle="Create"
        formId="createWatchList"
      >
        <AddListForm addList={addList} />
      </Modal>
      <div>
        {!lists.length > 0 ? (
          <div>No watchlist yet.</div>
        ) : (
          lists
            .sort((a, b) => b.timestamp - a.timestamp)
            .map((list) => (
              <List
                key={list.id}
                list={list}
                symbols={props.symbols}
                deleteList={deleteList}
                getSymbol={props.getSymbol}
              ></List>
            ))
        )}
      </div>
    </section>
  )
}

export default WatchListWrapper
