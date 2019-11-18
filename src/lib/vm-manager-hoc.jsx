import bindAll from 'lodash.bindall';
import PropTypes from 'prop-types';
import React from 'react';
import {connect} from 'react-redux';

import VM from 'scratch-vm';
import AudioEngine from 'scratch-audio';
import {getWorkDetailById} from '../apis/work';
import axios from 'axios';
import {setProjectUnchanged} from '../reducers/project-changed';
import {
    LoadingStates,
    getIsLoadingWithId,
    onLoadedProject,
    projectError
} from '../reducers/project-state';
import {
    setMenuBarPlayBtnVisible,
    setVideoPlayerSrc,
    setVideoPlayerTitle
} from '../reducers/video-player';
import {getQueryVariable} from '../utils/util';
/*
 * Higher Order Component to manage events emitted by the VM
 * @param {React.Component} WrappedComponent component to manage VM events for
 * @returns {React.Component} connected component with vm events bound to redux
 */
const vmManagerHOC = function (WrappedComponent) {
    class VMManager extends React.Component {
        constructor (props) {
            super(props);
            bindAll(this, [
                'loadProject'
            ]);
        }
        componentDidMount () {
            // console.log('this.props.isPlayerOnly', this.props.isPlayerOnly);
            // console.log('this.props', this.props);
            
            if (!this.props.vm.initialized) {
                this.audioEngine = new AudioEngine();
                this.props.vm.attachAudioEngine(this.audioEngine);
                this.props.vm.setCompatibilityMode(true);
                this.props.vm.initialized = true;
                this.props.vm.setLocale(this.props.locale, this.props.messages);
            }
            if (!this.props.isPlayerOnly && !this.props.isStarted) {
                this.props.vm.start();
            }
        }
        componentDidUpdate (prevProps) {
            // if project is in loading state, AND fonts are loaded,
            // and they weren't both that way until now... load project!
            if (this.props.isLoadingWithId && this.props.fontsLoaded &&
                (!prevProps.isLoadingWithId || !prevProps.fontsLoaded)) {
                this.loadProject();
            }
            // Start the VM if entering editor mode with an unstarted vm
            if (!this.props.isPlayerOnly && !this.props.isStarted) {
                this.props.vm.start();
            }
        }
        loadProject () {
            const workId = getQueryVariable('workId');
            // console.log('this.props.projectData', this.props.projectData);
            // 如果有自己传进来的workId 根据workId去下载.sb3文件 然后加载
            // if (this.props.workId) {
            //     getWorkDetailById({id: this.props.workId}).then(res => { // 获取详情
            //         axios
            //             .get(res.data.url, { // 下载文件
            //                 responseType: 'blob'
            //             })
            //             .then(file => {
            //                 const reader = new FileReader();
            //                 reader.readAsArrayBuffer(file.data);
            //                 reader.onload = () =>
            //                     this.props.vm.loadProject(reader.result)
            //                         .then(() => {
            //                             this.props.onLoadedProject(this.props.loadingState, this.props.canSave);
            //                             setTimeout(() => this.props.onSetProjectUnchanged());
            //                             if (!this.props.isStarted) {
            //                                 setTimeout(() => this.props.vm.renderer.draw());
            //                             }
            //                         })
            //                         .catch(e => {
            //                             this.props.onError(e);
            //                         })
            //                 ;
            //             });
            //     });
            if (workId) { // 有workId  根据workId获取详情 根据详情中的url下载sb3文件
                getWorkDetailById({id: workId}).then(res => { // 获取详情
                    const uploadedProjectTitle = res.data.name;
                    if (res.data.seeAndDo) {
                        this.props.setMenuBarPlayBtnVisible(true);
                        this.props.setVideoPlayerSrc(res.data.videoUrl);
                        this.props.setVideoPlayerTitle(res.data.name);
                    }
                    axios
                        .get(res.data.url, { // 下载文件
                            responseType: 'blob'
                        })
                        .then(file => {
                            const reader = new FileReader();
                            reader.readAsArrayBuffer(file.data);
                            reader.onload = () =>
                                this.props.vm.loadProject(reader.result)
                                    .then(() => {
                                        // eslint-disable-next-line no-unused-expressions
                                        !this.props.isPlayerOnly && this.props.onUpdateProjectTitle(uploadedProjectTitle);
                                        this.props.onLoadedProject(this.props.loadingState, this.props.canSave);
                                        setTimeout(() => this.props.onSetProjectUnchanged());
                                        if (!this.props.isStarted) {
                                            setTimeout(() => this.props.vm.renderer.draw());
                                        }
                                    })
                                    .catch(e => {
                                        this.props.onError(e);
                                    });
                        });
                });
            } else {
                return this.props.vm.loadProject(this.props.projectData)
                    .then(() => {
                        // console.log('加载文件完成');
                        this.props.onLoadedProject(this.props.loadingState, this.props.canSave);
                        // Wrap in a setTimeout because skin loading in
                        // the renderer can be async.
                        setTimeout(() => this.props.onSetProjectUnchanged());

                        // If the vm is not running, call draw on the renderer manually
                        // This draws the state of the loaded project with no blocks running
                        // which closely matches the 2.0 behavior, except for monitors–
                        // 2.0 runs monitors and shows updates (e.g. timer monitor)
                        // before the VM starts running other hat blocks.
                        if (!this.props.isStarted) {
                        // Wrap in a setTimeout because skin loading in
                        // the renderer can be async.
                            setTimeout(() => this.props.vm.renderer.draw());
                        }
                    })
                    .catch(e => {
                        this.props.onError(e);
                    });
            }
        }
        render () {
            const {
                /* eslint-disable no-unused-vars */
                fontsLoaded,
                loadingState,
                locale,
                messages,
                isStarted,
                onError: onErrorProp,
                onLoadedProject: onLoadedProjectProp,
                onSetProjectUnchanged,
                projectData,
                /* eslint-disable no-unused-vars */
                setMenuBarPlayBtnVisible, // 不懂为啥eslint报错
                setVideoPlayerSrc,
                setVideoPlayerTitle,
                /* eslint-enable no-unused-vars */
                isLoadingWithId: isLoadingWithIdProp,
                vm,
                ...componentProps
            } = this.props;
            return (
                <WrappedComponent
                    isLoading={isLoadingWithIdProp}
                    vm={vm}
                    {...componentProps}
                />
            );
        }
    }

    VMManager.propTypes = {
        setMenuBarPlayBtnVisible: PropTypes.func,
        setVideoPlayerSrc: PropTypes.func,
        setVideoPlayerTitle: PropTypes.func,
        onUpdateProjectTitle: PropTypes.func,
        canSave: PropTypes.bool,
        cloudHost: PropTypes.string,
        fontsLoaded: PropTypes.bool,
        isLoadingWithId: PropTypes.bool,
        isPlayerOnly: PropTypes.bool,
        isStarted: PropTypes.bool,
        loadingState: PropTypes.oneOf(LoadingStates),
        locale: PropTypes.string,
        messages: PropTypes.objectOf(PropTypes.string),
        onError: PropTypes.func,
        onLoadedProject: PropTypes.func,
        onSetProjectUnchanged: PropTypes.func,
        projectData: PropTypes.oneOfType([PropTypes.object, PropTypes.string]),
        projectId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        username: PropTypes.string,
        vm: PropTypes.instanceOf(VM).isRequired
    };

    const mapStateToProps = state => {
        const loadingState = state.scratchGui.projectState.loadingState;
        return {
            fontsLoaded: state.scratchGui.fontsLoaded,
            isLoadingWithId: getIsLoadingWithId(loadingState),
            locale: state.locales.locale,
            messages: state.locales.messages,
            projectData: state.scratchGui.projectState.projectData,
            projectId: state.scratchGui.projectState.projectId,
            loadingState: loadingState,
            isPlayerOnly: state.scratchGui.mode.isPlayerOnly,
            isStarted: state.scratchGui.vmStatus.started
        };
    };

    const mapDispatchToProps = dispatch => ({
        setMenuBarPlayBtnVisible: status => dispatch(setMenuBarPlayBtnVisible(status)),
        setVideoPlayerSrc: src => dispatch(setVideoPlayerSrc(src)),
        setVideoPlayerTitle: title => dispatch(setVideoPlayerTitle(title)),
        onError: error => dispatch(projectError(error)),
        onLoadedProject: (loadingState, canSave) =>
            dispatch(onLoadedProject(loadingState, canSave, true)),
        onSetProjectUnchanged: () => dispatch(setProjectUnchanged())
    });

    // Allow incoming props to override redux-provided props. Used to mock in tests.
    const mergeProps = (stateProps, dispatchProps, ownProps) => Object.assign(
        {}, stateProps, dispatchProps, ownProps
    );

    return connect(
        mapStateToProps,
        mapDispatchToProps,
        mergeProps
    )(VMManager);
};

export default vmManagerHOC;
