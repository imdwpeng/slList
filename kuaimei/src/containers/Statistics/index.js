/*
 * @Author: DWP
 * @Date: 2021-08-17 16:05:38
 * @LastEditors: DWP
 * @LastEditTime: 2021-08-30 10:00:36
 */
import React, { useState, useEffect } from 'react';
import moment from 'moment';
import {
  Radio,
  Checkbox,
  Row,
  Col,
  Drawer,
  Button,
  Form,
  message
} from 'antd';
import * as XLSX from 'xlsx';
import _ from 'lodash';
import BarEchart from '../../components/BarEchart';

const formatDate = (timeNum) => {
  const d = timeNum - 1;
  const t = Math.round((d - Math.floor(d)) * 24 * 60 * 60);
  return moment(new Date(1900, 0, d, 0, 0, t)).format('YYYY-MM-DD');
};

const Statistics = () => {
  const [form] = Form.useForm();
  const [dataSource, setDataSource] = useState([]);
  const [brands, setBrands] = useState([]);
  const [tempData, setTempData] = useState({ brandsTarget: [], data: [] });
  const [checkedBrands, setCheckedBrands] = useState([]);
  const [dateType, setDateType] = useState('week');
  const [visible, setVisible] = useState(false);

  const handleChangeFieldValue = (changedValues) => {
    if (changedValues.dateType) {
      setDateType(changedValues.dateType);
    } else {
      setCheckedBrands(changedValues.checkedBrands);
    }
  };

  useEffect(() => {
    calculateData();
  }, [checkedBrands, dateType, tempData]);

  const onImportExcel = (file) => {
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
        const brandsTarget = [];
        const brand = [];

        data.forEach((item, i) => {
          if (item['直播时间']) {
            if (_.findIndex(brandsTarget, (o) => o.name === item['品牌名_1']) === -1 && item['品牌名_1']) {
              brand.push(item['品牌名_1']);
              brandsTarget.push({
                name: item['品牌名_1'],
                target: item['目标销售额']
              });
            }

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

        // calculateData(brandsTarget, newData);
        setBrands(brand);
        setCheckedBrands(brand);
        setTempData({ brandsTarget, data: newData });
      } catch (e) {
        // 这里可以抛出文件类型错误不正确的相关提示
        message.warning('文件类型不正确');
      }
    };
    // 以二进制方式打开文件
    fileReader.readAsBinaryString(files[0]);
  };

  const calculateData = () => {
    const { brandsTarget, data } = tempData;

    if (!brandsTarget.length) return;

    const obj = {
      目标: []
    };
    const brandsAttr = [];

    brandsTarget.forEach((item) => {
      if (!checkedBrands.includes(item.name)) return;
      brandsAttr.push(item.name);
      obj['目标'].push(item.target);
    });

    data.sort((a, b) => moment(a.date) - moment(b.date));

    data.forEach((item) => {
      const dateKey = dateType === 'month'
        ? moment(item.date).format('YYYY-MM')
        : `${moment(item.date).weekday(1).format('YYYY-MM-DD')} ~ ${moment(item.date).weekday(7).format('YYYY-MM-DD')}`;

      if (!obj[dateKey]) {
        obj[dateKey] = new Array(obj['目标'].length);
      }

      if (!obj[dateKey][brandsAttr.indexOf(item.brand)]) {
        obj[dateKey][brandsAttr.indexOf(item.brand)] = item.sales - 0;
      } else {
        obj[dateKey][brandsAttr.indexOf(item.brand)] += item.sales - 0;
      }
    });

    setDataSource(obj);
  };

  const toggleVisible = () => {
    setVisible(!visible);
  };

  return (
    <div style={{ height: '100%' }}>
      <Button
        type="primary"
        onClick={toggleVisible}
      >
        数据管理
      </Button>
      <Drawer
        title="数据管理"
        placement="left"
        closable={false}
        onClose={toggleVisible}
        visible={visible}
        width={520}
      >
        <input type="file" accept=".xlsx, .xls" onChange={onImportExcel} />
        {
          dataSource.length !== 0 && (
            <Form
              layout="vertical"
              form={form}
              initialValues={{
                dateType,
                checkedBrands
              }}
              onValuesChange={handleChangeFieldValue}
            >
              <Form.Item name="dateType" label="日期类型">
                <Radio.Group>
                  <Radio value="week">周</Radio>
                  <Radio value="month">月</Radio>
                </Radio.Group>
              </Form.Item>
              <Form.Item name="checkedBrands" label="展示品牌">
                <Checkbox.Group style={{ width: '100%' }}>
                  <Row>
                    {
                      brands.map((brand) => {
                        return (
                          <Col
                            key={brand}
                            span={8}
                          >
                            <Checkbox value={brand}>
                              {brand}
                            </Checkbox>
                          </Col>
                        );
                      })
                    }
                  </Row>
                </Checkbox.Group>
              </Form.Item>
            </Form>
          )
        }
      </Drawer>

      <BarEchart
        date={Object.keys(dataSource)}
        xAxis={checkedBrands}
        dataSource={Object.values(dataSource)}
      />
    </div>
  );
};

export default Statistics;
