/* eslint-disable semi */
import { dataURLtoFile } from '../../utils/util';
import classNames from 'classnames';
import {connect} from 'react-redux';
import {compose} from 'redux';
import {defineMessages, FormattedMessage, injectIntl, intlShape} from 'react-intl';
import PropTypes from 'prop-types';
import bindAll from 'lodash.bindall';
import bowser from 'bowser';
import React from 'react';
import {Button as Abutton, Modal} from 'antd';
import store from 'store'; // localstorage封装的库

import VM from 'scratch-vm';

import Box from '../box/box.jsx';
import PublishModal from '../publish-modal/publish-modal.jsx'
import Button from '../button/button.jsx';
import CommunityButton from './community-button.jsx';
import ShareButton from './share-button.jsx';
import {ComingSoonTooltip} from '../coming-soon/coming-soon.jsx';
import Divider from '../divider/divider.jsx';
import LanguageSelector from '../../containers/language-selector.jsx';
import SaveStatus from './save-status.jsx';
import SBFileUploader from '../../containers/sb-file-uploader.jsx';
import ProjectWatcher from '../../containers/project-watcher.jsx';
import MenuBarMenu from './menu-bar-menu.jsx';
import {MenuItem, MenuSection} from '../menu/menu.jsx';
import ProjectTitleInput from './project-title-input.jsx';
import AuthorInfo from './author-info.jsx';
import AccountNav from '../../containers/account-nav.jsx';
import LoginDropdown from './login-dropdown.jsx';
import SB3Downloader from '../../containers/sb3-downloader.jsx';
import DeletionRestorer from '../../containers/deletion-restorer.jsx';
import TurboMode from '../../containers/turbo-mode.jsx';
import MenuBarHOC from '../../containers/menu-bar-hoc.jsx';
import { Form, Icon, Input, Button as AButton, Checkbox } from 'antd';
import axios from 'axios'
import {openTipsLibrary} from '../../reducers/modals';
import {setPlayer} from '../../reducers/mode';
import { login,getUserInfo,logout } from '../../apis/login'
import {
    autoUpdateProject,
    getIsUpdating,
    getIsShowingProject,
    manualUpdateProject,
    requestNewProject,
    remixProject,
    saveProjectAsCopy
} from '../../reducers/project-state';
import {
    setUserInfo,
    setSession,
    setLoginVisible,
    setPublishVisible
} from '../../reducers/login';
import {
    setVideoPlayerVisible
} from '../../reducers/video-player';
import {
    openAccountMenu,
    closeAccountMenu,
    accountMenuOpen,
    openFileMenu,
    closeFileMenu,
    fileMenuOpen,
    openEditMenu,
    closeEditMenu,
    editMenuOpen,
    openLanguageMenu,
    closeLanguageMenu,
    languageMenuOpen,
    openLoginMenu,
    closeLoginMenu,
    loginMenuOpen
} from '../../reducers/menus';

import collectMetadata from '../../lib/collect-metadata';

import styles from './menu-bar.css';

import helpIcon from '../../lib/assets/icon--tutorials.svg';
import mystuffIcon from './icon--mystuff.png';
import playIcon from './play.svg';

// import profileIcon from './icon--profile.png';
import remixIcon from './icon--remix.svg';
import dropdownCaret from './dropdown-caret.svg';
import languageIcon from '../language-selector/language-icon.svg';

// import scratchLogo from './scratch-logo.svg';
import scratchLogo from '../menu-bar/head_logo.png';

import sharedMessages from '../../lib/shared-messages';

const ariaMessages = defineMessages({
    language: {
        id: 'gui.menuBar.LanguageSelector',
        defaultMessage: 'language selector',
        description: 'accessibility text for the language selection menu'
    },
    tutorials: {
        id: 'gui.menuBar.tutorialsLibrary',
        defaultMessage: 'Tutorials',
        description: 'accessibility text for the tutorials button'
    }
});

const MenuBarItemTooltip = ({
    children,
    className,
    enable,
    id,
    place = 'bottom'
}) => {
    if (enable) {
        return (
            <React.Fragment>
                {children}
            </React.Fragment>
        );
    }
    return (
        <ComingSoonTooltip
            className={classNames(styles.comingSoon, className)}
            place={place}
            tooltipClassName={styles.comingSoonTooltip}
            tooltipId={id}
        >
            {children}
        </ComingSoonTooltip>
    );
};


