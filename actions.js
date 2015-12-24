import trello from './trello'
import { get as dayOfWeek } from 'day-of-week'

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
      fields: 'date,data',
      memberCreator_fields: 'username',
      limit: 1000,
    })
    .then(actions => {
      var tables = {}
      var agg, data, columns

      // users most active
      agg = {}
      actions.forEach(act => {
        agg[act.memberCreator.username] = agg[act.memberCreator.username] || 0
        agg[act.memberCreator.username] += 1
      })
      columns = [{header: 'User', property: 'l'}, {header: 'Actions', property: 'a'}]
      data = []
      for (let key in agg) {
        let count = agg[key]
        data.push({a: count, l: key})
      }
      data.sort((a, b) => b.a - a.a)
      data = data.slice(0, 15)
      tables[`Users most active on ${board.name}`] = {data: data, columns: columns}
      // ~

      // lists most active
      agg = {}
      actions.forEach(act => {
        if (!act.data.list) return
        agg[act.data.list.name] = agg[act.data.list.name] || 0
        agg[act.data.list.name] += 1
      })
      columns = [{header: 'List', property: 'l'}, {header: 'Actions', property: 'a'}]
      data = []
      for (let key in agg) {
        let count = agg[key]
        data.push({a: count, l: key})
      }
      data.sort((a, b) => b.a - a.a)
      data = data.slice(0, 10)
      tables[`Lists most active on ${board.name}`] = {data: data, columns: columns}
      // ~

      // cards most active
      agg = {}
      actions.forEach(act => {
        if (!act.data.card) return
        agg[act.data.card.name] = agg[act.data.card.name] || 0
        agg[act.data.card.name] += 1
      })
      columns = [{header: 'Card', property: 'l'}, {header: 'Actions', property: 'a'}]
      data = []
      for (let key in agg) {
        let count = agg[key]
        data.push({a: count, l: key})
      }
      data.sort((a, b) => b.a - a.a)
      data = data.slice(0, 15)
      tables[`Cards most active on ${board.name}`] = {data: data, columns: columns}
      // ~

      // day of week activity
      const weekDays = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
      agg = {}
      actions.forEach(act => {
        let wdn = dayOfWeek(act.date)
        agg[wdn] = agg[wdn] || 0
        agg[wdn] += 1
      })
      columns = [{header: 'Weekday', property: 'l'}, {header: 'Actions', property: 'a'}]
      data = []
      for (let key in agg) {
        let count = agg[key]
        let weekDayStr = weekDays[key]
        data.push({a: count, l: weekDayStr, day: key})
      }
      data.sort((a, b) => a.day - b.day)
      tables[`Days of week with most activity on ${board.name}`] = {data: data, columns: columns}
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
