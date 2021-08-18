/*
 * @Author: DWP
 * @Date: 2021-08-17 16:05:38
 * @LastEditors: DWP
 * @LastEditTime: 2021-08-17 16:12:51
 */
import React, {} from 'react';
import { Radio } from 'antd';
import BarChart from './BarChart';

const Statistics = () => {
  const [dateType, setDateType] = React.useState('week');

  const onChange = (e) => {
    setDateType(e.target.value);
  };

  return (
    <div style={{ height: '100%' }}>
      <Radio.Group
        value={dateType}
        onChange={onChange}
      >
        <Radio value="week">周</Radio>
        <Radio value="month">月</Radio>
      </Radio.Group>
      <BarChart dateType={dateType} />
    </div>
  );
};

export default Statistics;
