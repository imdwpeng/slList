/*
 * @Author: DWP
 * @Date: 2021-08-11 13:42:00
 * @LastEditors: DWP
 * @LastEditTime: 2021-08-24 22:01:18
 */
import React, { Component } from 'react';
import {
  Form,
  Row,
  Col,
  Input,
  Select,
  DatePicker,
  Button,
  Popconfirm,
  Modal,
  InputNumber,
  Table,
  Upload,
  message
} from 'antd';
import { DeleteOutlined, EditOutlined, PlusOutlined, UploadOutlined } from '@ant-design/icons';
import moment from 'moment';
import * as XLSX from 'xlsx';
import http from '../../http';
import styles from './index.less';

const { Option } = Select;
const { TextArea } = Input;
const { WeekPicker, MonthPicker } = DatePicker;

function formatDate(numb, format = '-') {
  if (typeof numb === 'number') {
    const time = new Date((numb - 1) * 24 * 3600000 + 1);
    time.setYear(time.getFullYear() - 70);
    const year = `${time.getFullYear()}`;
    const month = `${time.getMonth() + 1}`;
    const date = `${time.getDate() - 1}`;
    if (format && format.length === 1) {
      return year + format + month + format + date;
    }
    return year + (month < 10 ? `0${month}` : month) + (date < 10 ? `0${date}` : date);
  } else {
    return numb;
  }
}

