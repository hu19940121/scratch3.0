const SET_VIDEO_PLAYER_VISIBLE = 'SET_VIDEO_PLAYER_VISIBLE';
const SET_VIDEO_PLAYER_TITLE = 'SET_VIDEO_PLAYER_TITLE';
const SET_VIDEO_PLAYER_SRC = 'SET_VIDEO_PLAYER_SRC';
const SET_MENU_BAR_PLAYER_BTN_VISIBLE = 'SET_MENU_BAR_PLAYER_BTN_VISIBLE';
const initialState = {
    menuBarPlayBtnVisible: false,
    videoPlayerVisible: false,
    videoPlayerTitle: '源码公开课移动',
    videoPlayerSrc: 'https://static.codemao.cn/kitten/open_course/video/GK-01gkke16V3.0(%E7%AE%80).mp4'
};
const reducer = function (state, action) {
    if (typeof state === 'undefined') state = initialState;
    switch (action.type) {
    case SET_VIDEO_PLAYER_TITLE:
        return Object.assign({}, {...state, videoPlayerTitle: action.title});
    case SET_VIDEO_PLAYER_SRC:
        return Object.assign({}, {...state, videoPlayerSrc: action.src});
    case SET_VIDEO_PLAYER_VISIBLE:
        return Object.assign({}, {...state, videoPlayerVisible: action.visible});
    case SET_MENU_BAR_PLAYER_BTN_VISIBLE:
        return Object.assign({}, {...state, menuBarPlayBtnVisible: action.visible});
        
    default:
        return state;
    }
};

const setVideoPlayerTitle = title => ({
    type: SET_VIDEO_PLAYER_TITLE,
    title
});
const setVideoPlayerSrc = src => ({
    type: SET_VIDEO_PLAYER_SRC,
    src
});
const setVideoPlayerVisible = visible => ({
    type: SET_VIDEO_PLAYER_VISIBLE,
    visible
});
const setMenuBarPlayBtnVisible = visible => ({
    type: SET_MENU_BAR_PLAYER_BTN_VISIBLE,
    visible
});
export {
    reducer as default,
    initialState as videoPlayerInitialState,
    setVideoPlayerTitle,
    setVideoPlayerSrc,
    setVideoPlayerVisible,
    setMenuBarPlayBtnVisible
};
