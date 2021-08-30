/*
 * @Author: DWP
 * @Date: 2021-08-11 13:55:33
 * @LastEditors: DWP
 * @LastEditTime: 2021-08-25 08:45:57
 */
import moment from 'moment';
import React, { useState, useEffect } from 'react';
import BarEchart from '../../components/BarEchart';
import http from '../../http';

const DataAnalysis = ({ dateType }) => {
  const [data, setData] = useState([]);
  const [brand, setBrand] = useState([]);
  const [initData, setInitData] = useState([[], []]);

  useEffect(() => {
    const promiseAttr = [];

    promiseAttr.push(new Promise((resolve) => {
      http.get('php/cow_brand.php').then((res) => {
        resolve(res);
      });
    }));

    promiseAttr.push(new Promise((resolve) => {
      http.get('php/cow_data.php', {
        abandon: 0
      }).then((res) => {
        resolve(res);
      });
    }));

    Promise.all(promiseAttr).then((res) => {
      setInitData(res);
      calculateData(res);
    });
  }, []);

  useEffect(() => {
    calculateData();
  }, [dateType]);

  const calculateData = (res) => {
    const [brandList, salesData] = res || initData;

    const dataSource = {
      目标: []
    };
    const brands = [];

    brandList.forEach((item) => {
      brands.push(item.name);
      dataSource['目标'].push(item.target);
    });

    salesData.sort((a, b) => moment(a.date) - moment(b.date));

    salesData.forEach((item) => {
      const dateKey = dateType === 'month'
        ? moment(item.date).format('YYYY-MM')
        : `${moment(item.date).weekday(1).format('YYYY-MM-DD')} ~ ${moment(item.date).weekday(7).format('YYYY-MM-DD')}`;
      const { name: brandName } = brandList.filter((o) => o.id === item.brand)[0] || {};

      if (!dataSource[dateKey]) {
        dataSource[dateKey] = new Array(dataSource['目标'].length);
      }

      if (!dataSource[dateKey][brands.indexOf(brandName)]) {
        dataSource[dateKey][brands.indexOf(brandName)] = item.sales - 0;
      } else {
        dataSource[dateKey][brands.indexOf(brandName)] += item.sales - 0;
      }
    });

    setData(dataSource);
    setBrand(brands);
  };

  return (
    <BarEchart
      date={Object.keys(data)}
      xAxis={brand}
      dataSource={Object.values(data)}
    />
  );
};

export default DataAnalysis;
