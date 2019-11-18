import PropTypes from 'prop-types';
import React from 'react';
import classNames from 'classnames';
import bindAll from 'lodash.bindall';
import ReactTooltip from 'react-tooltip';
import Draggable from 'react-draggable';
import { Player } from 'video-react';
import "video-react/dist/video-react.css"; // import css
import {connect} from 'react-redux';


import styles from './video-player.css';
import {
  setVideoPlayerVisible
} from '../../reducers/video-player';
class VideoPlayer extends React.Component {
    constructor (props) {
        super(props);
        bindAll(this, [
          'handleStart',
          'handleStop',
          'handleDrag'
        ]);
        this.state = {

        };
    }
    componentDidMount () {
    }
    handleStart() {

    }
    handleDrag() {

    }
    handleStop() {

    }
  //   className={classNames(
  //     styles.tagButton,
  //     className, {
  //         [styles.active]: active
  //     }
  // )}
    render () {
        return this.props.videoPlayerVisible && (
          <Draggable  handle="strong">
            <div className={classNames(styles.playerWrapper)}>
              <strong className={classNames(styles.cursor)}>
                <div className={classNames(styles.topCon)}>
                  <span className={classNames(styles.topConL)}>{this.props.videoPlayerTitle}</span>
                  <div className={classNames(styles.topConR)}>
                    <span onClick={ ()=>{this.props.setVideoPlayerVisible(false)} }>-</span>
                    <span onClick={ ()=>{this.props.setVideoPlayerVisible(false)} }>x</span>
                  </div>
                </div>
              </strong>
              <Player
                playsInline
                src={this.props.videoPlayerSrc}
              >

              </Player>
              {/* <video  className={classNames(styles.player)} controls src="https://static.codemao.cn/kitten/open_course/video/GK-01gkke16V3.0(%E7%AE%80).mp4"></video> */}
            </div>
          </Draggable>
        );
    }
}

VideoPlayer.propTypes = {
  videoPlayerVisible: PropTypes.bool,
  setVideoPlayerVisible: PropTypes.func,
  videoPlayerSrc: PropTypes.string,  //教学视频的src
  videoPlayerTitle: PropTypes.string  //教学视频的title
};
const mapDispatchToProps = dispatch => ({
  setVideoPlayerVisible: status => dispatch(setVideoPlayerVisible(status))
});
const mapStateToProps = (state, ownProps) => ({
  videoPlayerVisible: state.scratchGui.videoPlayer.videoPlayerVisible,
  videoPlayerTitle: state.scratchGui.videoPlayer.videoPlayerTitle || '',
  videoPlayerSrc: state.scratchGui.videoPlayer.videoPlayerSrc || '',
});
export default connect(
  mapStateToProps,
  mapDispatchToProps
)(VideoPlayer)
// export default VideoPlayer;
