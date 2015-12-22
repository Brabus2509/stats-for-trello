import { compose, createStore, applyMiddleware } from 'redux'
import thunkMiddleware from 'redux-thunk'
import rootReducer from './reducers'

const initialState = {
  user: null,
  visibleBoards: [],
  board: null,
  tables: {},
}
const middle = applyMiddleware(thunkMiddleware)
const store = middle(createStore)(rootReducer, initialState)

export default store
