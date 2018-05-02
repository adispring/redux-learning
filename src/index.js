const redux = require('redux');
const thunk = require('redux-thunk').default;
const { createStore, applyMiddleware } = redux;
const todos = require('./reducers/index');

const logger = store => next => action => {
    console.log('will dispatch', action)

    // 调用 middleware 链中下一个 middleware 的 dispatch。
    let returnValue = next(action)

    console.log('state after dispatch', getState())

    // 一般会是 action 本身，除非
    // 后面的 middleware 修改了它。
    return returnValue
  };

  


let store = createStore(
  todos,
  [ 'Use Redux' ]
)

store.dispatch({
  type: 'ADD_TODO',
  text: 'Understand the middleware'
})