MenuBarItemTooltip.propTypes = {
    children: PropTypes.node,
    className: PropTypes.string,
    enable: PropTypes.bool,
    id: PropTypes.string,
    place: PropTypes.oneOf(['top', 'bottom', 'left', 'right'])
};

const MenuItemTooltip = ({id, isRtl, children, className}) => (
    <ComingSoonTooltip
        className={classNames(styles.comingSoon, className)}
        isRtl={isRtl}
        place={isRtl ? 'left' : 'right'}
        tooltipClassName={styles.comingSoonTooltip}
        tooltipId={id}
    >
        {children}
    </ComingSoonTooltip>
);

MenuItemTooltip.propTypes = {
    children: PropTypes.node,
    className: PropTypes.string,
    id: PropTypes.string,
    isRtl: PropTypes.bool
};

class MenuBar extends React.Component {
    constructor (props) {
        super(props);
        bindAll(this, [
            'handleClickNew',
            'handleClickRemix',
            'handleClickSave',
            'handleClickSaveAsCopy',
            'handleClickSeeCommunity',
            'handleClickShare',
            'handleKeyPress',
            'handleLanguageMouseUp',
            'handleRestoreOption',
            'getSaveToComputerHandler',
            'restoreOptionMessage',
            'handleOpenLogin',
            'handleCloseLogin',
            'handleSubmit',
            'handleLogOut',
            'handlePublishWork'
        ]);
        this.state = {
            poster: null,
            file: null
        }
    }
    componentDidMount () {
        document.addEventListener('keydown', this.handleKeyPress);
        this.getUserInfo()
    }
    componentWillUnmount () {
        document.removeEventListener('keydown', this.handleKeyPress);
    }
    handleClickNew () {
        // if the project is dirty, and user owns the project, we will autosave.
        // but if they are not logged in and can't save, user should consider
        // downloading or logging in first.
        // Note that if user is logged in and editing someone else's project,
        // they'll lose their work.
        const readyToReplaceProject = this.props.confirmReadyToReplaceProject(
            this.props.intl.formatMessage(sharedMessages.replaceProjectWarning)
        );
        this.props.onRequestCloseFile();
        if (readyToReplaceProject) {
            this.props.onClickNew(this.props.canSave && this.props.canCreateNew);
        }
        this.props.onRequestCloseFile();
    }
    handleClickRemix () {
        this.props.onClickRemix();
        this.props.onRequestCloseFile();
    }
    handleClickSave () {
        this.props.onClickSave();
        this.props.onRequestCloseFile();
    }
    handleClickSaveAsCopy () {
        this.props.onClickSaveAsCopy();
        this.props.onRequestCloseFile();
    }
    handleClickSeeCommunity (waitForUpdate) {
        if (this.props.shouldSaveBeforeTransition()) {
            this.props.autoUpdateProject(); // save before transitioning to project page
            waitForUpdate(true); // queue the transition to project page
        } else {
            waitForUpdate(false); // immediately transition to project page
        }
    }
    handleClickShare (waitForUpdate) {
        if (!this.props.isShared) {
            if (this.props.canShare) { // save before transitioning to project page
                this.props.onShare();
            }
            if (this.props.canSave) { // save before transitioning to project page
                this.props.autoUpdateProject();
                waitForUpdate(true); // queue the transition to project page
            } else {
                waitForUpdate(false); // immediately transition to project page
            }
        }
    }
    handleRestoreOption (restoreFun) {
        return () => {
            restoreFun();
            this.props.onRequestCloseEdit();
        };
    }
    handleKeyPress (event) {
        const modifier = bowser.mac ? event.metaKey : event.ctrlKey;
        if (modifier && event.key === 's') {
            this.props.onClickSave();
            event.preventDefault();
        }
    }
    getSaveToComputerHandler (downloadProjectCallback) {
        return () => {
            this.props.onRequestCloseFile();
            downloadProjectCallback();
            if (this.props.onProjectTelemetryEvent) {
                const metadata = collectMetadata(this.props.vm, this.props.projectTitle, this.props.locale);
                this.props.onProjectTelemetryEvent('projectDidSave', metadata);
            }
        };
    }
    handleLanguageMouseUp (e) {
        if (!this.props.languageMenuOpen) {
            this.props.onClickLanguage(e);
        }
    }
    restoreOptionMessage (deletedItem) {
        switch (deletedItem) {
        case 'Sprite':
            return (<FormattedMessage
                defaultMessage="Restore Sprite"
                description="Menu bar item for restoring the last deleted sprite."
                id="gui.menuBar.restoreSprite"
            />);
        case 'Sound':
            return (<FormattedMessage
                defaultMessage="Restore Sound"
                description="Menu bar item for restoring the last deleted sound."
                id="gui.menuBar.restoreSound"
            />);
        case 'Costume':
            return (<FormattedMessage
                defaultMessage="Restore Costume"
                description="Menu bar item for restoring the last deleted costume."
                id="gui.menuBar.restoreCostume"
            />);
        default: {
            return (<FormattedMessage
                defaultMessage="Restore"
                description="Menu bar item for restoring the last deleted item in its disabled state." /* eslint-disable-line max-len */
                id="gui.menuBar.restore"
            />);
        }
        }
    }
    handleOpenLogin () {
        this.props.setLoginVisible(true);
    }
    handleCloseLogin () {
        this.props.setLoginVisible(false);
        this.props.form.resetFields()
    }
    getUserInfo () {
        if (store.get('token')) {// 如果有token 去获取信息
            this.props.setSession(store.get('token'))
            getUserInfo().then(res=>{ 
                this.props.setUserInfo(res.data)
            })
        } else {
            this.clearAuth()
        }
    }
    handleSubmit (e) {
        e.preventDefault();
        this.props.form.validateFields((err, values) => {
            if (!err) {
                // console.log('Received values of form: ', values);
                login({phone: values.username, password: values.password}).then(response => {
                    store.set('token',response.data)
                    this.props.setSession(response.data)
                    this.props.setLoginVisible(false)
                    setTimeout(() => {
                        this.getUserInfo()
                    }, 100)
                    
                    // console.log(response)
                }).catch( error => {
                    console.log(error)
                })
            }
        });
    }
    clearAuth() {
        store.remove('token')
        this.props.setSession(null)
        this.props.setUserInfo(null)    
    }
    handleLogOut () {        
        logout().then(()=>{
            this.clearAuth()
        })
    }
    handlePublishWork() {        
        this.props.saveProjectSb3().then(content => {
            console.log('content', content);
            const sb3File = new File([content],'sdfsdf')
            console.log('sb3file', sb3File);
            //获取图片
            this.props.vm.runtime.renderer.draw();
            const canvas = document.getElementsByTagName('canvas')[0];
            const imageDataUrl = canvas.toDataURL('image/png')
            const fileImage = dataURLtoFile(imageDataUrl)
            console.log('fileImage',fileImage)
            this.setState({
                poster: fileImage,
                file: sb3File
            })
            this.props.setPublishVisible(true)
        });
        console.log('fabu zuopin');
        
    }
    render () {
        const { getFieldDecorator } = this.props.form;
        const saveNowMessage = (
            <FormattedMessage
                defaultMessage="Save now"
                description="Menu bar item for saving now"
                id="gui.menuBar.saveNow"
            />
        );
        const createCopyMessage = (
            <FormattedMessage
                defaultMessage="Save as a copy"
                description="Menu bar item for saving as a copy"
                id="gui.menuBar.saveAsCopy"
            />
        );
        const remixMessage = (
            <FormattedMessage
                defaultMessage="Remix"
                description="Menu bar item for remixing"
                id="gui.menuBar.remix"
            />
        );
        const newProjectMessage = (
            <FormattedMessage
                defaultMessage="New"
                description="Menu bar item for creating a new project"
                id="gui.menuBar.new"
            />
        );
        const remixButton = (
            <Button
                className={classNames(
                    styles.menuBarButton,
                    styles.remixButton
                )}
                iconClassName={styles.remixButtonIcon}
                iconSrc={remixIcon}
                onClick={this.handleClickRemix}
            >
                {remixMessage}
            </Button>
        );
        return (
            <Box
                className={classNames(
                    this.props.className,
                    styles.menuBar
                )}
            >   <PublishModal poster={this.state.poster} file={this.state.file} />
                <Modal
                    title="登录"
                    visible={this.props.loginVisible}
                    onCancel={this.handleCloseLogin}
                    footer={null}
                >
                    <Form onSubmit={this.handleSubmit} className={classNames(styles.loginForm)}>
                        <Form.Item>
                            {getFieldDecorator('username', {
                                rules: [{ required: true, message: '请输入用户名!' }],
                            })(
                                <Input
                                prefix={<Icon type="user" style={{ color: 'rgba(0,0,0,.25)' }} />}
                                placeholder="Username"
                                />,
                            )}
                        </Form.Item>
                        <Form.Item>
                            {getFieldDecorator('password', {
                                rules: [{ required: true, message: '请输入密码!' }],
                            })(
                                <Input
                                prefix={<Icon type="lock" style={{ color: 'rgba(0,0,0,.25)' }} />}
                                type="password"
                                placeholder="Password"
                                />,
                            )}
                        </Form.Item>
                        <Form.Item>
                            {getFieldDecorator('remember', {
                                valuePropName: 'checked',
                                initialValue: true,
                            })(<Checkbox>记住我</Checkbox>)}
                            <a className={classNames(styles.loginFormForgot)} href="">
                                忘记密码
                            </a>
                            <AButton type="primary" htmlType="submit" className={classNames(styles.loginFormButton)}>
                                登录
                            </AButton>
                            Or <a href="">注册!</a>
                        </Form.Item>
                    </Form>
                </Modal>
                <div className={styles.mainMenu}>
                    <div className={styles.fileGroup}>
                        <div className={classNames(styles.menuBarItem)}>
                            <img
                                alt="Scratch"
                                className={classNames(styles.scratchLogo, {
                                    [styles.clickable]: typeof this.props.onClickLogo !== 'undefined'
                                })}
                                draggable={false}
                                src={this.props.logo}
                                onClick={this.props.onClickLogo}
                            />
                        </div>
                        {(this.props.canChangeLanguage) && (<div
                            className={classNames(styles.menuBarItem, styles.hoverable, styles.languageMenu)}
                        >
                            <div>
                                <img
                                    className={styles.languageIcon}
                                    src={languageIcon}
                                />
                                <img
                                    className={styles.languageCaret}
                                    src={dropdownCaret}
                                />
                            </div>
                            <LanguageSelector label={this.props.intl.formatMessage(ariaMessages.language)} />
                        </div>)}
                        {(this.props.canManageFiles) && (
                            <div
                                className={classNames(styles.menuBarItem, styles.hoverable, {
                                    [styles.active]: this.props.fileMenuOpen
                                })}
                                onMouseUp={this.props.onClickFile}
                            >
                                <FormattedMessage
                                    defaultMessage="File"
                                    description="Text for file dropdown menu"
                                    id="gui.menuBar.file"
                                />
                                <MenuBarMenu
                                    className={classNames(styles.menuBarMenu)}
                                    open={this.props.fileMenuOpen}
                                    place={this.props.isRtl ? 'left' : 'right'}
                                    onRequestClose={this.props.onRequestCloseFile}
                                >
                                    <MenuSection>
                                        <MenuItem
                                            isRtl={this.props.isRtl}
                                            onClick={this.handleClickNew}
                                        >
                                            {newProjectMessage}
                                        </MenuItem>
                                    </MenuSection>
                                    {(this.props.canSave || this.props.canCreateCopy || this.props.canRemix) && (
                                        <MenuSection>
                                            {this.props.canSave && (
                                                <MenuItem onClick={this.handleClickSave}>
                                                    {saveNowMessage}
                                                </MenuItem>
                                            )}
                                            {this.props.canCreateCopy && (
                                                <MenuItem onClick={this.handleClickSaveAsCopy}>
                                                    {createCopyMessage}
                                                </MenuItem>
                                            )}
                                            {this.props.canRemix && (
                                                <MenuItem onClick={this.handleClickRemix}>
                                                    {remixMessage}
                                                </MenuItem>
                                            )}
                                        </MenuSection>
                                    )}
                                    <MenuSection>
                                        <SBFileUploader
                                            canSave={this.props.canSave}
                                            userOwnsProject={this.props.userOwnsProject}
                                            onUpdateProjectTitle={this.props.onUpdateProjectTitle}
                                        >
                                            {(className, renderFileInput, handleLoadProject) => (
                                                <MenuItem
                                                    className={className}
                                                    onClick={handleLoadProject}
                                                >
                                                    {/* eslint-disable max-len */}
                                                    {this.props.intl.formatMessage(sharedMessages.loadFromComputerTitle)}
                                                    {/* eslint-enable max-len */}
                                                    {renderFileInput()}
                                                </MenuItem>
                                            )}
                                        </SBFileUploader>
                                        <SB3Downloader>{(className, downloadProjectCallback) => (
                                            <MenuItem
                                                className={className}
                                                onClick={this.getSaveToComputerHandler(downloadProjectCallback)}
                                            >
                                                <FormattedMessage
                                                    defaultMessage="Save to your computer"
                                                    description="Menu bar item for downloading a project to your computer" // eslint-disable-line max-len
                                                    id="gui.menuBar.downloadToComputer"
                                                />
                                            </MenuItem>
                                        )}</SB3Downloader>
                                    </MenuSection>
                                </MenuBarMenu>
                            </div>
                        )}
                        <div
                            className={classNames(styles.menuBarItem, styles.hoverable, {
                                [styles.active]: this.props.editMenuOpen
                            })}
                            onMouseUp={this.props.onClickEdit}
                        >
                            <div className={classNames(styles.editMenu)}>
                                <FormattedMessage
                                    defaultMessage="Edit"
                                    description="Text for edit dropdown menu"
                                    id="gui.menuBar.edit"
                                />
                            </div>
                            <MenuBarMenu
                                className={classNames(styles.menuBarMenu)}
                                open={this.props.editMenuOpen}
                                place={this.props.isRtl ? 'left' : 'right'}
                                onRequestClose={this.props.onRequestCloseEdit}
                            >
                                <DeletionRestorer>{(handleRestore, {restorable, deletedItem}) => (
                                    <MenuItem
                                        className={classNames({[styles.disabled]: !restorable})}
                                        onClick={this.handleRestoreOption(handleRestore)}
                                    >
                                        {this.restoreOptionMessage(deletedItem)}
                                    </MenuItem>
                                )}</DeletionRestorer>
                                <MenuSection>
                                    <TurboMode>{(toggleTurboMode, {turboMode}) => (
                                        <MenuItem onClick={toggleTurboMode}>
                                            {turboMode ? (
                                                <FormattedMessage
                                                    defaultMessage="Turn off Turbo Mode"
                                                    description="Menu bar item for turning off turbo mode"
                                                    id="gui.menuBar.turboModeOff"
                                                />
                                            ) : (
                                                <FormattedMessage
                                                    defaultMessage="Turn on Turbo Mode"
                                                    description="Menu bar item for turning on turbo mode"
                                                    id="gui.menuBar.turboModeOn"
                                                />
                                            )}
                                        </MenuItem>
                                    )}</TurboMode>
                                </MenuSection>
                            </MenuBarMenu>
                        </div>
                    </div>
                    <Divider className={classNames(styles.divider)} />
                    <div
                        aria-label={this.props.intl.formatMessage(ariaMessages.tutorials)}
                        className={classNames(styles.menuBarItem, styles.hoverable)}
                        onClick={this.props.onOpenTipLibrary}
                    >
                        <img
                            className={styles.helpIcon}
                            src={helpIcon}
                        />
                        <FormattedMessage {...ariaMessages.tutorials} />
                    </div>
                    <Divider className={classNames(styles.divider)} />
                    {this.props.canEditTitle ? (
                        <div className={classNames(styles.menuBarItem, styles.growable)}>
                            <MenuBarItemTooltip
                                enable
                                id="title-field"
                            >
                                <ProjectTitleInput
                                    className={classNames(styles.titleFieldGrowable)}
                                    onUpdateProjectTitle={this.props.onUpdateProjectTitle}
                                />
                            </MenuBarItemTooltip>
                        </div>
                    ) : ((this.props.authorUsername && this.props.authorUsername !== this.props.username) ? (
                        <AuthorInfo
                            className={styles.authorInfo}
                            imageUrl={this.props.authorThumbnailUrl}
                            projectTitle={this.props.projectTitle}
                            userId={this.props.authorId}
                            username={this.props.authorUsername}
                        />
                    ) : null)}
                    <div className={classNames(styles.menuBarItem)}>
                        {this.props.canShare ? ( //如果能去分享
                            (this.props.isShowingProject || this.props.isUpdating) && (
                                <ProjectWatcher onDoneUpdating={this.props.onSeeCommunity}>
                                    {
                                        waitForUpdate => (
                                            <ShareButton
                                                className={styles.menuBarButton}
                                                isShared={this.props.isShared}
                                                /* eslint-disable react/jsx-no-bind */
                                                onClick={() => {
                                                    this.handleClickShare(waitForUpdate);
                                                }}
                                                /* eslint-enable react/jsx-no-bind */
                                            />
                                        )
                                    }
                                </ProjectWatcher>
                            )
                        ) : (
                            this.props.showComingSoon ? ( // 默认设置为了false
                                <MenuBarItemTooltip id="share-button">
                                    <ShareButton  className={styles.menuBarButton} />
                                </MenuBarItemTooltip>
                            ) : []
                        )}
                        {this.props.canRemix ? remixButton : []}
                    </div>
                    { this.props.sessionExists ?
                        ( <div className={classNames(styles.menuBarItem)}>
                            <AButton onClick={this.handlePublishWork} type="danger">发布</AButton>
                        </div>) : ''
                    }

                    <div className={classNames(styles.menuBarItem, styles.communityButtonWrapper)}>
                        {this.props.enableCommunity ? (
                            (this.props.isShowingProject || this.props.isUpdating) && (
                                <ProjectWatcher onDoneUpdating={this.props.onSeeCommunity}>
                                    {
                                        waitForUpdate => (
                                            <CommunityButton
                                                className={styles.menuBarButton}
                                                /* eslint-disable react/jsx-no-bind */
                                                onClick={() => {
                                                    this.handleClickSeeCommunity(waitForUpdate);
                                                }}
                                                /* eslint-enable react/jsx-no-bind */
                                            />
                                        )
                                    }
                                </ProjectWatcher>
                            )
                        ) : (this.props.showComingSoon ? (
                            <MenuBarItemTooltip id="community-button">
                                <CommunityButton className={styles.menuBarButton} />
                            </MenuBarItemTooltip>
                        ) : [])}
                    </div>
                </div>

                {/* show the proper UI in the account menu, given whether the user is
                logged in, and whether a session is available to log in with */}
                <div className={styles.accountInfoGroup}>
                    <div className={styles.menuBarItem}>
                        {this.props.canSave && (
                            <SaveStatus />
                        )}
                            { this.props.menuBarPlayBtnVisible && (<div //menuBarPlayBtnVisible 为true就显示
                                className={classNames(
                                    styles.menuBarItem,
                                    styles.hoverable,
                                    styles.mystuffButton
                                )}
                            >
                                <img
                                    onClick={()=>{this.props.setVideoPlayerVisible(true)}}
                                    className={styles.playIcon}
                                    src={playIcon}
                                />
                            </div>)}
                    </div>
                    {this.props.sessionExists ? (
                        this.props.username ? (
                            // ************ user is logged in ************
                            <React.Fragment>
                                <a href="/mystuff/">
                                    <div
                                        className={classNames(
                                            styles.menuBarItem,
                                            styles.hoverable,
                                            styles.mystuffButton
                                        )}
                                    >
                                        <img
                                            className={styles.mystuffIcon}
                                            src={mystuffIcon}
                                        />
                                    </div>
                                </a>
                                {/* {this.props.username} */}
                                <AccountNav
                                    className={classNames(
                                        styles.menuBarItem,
                                        styles.hoverable,
                                        {[styles.active]: this.props.accountMenuOpen}
                                    )}
                                    isOpen={this.props.accountMenuOpen}
                                    isRtl={this.props.isRtl}
                                    menuBarMenuClassName={classNames(styles.menuBarMenu)}
                                    onClick={this.props.onClickAccount}
                                    onClose={this.props.onRequestCloseAccount}
                                    // onLogOut={this.props.onLogOut}
                                    onLogOut={this.handleLogOut}
                                />
                            </React.Fragment>
                        ) : (
                            // ********* user not logged in, but a session exists
                            // ********* so they can choose to log in
                            <React.Fragment>
                                {/* <div
                                    className={classNames(
                                        styles.menuBarItem,
                                        styles.hoverable
                                    )}
                                    key="join"
                                    onMouseUp={this.props.onOpenRegistration}
                                >
                                    <FormattedMessage
                                        defaultMessage="Join Scratch"
                                        description="Link for creating a Scratch account"
                                        id="gui.menuBar.joinScratch"
                                    />
                                </div> */}
                                <Abutton 
                                    onClick={this.handleOpenLogin}
                                    type="primary"
                                >
                                    {'登录'}
                                </Abutton>
                                {/* <div
                                    className={classNames(
                                        styles.menuBarItem,
                                        styles.hoverable
                                    )}
                                    key="login"
                                    onMouseUp={this.props.onClickLogin}
                                >
                                    <FormattedMessage
                                        defaultMessage="Sign in"
                                        description="Link for signing in to your Scratch account"
                                        id="gui.menuBar.signIn"
                                    />
                                    <LoginDropdown
                                        className={classNames(styles.menuBarMenu)}
                                        isOpen={this.props.loginMenuOpen}
                                        isRtl={this.props.isRtl}
                                        renderLogin={this.props.renderLogin}
                                        onClose={this.props.onRequestCloseLogin}
                                    />
                                </div> */}
                            </React.Fragment>
                        )
                    ) : (
                        // ******** no login session is available, so don't show login stuff
                        // 未登录
                        <React.Fragment>
                                <React.Fragment>
                                    <MenuBarItemTooltip
                                            enable
                                            id="account-nav"
                                            place={this.props.isRtl ? 'right' : 'left'}
                                        >
                                            <div
                                                className={classNames(
                                                    styles.menuBarItem,
                                                    styles.hoverable,
                                                    styles.accountNavMenu
                                                )}
                                            >
                                                <Abutton 
                                                    onClick={this.handleOpenLogin}
                                                    type="primary"
                                                >
                                                    {'登录'}
                                                </Abutton>
                                            </div>
                                    </MenuBarItemTooltip>
                                </React.Fragment>
                            {this.props.showComingSoon ? (
                                <React.Fragment>
                                    {/* 文件夹图标 */}
                                    {/* <MenuBarItemTooltip id="mystuff">
                                        <div
                                            className={classNames(
                                                styles.menuBarItem,
                                                styles.hoverable,
                                                styles.mystuffButton
                                            )}
                                        >
                                            <img
                                                className={styles.mystuffIcon}
                                                src={mystuffIcon}
                                            />
                                        </div>
                                    </MenuBarItemTooltip> */}
                                    <MenuBarItemTooltip
                                        enable
                                        id="account-nav"
                                        place={this.props.isRtl ? 'right' : 'left'}
                                    >
                                        <div
                                            className={classNames(
                                                styles.menuBarItem,
                                                styles.hoverable,
                                                styles.accountNavMenu
                                            )}
                                        >
                                            {/* <img
                                                className={styles.profileIcon}
                                                src={profileIcon}
                                            /> */}
                                            <Abutton 
                                                onClick={this.handleOpenLogin}
                                                type="primary"
                                            >
                                                {'登录'}
                                            </Abutton>
                                            {/* <img
                                                className={styles.dropdownCaretIcon}
                                                src={dropdownCaret}
                                            /> */}
                                        </div>
                                    </MenuBarItemTooltip>
                                </React.Fragment>
                            ) : []}
                        </React.Fragment>
                    )}
                </div>
            </Box>
        );
    }
}

