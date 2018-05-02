const redux = require("redux");
// const thunk = require("redux-thunk").default;
const { createStore, applyMiddleware } = redux;
const { printTime } = require("./util");

const logger = store => next => action => {
  console.log("will dispatch", action);

  // 调用 middleware 链中下一个 middleware 的 dispatch。
  let returnValue = next(action);

  console.log("state after dispatch", getState());

  // 一般会是 action 本身，除非
  // 后面的 middleware 修改了它。
  return returnValue;
};

/**
 * 这是一个 reducer，形式为 (state, action) => state 的纯函数。
 * 描述了 action 如何把 state 转变成下一个 state。
 *
 * state 的形式取决于你，可以是基本类型、数组、对象、
 * 甚至是 Immutable.js 生成的数据结构。惟一的要点是
 * 当 state 变化时需要返回全新的对象，而不是修改传入的参数。
 *
 * 下面例子使用 `switch` 语句和字符串来做判断，但你可以写帮助类(helper)
 * 根据不同的约定（如方法映射）来判断，只要适用你的项目即可。
 */
function counter(state = 0, action) {
  switch (action.type) {
    case "INCREMENT":
      return state + 1;
    case "DECREMENT":
      return state - 1;
    default:
      return state;
  }
}

// logger middleware

const loggerMiddleware = ({ getState, dispatch }) => next => action => {
  console.log(action);
  next(action);
};

const createThunkMiddleware = extraArgument => ({
  getState,
  dispatch
}) => next => action =>
  typeof action === "function"
    ? action(dispatch, getState, extraArgument)
    : next(action);

const thunk = createThunkMiddleware();

const catchPromise = () => next => action => {
  const res = next(action);
  if (
    !!res &&
    (typeof res === "object" || typeof res === "function") &&
    typeof res.then === "function"
  ) {
    res.catch(error => {
      const errorTypeDesc = error.statusCode ? `.${error.statusCode}` : "";
      console.log({
        name: `client.request.error${errorTypeDesc}`,
        msg: error.toString()
      });
      next(throwError(error));
    });
  }
  return res;
};

// 创建 Redux store 来存放应用的状态。
// API 是 { subscribe, dispatch, getState }。
const store = applyMiddleware(thunk, loggerMiddleware)(createStore)(counter);

// 可以手动订阅更新，也可以事件绑定到视图层。
store.subscribe(() => {
  console.log(`subscribe: ${store.getState()}`);
});

const dispatchInc = () => store.dispatch({ type: "INCREMENT" });
const dispatchDec = () => store.dispatch({ type: "DECREMENT" });
const dispatchThunkInc = () =>
  store.dispatch((dispatch, getState, extraArgument) => {
    const state = getState();
    printTime();
    setTimeout(() => {
      printTime();
      dispatch({ type: "INCREMENT" });
    }, 3000);
  });

dispatchThunkInc();
