/*
 * @Author: DWP
 * @Date: 2021-08-12 14:39:19
 * @LastEditors: DWP
 * @LastEditTime: 2021-08-18 15:02:35
 */
import React, { Component } from 'react';
import { Table, Button, Popconfirm, Modal, Form, Input, InputNumber, message } from 'antd';
import { PlusOutlined, DeleteOutlined, EditOutlined } from '@ant-design/icons';
import http from '../../http';
import styles from './index.less';

class AnchorManage extends Component {
  constructor(props) {
    super(props);

    const columns = [
      {
        title: '名称',
        dataIndex: 'name'
      },
      {
        title: '操作',
        dataIndex: 'operation',
        align: 'center',
        render: (text, record) => (this.state.dataSource.length >= 1 ? (
          <div
            className={styles.optBtn}
          >
            <EditOutlined
              title="编辑"
              className={styles.modifyIcon}
              onClick={() => this.toggleVisible(record)}
            />
            <Popconfirm
              title="确认删除?"
              onConfirm={() => this.handleDelete(record.id)}
            >
              <DeleteOutlined title="删除" />
            </Popconfirm>
          </div>
        ) : null)
      }
    ];

    this.state = {
      dataSource: [],
      columns,
      visible: false,
      modalData: {}
    };
  }

  componentDidMount() {
    this.getData();
  }

  // 获取主播数据
  getData = () => {
    http.get('php/cow_anchor.php').then((data) => {
      this.setState({
        dataSource: data
      });
    });
  }

  toggleVisible = (data = {}) => {
    this.setState({
      visible: !this.state.visible,
      modalData: data
    });
  }

  handleDelete = (id) => {
    http.del(`/php/cow_anchor.php?id=${id}`).then(() => {
      message.success('删除成功');
      this.getData();
    });
  }

  handleOk = () => {
    const newData = [...this.state.dataSource];
    this.formRef.validateFields().then((values) => {
      const params = [{ ...values, id: values.id || `${new Date().getTime()}` }];
      // 修改
      if (values.id) {
        http.put('php/cow_anchor.php', {
          ...params
        }).then(() => {
          message.success('修改成功');
          this.toggleVisible();
          this.getData();
        });
      } else {
        // 新增
        http.post('php/cow_anchor.php', {
          ...params
        }).then(() => {
          message.success('新增成功');
          this.toggleVisible();
          this.getData();
        });
      }
    });

    this.setState({
      dataSource: newData
    });
  }

  render() {
    const { dataSource, columns, visible, modalData } = this.state;
    const { height } = document.body.getBoundingClientRect();

    return (
      <div>
        <Button
          type="primary"
          style={{ marginBottom: 16 }}
          onClick={() => this.toggleVisible()}
          icon={<PlusOutlined />}
        >
          新增
        </Button>
        <Table
          rowKey="id"
          columns={columns}
          dataSource={dataSource}
          pagination={false}
          scroll={{ y: height - 146 }}
        />
        <Modal
          visible={visible}
          destroyOnClose
          title={modalData.brand ? '修改' : '新增'}
          onOk={this.handleOk}
          onCancel={() => this.toggleVisible()}
        >
          <Form
            ref={(ref) => { this.formRef = ref; }}
            labelCol={{ span: 6 }}
            wrapperCol={{ span: 16 }}
            initialValues={modalData}
          >
            <Form.Item
              name="id"
              style={{ display: 'none' }}
            >
              <Input disabled />
            </Form.Item>

            <Form.Item
              label="主播名称"
              name="name"
              rules={[{ required: true, message: '请输入主播名称' }]}
            >
              <Input />
            </Form.Item>
          </Form>
        </Modal>
      </div>
    );
  }
}

export default AnchorManage;