MenuBar.propTypes = {
    setVideoPlayerVisible: PropTypes.func,
    loginVisible: PropTypes.bool,
    setPublishVisible: PropTypes.func,
    setLoginVisible: PropTypes.func,
    accountMenuOpen: PropTypes.bool,
    authorId: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]),
    authorThumbnailUrl: PropTypes.string,
    authorUsername: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]),
    autoUpdateProject: PropTypes.func,
    canChangeLanguage: PropTypes.bool,
    canCreateCopy: PropTypes.bool,
    canCreateNew: PropTypes.bool,
    canEditTitle: PropTypes.bool,
    canManageFiles: PropTypes.bool,
    canRemix: PropTypes.bool,
    canSave: PropTypes.bool,
    canShare: PropTypes.bool,
    className: PropTypes.string,
    confirmReadyToReplaceProject: PropTypes.func,
    editMenuOpen: PropTypes.bool,
    enableCommunity: PropTypes.bool,
    fileMenuOpen: PropTypes.bool,
    intl: intlShape,
    isRtl: PropTypes.bool,
    isShared: PropTypes.bool,
    isShowingProject: PropTypes.bool,
    isUpdating: PropTypes.bool,
    languageMenuOpen: PropTypes.bool,
    locale: PropTypes.string.isRequired,
    loginMenuOpen: PropTypes.bool,
    logo: PropTypes.string,
    onClickAccount: PropTypes.func,
    onClickEdit: PropTypes.func,
    onClickFile: PropTypes.func,
    onClickLanguage: PropTypes.func,
    onClickLogin: PropTypes.func,
    onClickLogo: PropTypes.func,
    onClickNew: PropTypes.func,
    onClickRemix: PropTypes.func,
    onClickSave: PropTypes.func,
    onClickSaveAsCopy: PropTypes.func,
    onLogOut: PropTypes.func,
    onOpenRegistration: PropTypes.func,
    onOpenTipLibrary: PropTypes.func,
    onProjectTelemetryEvent: PropTypes.func,
    onRequestCloseAccount: PropTypes.func,
    onRequestCloseEdit: PropTypes.func,
    onRequestCloseFile: PropTypes.func,
    onRequestCloseLanguage: PropTypes.func,
    onRequestCloseLogin: PropTypes.func,
    onSeeCommunity: PropTypes.func,
    onShare: PropTypes.func,
    onToggleLoginOpen: PropTypes.func,
    onUpdateProjectTitle: PropTypes.func,
    projectTitle: PropTypes.string,
    renderLogin: PropTypes.func,
    sessionExists: PropTypes.bool,
    shouldSaveBeforeTransition: PropTypes.func,
    showComingSoon: PropTypes.bool, //用来控制是否显示 即将开发玩的功能
    userOwnsProject: PropTypes.bool,
    username: PropTypes.string,
    vm: PropTypes.instanceOf(VM).isRequired
};

