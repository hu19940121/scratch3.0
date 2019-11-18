import PropTypes from 'prop-types';
import React from 'react';
import {connect} from 'react-redux';
import { getQiniuToken } from '../../apis/qiniu'
import { addWork } from '../../apis/work'

import classNames from 'classnames';
import bindAll from 'lodash.bindall';
import {compose} from 'redux';
import {Modal, message, Form, Input, Button as AButton} from 'antd';
import * as qiniu from 'qiniu-js'

const {TextArea} = Input;
import {
    setPublishVisible
} from '../../reducers/login';
import styles from './publish-modal.css';
class PublishModal extends React.Component {
    constructor (props) {
        super(props);
        bindAll(this, [
            'handleClosePublish',
            'handlePublish'
        ]);
        this.state = {
          btnLoading: false
        }
    }
    handleClosePublish () {
      this.props.setPublishVisible(false)
      this.props.form.resetFields()
    }
    /**
     * 
     * @param {*Array} files  文件列表 
     * @param {*String} token  token 
     * @param {*String} url 域名url
     */
    uploadFilesToQiuNiu (files,token, url) {
      return Promise.all(
          files.map((file)=> new Promise((resolve,reject)=>{
            const date = new Date();
            const timestamp = `${date.toLocaleDateString()}-${date.toLocaleTimeString()}`
            // let fileName = this.props.projectTitle + timestamp
            let key
            if (file.type === 'image/jpeg') {
              key = this.props.projectTitle + timestamp //图片
            } else {
              key = this.props.projectTitle + timestamp + '.sb3' //sb3文件
            }
            var config = {
              useCdnDomain: true,
            };
            var putExtra = {
              fname: "",
              params: {},
              mimeType: null
            };
            let  observable = qiniu.upload(file, key, token, putExtra, config)
            var subscription = observable.subscribe({ //开始上传
              next(res){
                // console.log('next',res);
              },
              error(err){
                // console.log('err',err)
                reject(err)
              },
              complete(res){
                const sb3Url = url + '/' + res.key
                resolve(sb3Url)
                // console.log('sb3Url', sb3Url)
                // console.log('complete',res)
              }
            })
        }))
      )
    }
    handlePublish (e) {
      e.preventDefault();
      //未解决问题 保存一次相当于更新一次 相当于重新上传一次文件 也就是更新一次 就上传一次文件
      this.props.form.validateFields((err, values) => {
        if (!err) {
            const { file, poster } = this.props
            this.setState({ btnLoading: true })
            getQiniuToken().then(res=>{ //先获取七牛token
              const token = res.data.token
              const url = res.data.url
              this.uploadFilesToQiuNiu([file,poster],token,url).then(urlList=>{ //得到上传至七牛云的封面url 和文件的url
                const params = {
                  name: this.props.projectTitle,
                  url: urlList[0],
                  poster: urlList[1],
                  introduction: values.workIntroduce,
                  operation: values.workOperation,
                }
                addWork(params).then(result=>{
                  this.setState({ btnLoading: false })
                  message.success('发布成功');
                  this.handleClosePublish()
                })
                console.log('res----------',res);
              }).catch(err=>{
                console.log('err',err);
                this.setState({ btnLoading: false })
              })
            }).catch(()=>{ 
              this.setState({ btnLoading: false })
            })
        }
      });
    }
    componentDidMount () {

    }
    render () {
        const { getFieldDecorator } = this.props.form;
        return (
            <div>
                <Modal
                    title="发布作品"
                    visible={this.props.publishVisible}
                    onCancel={this.handleClosePublish}
                    footer={null}
                >
                    <Form
                        onSubmit={this.handlePublish}
                        className={classNames(styles.PublishForm)}
                    >
                        <Form.Item label="作品名称">
                            {getFieldDecorator('workName', {
                                rules: [{required: true, message: '请输入作品名称!'}],
                                initialValue: this.props.projectTitle
                            })(
                                <Input placeholder="请输入作品名称" />,
                            )}
                        </Form.Item>
                        <Form.Item label="作品简介">
                            {getFieldDecorator('workIntroduce')(
                                <TextArea
                                    rows={4}
                                    placeholder="请输入作品简介"
                                />,
                            )}
                        </Form.Item>
                        <Form.Item label="操作说明">
                            {getFieldDecorator('workOperation')(
                                <TextArea
                                    rows={4}
                                    placeholder="请输入操作说明"
                                />,
                            )}
                        </Form.Item>
                        <Form.Item>
                            <AButton  loading={this.state.btnLoading} onClick={this.handlePublish}>发布</AButton>
                        </Form.Item>
                    </Form>
                </Modal>
            </div>
        );
    }
}

PublishModal.propTypes = {
    publishVisible: PropTypes.bool,
    setPublishVisible: PropTypes.func,
    poster: PropTypes.object,
    file: PropTypes.object
};
PublishModal.defaultProps = {
  poster: null, //封面文件
  file: null//.sb3文件
}
const mapDispatchToProps = dispatch => ({
  setPublishVisible: status => dispatch(setPublishVisible(status))
});
const mapStateToProps = (state, ownProps) => ({
  publishVisible: state.scratchGui.login.publishVisible,
  projectTitle: state.scratchGui.projectTitle || '',
});
const WrappedNormalPublishForm = Form.create({name: 'normal_Publish'})(PublishModal);
export default connect(
  mapStateToProps,
  mapDispatchToProps
)(WrappedNormalPublishForm)
