import { createStore, applyMiddleware } from 'redux';
import { composeWithDevTools } from 'redux-devtools-extension';
import thunkMiddleware from 'redux-thunk';
import { persistReducer, persistStore } from 'redux-persist';
import storage from 'redux-persist/lib/storage';

const toDays = time => parseInt(time / 60 / 60 / 24);
const toHours = time => parseInt((time / 60 / 60) % 24);
const toMinutes = time => parseInt((time / 60) % 60);
const toSeconds = time => time % 60;
const toText = time => `00${time}`.slice(-2);

/**
 * タイマーの状態を開始状態に変更する
 * @param state タイマーの状態
 * @param {number} intervalID setInterval()で得られたID
 * @return タイマーの開始状態
 */
export function start(state, intervalID) {
  return Object.assign({}, state, {
    started: true,
    intervalID,
    startTime: new Date()
  });
}

/**
 * タイマーの時間を1秒進める
 * @param state タイマーの時間の状態
 * @return 時間を1秒進めた新しい状態
 */
export function update(state) {
  let { time } = state;

  if (state.startTime !== null) {
    time = parseInt((new Date() - Date.parse(state.startTime)) / 1000);
  }

  const days = toDays(time);
  const hours = toHours(time);
  const minutes = toMinutes(time);
  const seconds = toSeconds(time);

  return Object.assign({}, state, {
    days,
    hours: toText(hours),
    minutes: toText(minutes),
    seconds: toText(seconds),
    time
  });
}

/**
 * タイマーの初期状態
 */
export function initialState() {
  return {
    days: 0,
    hours: '00',
    minutes: '00',
    seconds: '00',
    time: 0,
    started: false,
    intervalID: -1,
    startTime: null
  };
}

/**
 * タイマーの時間をリセットする
 * @return タイマーの初期状態
 */
export function reset(state) {
  clearInterval(state.intervalID);

  return Object.assign({}, initialState(), {
    started: false,
    intervalID: -1,
    time: 0,
    startTime: null
  });
}

export function updateTitle(state, title) {
  return Object.assign({}, state, {
    title
  });
}

export function updateContent(state, content) {
  return Object.assign({}, state, {
    content
  });
}

export function startTimerAction(intervalID) {
  return { type: 'START_TIMER', intervalID };
}

export function updateTimerAction() {
  return { type: 'UPDATE_TIMER' };
}

export function resetTimerAction() {
  return { type: 'RESET_TIMER' };
}

export function updateTitleAction(title) {
  return { type: 'UPDATE_TITLE', title };
}

export function updateContentAction(content) {
  return { type: 'UPDATE_CONTENT', content };
}

/**
 * Reduxのreducer タイマーの時間の状態遷移を処理する
 * @param state Reduxのstoreで管理されている状態
 * @param action アクションオブジェクト
 * @return actionに応じて変化させた新しい状態
 */
export const reducer = (state = initialState(), action) => {
  switch (action.type) {
    case 'START_TIMER':
      return start(state, action.intervalID);
    case 'UPDATE_TIMER':
      return update(state);
    case 'RESET_TIMER':
      return reset(state);
    case 'UPDATE_TITLE':
      return updateTitle(state, action.title);
    case 'UPDATE_CONTENT':
      return updateContent(state, action.content);
    default:
      return state;
  }
};

const persistConfig = {
  key: 'root',
  storage
};

const persistedReducer = persistReducer(persistConfig, reducer);

export function initializeStore(state = initialState()) {
  return createStore(
    persistedReducer,
    state,
    composeWithDevTools(applyMiddleware(thunkMiddleware))
  );
}

export const persistor = store => persistStore(store);