MenuBar.defaultProps = {
    logo: scratchLogo,
    onShare: () => {}
};

const mapStateToProps = (state, ownProps) => {
    console.log('state',state);
    
    const loadingState = state.scratchGui.projectState.loadingState;
    // const user = state.session && state.session.session && state.session.session.user;
    const user = state.scratchGui.login && state.scratchGui.login.userInfo
    // eslint-disable-next-line no-console
    // console.log('state', state);
    // console.log('user', user);

    return {
        menuBarPlayBtnVisible: state.scratchGui.videoPlayer.menuBarPlayBtnVisible,
        loginVisible: state.scratchGui.login.loginVisible,
        accountMenuOpen: accountMenuOpen(state),
        fileMenuOpen: fileMenuOpen(state),
        editMenuOpen: editMenuOpen(state),
        isRtl: state.locales.isRtl,
        isUpdating: getIsUpdating(loadingState),
        isShowingProject: getIsShowingProject(loadingState),
        languageMenuOpen: languageMenuOpen(state),
        locale: state.locales.locale,
        loginMenuOpen: loginMenuOpen(state),
        projectTitle: state.scratchGui.projectTitle,
        // sessionExists: state.session && typeof state.session.session !== 'undefined',
        // sessionExists: state.session && typeof state.session.session !== 'undefined',
        sessionExists: !!state.scratchGui.login.session,
        // username: user ? user.username : null,
        username: user ? user.nickName : null,
        userOwnsProject: ownProps.authorUsername && user &&
            (ownProps.authorUsername === user.username),
        vm: state.scratchGui.vm,

        saveProjectSb3: state.scratchGui.vm.saveProjectSb3.bind(state.scratchGui.vm),
        // projectFilename: getProjectFilename(state.scratchGui.projectTitle, projectTitleInitialState)
    };
};

