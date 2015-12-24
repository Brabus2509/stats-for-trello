import immupdate from 'immupdate'

export default function (state, action) {
  if (action.error) {
    console.log('ERROR: ', action.error)
    return state
  }

  switch (action.type) {
    case 'LOGGED':
      return immupdate(state, {
        'visibleBoards': [],
        'user': action.user
      })
    case 'VISIBLE_BOARDS':
      return immupdate(state, {
        'visibleBoards': action.boards,
        'board': null
      })
    case 'BOARD_CHOSEN':
      return immupdate(state, {
        'board': action.board,
        'tables': {}
      })
    case 'CRUNCHED_STATS':
      return immupdate(state, {
        'tables': action.tables,
        'lastActionDate': action.lastActionDate
      })
    default:
      return state
  }
}
