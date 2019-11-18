import classNames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';
import ReactDOM from 'react-dom';
import {connect} from 'react-redux';
import {compose} from 'redux';

import Box from '../components/box/box.jsx';
import GUI from '../containers/gui.jsx';
import HashParserHOC from '../lib/hash-parser-hoc.jsx';
import AppStateHOC from '../lib/app-state-hoc.jsx';
import TitledHOC from '../lib/titled-hoc.jsx';

import {setPlayer} from '../reducers/mode';

if (process.env.NODE_ENV === 'production' && typeof window === 'object') {
    // Warn before navigating away
    window.onbeforeunload = () => true;
}

import styles from './player.css';
const Player = ({isPlayerOnly, onSeeInside, projectId, isFullScreen}) => (
    <Box className={classNames(isPlayerOnly ? styles.stageOnly : styles.editor)}>
        {/* {isPlayerOnly && <button onClick={onSeeInside}>{'See inside'}</button>} */}
        <GUI
            isFullScreen={isFullScreen}
            enableCommunity
            isPlayerOnly={isPlayerOnly}
            projectId={projectId}
        />
    </Box>
);

Player.propTypes = {
    isPlayerOnly: PropTypes.bool,
    onSeeInside: PropTypes.func,
    projectId: PropTypes.string,
    isFullScreen: PropTypes.bool
};

const mapStateToProps = state => ({
    isPlayerOnly: state.scratchGui.mode.isPlayerOnly,
    isFullScreen: state.scratchGui.mode.isFullScreen
});
// const getQueryVariable = variable => {
//     const query = window.location.search.substring(1);
//     const vars = query.split('&');
//     for (let i = 0; i < vars.length; i++) {
//         const pair = vars[i].split('=');
//         if (pair[0] == variable){
//             return pair[1];
//         }
//     }
//     return (false);
// };
const mapDispatchToProps = dispatch => ({
    onSeeInside: () => dispatch(setPlayer(false))
});

const ConnectedPlayer = connect(
    mapStateToProps,
    mapDispatchToProps
)(Player);

// note that redux's 'compose' function is just being used as a general utility to make
// the hierarchy of HOC constructor calls clearer here; it has nothing to do with redux's
// ability to compose reducers.
const WrappedPlayer = compose(
    AppStateHOC,
    HashParserHOC,
    TitledHOC
)(ConnectedPlayer);
const appTarget = document.createElement('div');
document.body.appendChild(appTarget);
ReactDOM.render(<WrappedPlayer
    isFullScreen
    isPlayerOnly
/>, appTarget);