const mapDispatchToProps = dispatch => ({
    setVideoPlayerVisible: status => dispatch(setVideoPlayerVisible(status)),
    setPublishVisible: status => dispatch(setPublishVisible(status)),
    setUserInfo: userInfo => dispatch(setUserInfo(userInfo)),
    setLoginVisible: status => dispatch(setLoginVisible(status)),
    setSession: session => dispatch(setSession(session)),
    autoUpdateProject: () => dispatch(autoUpdateProject()),
    onOpenTipLibrary: () => dispatch(openTipsLibrary()),
    onClickAccount: () => dispatch(openAccountMenu()),
    onRequestCloseAccount: () => dispatch(closeAccountMenu()),
    onClickFile: () => dispatch(openFileMenu()),
    onRequestCloseFile: () => dispatch(closeFileMenu()),
    onClickEdit: () => dispatch(openEditMenu()),
    onRequestCloseEdit: () => dispatch(closeEditMenu()),
    onClickLanguage: () => dispatch(openLanguageMenu()),
    onRequestCloseLanguage: () => dispatch(closeLanguageMenu()),
    onClickLogin: () => dispatch(openLoginMenu()),
    onRequestCloseLogin: () => dispatch(closeLoginMenu()),
    onClickNew: needSave => dispatch(requestNewProject(needSave)),
    onClickRemix: () => dispatch(remixProject()),
    onClickSave: () => dispatch(manualUpdateProject()),
    onClickSaveAsCopy: () => dispatch(saveProjectAsCopy()),
    onSeeCommunity: () => dispatch(setPlayer(true))
});
const WrappedNormalLoginForm = Form.create({name: 'normal_login'})(MenuBar);
export default compose(
    injectIntl,
    MenuBarHOC,
    connect(
        mapStateToProps,
        mapDispatchToProps
    )
)(WrappedNormalLoginForm);
// export default compose(
//     injectIntl,
//     MenuBarHOC,
//     connect(
//         mapStateToProps,
//         mapDispatchToProps
//     )
// )(MenuBar);