class DataManagement extends Component {
  constructor(props) {
    super(props);

    const columns = [
      {
        title: '日期',
        dataIndex: 'date'
      },
      {
        title: '品牌',
        dataIndex: 'brandName'
      },
      {
        title: '销售件数',
        dataIndex: 'saleCount'
      },
      {
        title: '销售额',
        dataIndex: 'sales'
      },
      {
        title: '主播',
        dataIndex: 'anchorName'
      },
      {
        title: '产品',
        dataIndex: 'production'
      },
      {
        title: '备注',
        dataIndex: 'memo'
      },
      {
        title: '操作',
        dataIndex: 'operation',
        align: 'center',
        render: (text, record) => (this.state.dataSource.length >= 1 ? (
          <div className={styles.optBtn}>
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
      brands: [],
      anchors: [],
      columns,
      dataSource: [],
      visible: false,
      modalData: {}
    };
  }

  componentDidMount() {
    this.init();
  }

  init = () => {
    const parmas = [];

    parmas.push(new Promise((resolve) => {
      http.get('php/cow_anchor.php').then((data) => {
        resolve(data);
      });
    }));

    parmas.push(new Promise((resolve) => {
      http.get('php/cow_brand.php').then((data) => {
        console.log(data);
        resolve(data);
      });
    }));

    Promise.all(parmas).then((res) => {
      const [anchors, brands] = res;
      this.setState({
        anchors,
        brands
      }, () => {
        this.getData();
      });
    });
  }

  // 获取数据
  getData = (params) => {
    const obj = {};

    if (!params) {
      obj.date = [
        moment().weekday(0).format('YYYY-MM-DD'),
        moment().weekday(6).format('YYYY-MM-DD')
      ];
    } else {
      obj.brand = params.brand;
      obj.date = params.date;
      obj.anchor = params.anchor;
    }

    http.get('php/cow_data.php', {
      ...obj,
      abandon: 0
    }).then((data) => {
      const { brands, anchors } = this.state;

      const dataSource = data.map((item) => {
        const [{ name: brandName } = {}] = brands.filter((o) => o.id === item.brand);
        const [{ name: anchorName } = {}] = anchors.filter((o) => o.id === item.anchor);
        return {
          ...item,
          brandName,
          anchorName
        };
      });

      dataSource.sort((a, b) => moment(b.date) - moment(a.date));

      this.setState({
        dataSource
      });
    });
  }

  hanldeSearch = () => {
    this.formRef.validateFields().then((values) => {
      const { dateType, date } = values;
      const range = dateType === 'month'
        ? [
          moment(date).startOf('month').format('YYYY-MM-DD'),
          moment(date).endOf('month').format('YYYY-MM-DD')
        ] : [
          moment(date).weekday(1).format('YYYY-MM-DD'),
          moment(date).weekday(7).format('YYYY-MM-DD')
        ];

      this.getData({
        date: range,
        brand: values.brand,
        anchor: values.anchor
      });
    });
  };

  toggleVisible = (record = {}) => {
    this.setState({
      visible: !this.state.visible,
      modalData: record
    });
  }

  handleOk = () => {
    this.formEditRef.validateFields().then((values) => {
      const { brandName, ...otherParams } = values;
      const params = [{
        ...otherParams,
        id: values.id || `${new Date().getTime()}`,
        date: moment(values.date).format('YYYY-MM-DD')
      }];

      // 修改
      if (values.id) {
        http.put('php/cow_data.php', {
          ...params
        }).then(() => {
          message.success('修改成功');
          this.toggleVisible();
          this.hanldeSearch();
        });
      } else {
        // 新增
        http.get('php/cow_data.php', {
          brand: values.brand,
          date: moment(values.date).format('YYYY-MM-DD')
        }, true).then((res) => {
          if (res.length !== 0) return message.warning('已存在相同日期相同品牌的数据，请检查');
          http.post('php/cow_data.php', {
            ...params
          }).then(() => {
            message.success('新增成功');
            this.toggleVisible();
            this.hanldeSearch();
          });
        });
      }
    });
  }

  handleDelete = (id) => {
    http.del(`/php/cow_data.php?id=${id}`).then(() => {
      message.success('删除成功');
      this.hanldeSearch();
    });
  }

  onImportExcel = (file) => {
    const { dataSource } = this.state;
    // 获取上传的文件对象
    const { files } = file.target;
    // 通过FileReader对象读取文件
    const fileReader = new FileReader();
    fileReader.onload = (event) => {
      try {
        const { result } = event.target;
        // 以二进制流方式读取得到整份excel表格对象
        const workbook = XLSX.read(result, { type: 'binary' });
        let data = []; // 存储获取到的数据
        // 遍历每张工作表进行读取（这里默认只读取第一张表）
        for (const sheet in workbook.Sheets) {
          if (workbook.Sheets.hasOwnProperty(sheet)) {
            // 利用 sheet_to_json 方法将 excel 转成 json 数据
            data = data.concat(XLSX.utils.sheet_to_json(workbook.Sheets[sheet]));
            break; // 如果只取第一张表，就取消注释这行
          }
        }

        const newData = [];
        data.forEach((item, i) => {
          if (item['直播时间']) {
            newData.push({
              brand: item['品牌名'],
              date: formatDate(item['直播时间']),
              sales: item['销售额'],
              id: `${i + 1}`,
              anchor: item['主播'] === '哦王小明' ? '王小明' : item['主播'] === '杨宛w' ? '杨宛' : item['主播'],
              memo: item['备注'],
              production: item['直播产品'],
              saleCount: item['销售件数']
            });
          }
        });

        http.post('php/cow_data.php', {
          ...newData
        }).then(() => {
          message.success('新增成功');
          this.toggleVisible();
          this.hanldeSearch();
        });
      } catch (e) {
        // 这里可以抛出文件类型错误不正确的相关提示
        message.warning('文件类型不正确');
      }
    };
    // 以二进制方式打开文件
    fileReader.readAsBinaryString(files[0]);
  }

  render() {
    const { brands, anchors, columns, dataSource, visible, modalData } = this.state;
    const { height } = document.body.getBoundingClientRect();

    return (
      <div>
        <Form
          ref={(ref) => { this.formRef = ref; }}
          initialValues={{
            dateType: 'week',
            date: moment(),
            abandon: 0
          }}
          onFinish={this.hanldeSearch}
        >
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                label="品牌"
                name="brand"
              >
                <Select allowClear placeholder="请选择品牌">
                  {
                    brands.map((item) => {
                      return (
                        <Option
                          key={item.id}
                          value={item.id}
                        >
                          {item.name}
                        </Option>
                      );
                    })
                  }
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                label="主播"
                name="anchor"
              >
                <Select allowClear placeholder="请选择主播">
                  {
                    anchors.map((item) => {
                      return (
                        <Option
                          key={item.id}
                          value={item.id}
                        >
                          {item.name}
                        </Option>
                      );
                    })
                  }
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Row>
                <Col span={10}>
                  <Form.Item
                    label="日期范围"
                    name="dateType"
                  >
                    <Select>
                      <Option key="week" value="week">周</Option>
                      <Option key="month" value="month">月</Option>
                    </Select>
                  </Form.Item>
                </Col>
                <Col span={14}>
                  <Form.Item
                    noStyle
                    shouldUpdate={(prevValues, currentValues) => prevValues.dateType !== currentValues.dateType}
                  >
                    {({ getFieldValue }) => (
                      <Form.Item
                        name="date"
                      >
                        {
                          React.createElement(getFieldValue('dateType') === 'month' ? MonthPicker : WeekPicker, {
                            allowClear: false,
                            placeholder: '请选择日期',
                            style: { width: '100%' }
                          })
                        }
                      </Form.Item>
                    )}
                  </Form.Item>
                </Col>
              </Row>
            </Col>
          </Row>
          <Row>
            <Col span={24}>
              <Form.Item
                wrapperCol={{ sm: 24 }}
                style={{ textAlign: 'center' }}
              >
                <Button
                  type="primary"
                  htmlType="submit"
                >
                  查询
                </Button>
              </Form.Item>
            </Col>
          </Row>
        </Form>
        <div>
          <Button
            type="primary"
            style={{ marginBottom: 16 }}
            icon={<PlusOutlined />}
            onClick={() => this.toggleVisible()}
          >
            新增记录
          </Button>
          <input type="file" accept=".xlsx, .xls" onChange={this.onImportExcel} />
        </div>
        <Table
          rowKey="id"
          size="small"
          dataSource={dataSource}
          columns={columns}
          pagination={false}
          scroll={{ y: height - 250 }}
        />
        <Modal
          centered
          destroyOnClose
          maskClosable={false}
          visible={visible}
          title="编辑"
          onOk={this.handleOk}
          onCancel={() => this.toggleVisible()}
        >
          <Form
            ref={(ref) => { this.formEditRef = ref; }}
            labelCol={{ span: 6 }}
            wrapperCol={{ span: 16 }}
            initialValues={{
              ...modalData,
              date: modalData.date ? moment(modalData.date) : moment()
            }}
          >
            <Form.Item
              name="abandon"
              style={{ display: 'none' }}
            >
              <Input disabled />
            </Form.Item>
            <Form.Item
              name="id"
              style={{ display: 'none' }}
            >
              <Input disabled />
            </Form.Item>
            <Form.Item
              label="日期"
              name="date"
              rules={[{ required: true, message: '请选择日期' }]}
            >
              <DatePicker
                style={{ width: '100%' }}
                disabled={!!modalData.id}
              />
            </Form.Item>
            {
              modalData.id ? (
                <>
                  <Form.Item
                    name="brand"
                    style={{ display: 'none' }}
                  >
                    <Input disabled />
                  </Form.Item>
                  <Form.Item
                    label="品牌"
                    name="brandName"
                  >
                    <Input disabled />
                  </Form.Item>
                </>
              ) : (
                <Form.Item
                  label="品牌"
                  name="brand"
                  rules={[{ required: true, message: '请选择品牌' }]}
                >
                  <Select>
                    {
                      brands.map((item) => {
                        return (
                          <Option
                            key={item.id}
                            value={item.id}
                          >
                            {item.name}
                          </Option>
                        );
                      })
                    }
                  </Select>
                </Form.Item>
              )
            }
            <Form.Item
              label="销售件数"
              name="saleCount"
              rules={[{ required: true, message: '请输入销售件数' }]}
            >
              <InputNumber style={{ width: '100%' }} />
            </Form.Item>
            <Form.Item
              label="销售额"
              name="sales"
              rules={[{ required: true, message: '请输入销售额' }]}
            >
              <InputNumber style={{ width: '100%' }} />
            </Form.Item>
            <Form.Item
              label="主播"
              name="anchor"
              rules={[{ required: true, message: '请选择主播' }]}
            >
              <Select>
                {
                  anchors.map((item) => {
                    return (
                      <Option
                        key={item.id}
                        value={item.id}
                      >
                        {item.name}
                      </Option>
                    );
                  })
                }
              </Select>
            </Form.Item>
            <Form.Item
              label="产品"
              name="production"
            >
              <TextArea row={4} />
            </Form.Item>
            <Form.Item
              label="备注"
              name="memo"
            >
              <TextArea row={2} />
            </Form.Item>
          </Form>
        </Modal>
      </div>
    );
  }
}

export default DataManagement;
