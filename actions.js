import trello from './trello'

export function automaticLoginIfPossible () {
  return dispatch => {
    let token = localStorage.getItem('trello-token')
    if (token) {
      trello.setToken(token)
      let user = JSON.parse(localStorage.getItem('trello-user') || '{"username": "you"}')
      dispatch({
        type: 'LOGGED',
        user
      })
      dispatch(fetchVisibleBoards())
    }
  }
}

export function login () {
  return dispatch => {
    trello.auth({
      name: 'Trello Stats',
      scope: {read: true},
      expiration: 'never'
    })
    .then(() => trello.get('/1/members/me'))
    .then(user => {
      localStorage.setItem('trello-token', trello.token)
      localStorage.setItem('trello-user', JSON.stringify(user))
      dispatch({
        type: 'LOGGED',
        user
      })
      dispatch(fetchVisibleBoards())
    })
    .catch(e => dispatch({
      type: 'LOGGED',
      error: e
    }))
  }
}

export function fetchVisibleBoards () {
  return dispatch => {
    trello.get(`/1/members/me/boards`, {fields: 'id,name', filter: 'open'})
    .then(boards => dispatch({
      type: 'VISIBLE_BOARDS',
      boards
    }))
    .catch(e => dispatch({
      type: 'VISIBLE_BOARDS',
      error: e
    }))
  }
}

export function chooseBoard (board) {
  return dispatch => {
    dispatch({
      type: 'BOARD_CHOSEN',
      board
    })
    return dispatch(fetchStats(board))
  }
}

function fetchStats (board) {
  return dispatch => {
    trello.get(`/1/boards/${board.id}/actions`, {
      fields: 'date',
      memberCreator_fields: 'username',
      limit: 1000,
    })
    .then(actions => {
      var tables = {}

      // users most active
      const UMA = {}
      actions.forEach(act => {
        UMA[act.memberCreator.username] = UMA[act.memberCreator.username] || 0
        UMA[act.memberCreator.username] += 1
      })
      var columns = [{header: 'User', property: 'u'}, {header: 'Actions', property: 'a'}]
      var data = []
      for (let user in UMA) {
        let count = UMA[user]
        data.push({a: count, u: user})
      }
      tables['Users most active'] = {data: data, columns: columns}
      // ~

      // day of week activity
      var DOWA = {}
      // ~

      dispatch({
        type: 'CRUNCHED_STATS',
        tables
      })
    })
    .catch(e => dispatch({
      type: 'CRUNCHED_STATS'
    }))
  }
}
