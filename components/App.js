import React, { Component, PropTypes } from 'react'
import trello from '../trello'
import { connect } from 'react-redux'
import { automaticLoginIfPossible, login, chooseBoard } from '../actions'
import { Table } from 'reactabular'

class App extends Component {
  constructor(props) {
    super(props)
  }

  componentDidMount () {
    const { dispatch } = this.props
    dispatch(automaticLoginIfPossible())
  }

  render() {
    const { dispatch } = this.props
    let { user, board, visibleBoards, tables } = this.props

    if (user && board && Object.keys(tables).length) {
      return (
        <article>
          <header>
            <h1>stats for <a href="https://trello.com/b/{{board.id}}" target="_blank">{board.name}</a>:</h1>
          </header>
          <div>
            {Object.keys(tables).map(tableName => {
              let table = tables[tableName]
              return (
                <div key={tableName}>
                  <h1>{tableName}</h1>
                  <Table data={table.data} columns={table.columns}></Table>
                </div>
              )
            })}
          </div>
        </article>
      )
    } else if (user && board) {
      return (
        <section>
          <header>
            <h1>fetching data...</h1>
          </header>
        </section>
      )
    } else if (visibleBoards && user) {
      return (
        <section>
          <header>
            <h1>Choose a board, {user.username}:</h1>
          </header>
          <ul>
            {visibleBoards.map(board =>
              <li key={board.id}>
                <a href="#" onClick={e => {
                    e.preventDefault()
                    dispatch(chooseBoard(board))
                  }}
                >
                  {board.name}
                </a>
              </li>
            )}
          </ul>
        </section>
      )
    } else if (user) {
      return (
        <h1>Welcome, {user.username}</h1>
      )
    } else {
      return (
        <section>
          <header>
            <h1>Login with your Trello account:</h1>
          </header>
          <div>
            <button
              id="login"
              onClick={e => {
                e.preventDefault()
                dispatch(login())
              }}
            >Login</button>
          </div>
        </section>
      )
    }
  }
}

export default connect(s => s)(App)
