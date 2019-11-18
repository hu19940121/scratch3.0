const SET_USER_INFO = 'SET_USER_INFO';
const SET_SESSION = 'SET_SESSION';
const SET_LOGIN_VISIBLE = 'SET_LOGIN_VISIBLE';
const SET_PUBLISH_VISIBLE = 'SET_PUBLISH_VISIBLE';

const initialState = {
    loginVisible: false,
    session: null,
    userInfo: null,
    publishVisible: false
};

const reducer = function (state, action) {
    if (typeof state === 'undefined') state = initialState;
    switch (action.type) {
    case SET_USER_INFO:
        return Object.assign({}, {...state, userInfo: action.userInfo});
    case SET_SESSION:
        return Object.assign({}, {...state, session: action.session});
    case SET_LOGIN_VISIBLE:
        return Object.assign({}, {...state, loginVisible: action.visible});
    case SET_PUBLISH_VISIBLE:
        return Object.assign({}, {...state, publishVisible: action.visible});
    default:
        return state;
    }
};

const setUserInfo = userInfo => ({
    type: SET_USER_INFO,
    userInfo: userInfo
});
const setSession = session => ({
    type: SET_SESSION,
    session: session
});
const setLoginVisible = visible => ({
    type: SET_LOGIN_VISIBLE,
    visible: visible
});
const setPublishVisible = visible => ({
    type: SET_PUBLISH_VISIBLE,
    visible: visible
});
export {
    reducer as default,
    initialState as loginInitialState,
    setUserInfo,
    setSession,
    setLoginVisible,
    setPublishVisible
};
