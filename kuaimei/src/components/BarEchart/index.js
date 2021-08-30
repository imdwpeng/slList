/*
 * @Author: DWP
 * @Date: 2021-04-27 11:07:32
 * @LastEditors: DWP
 * @LastEditTime: 2021-08-30 10:15:20
 */
import React, { PureComponent } from 'react';
import ReactEChartsCore from 'echarts-for-react/lib/core';
import * as echarts from 'echarts/core';
import {
  BarChart
} from 'echarts/charts';
import {
  GridComponent,
  TooltipComponent,
  TitleComponent,
  LegendComponent
} from 'echarts/components';
import {
  CanvasRenderer
} from 'echarts/renderers';

echarts.use(
  [TitleComponent, TooltipComponent, GridComponent, BarChart, CanvasRenderer, LegendComponent]
);

class BarEchart extends PureComponent {
  render() {
    const { date = [], xAxis = [], dataSource = [] } = this.props;
    const option = {
      tooltip: {
        trigger: 'axis',
        axisPointer: { // 坐标轴指示器，坐标轴触发有效
          type: 'shadow' // 默认为直线，可选为：'line' | 'shadow'
        },
        formatter: (params) => {
          let html = '';
          const totalSales = params.reduce((total, current) => (current.value ? current.value - 0 + total : total), -params[0].value || 0);

          params.forEach((item, i) => {
            const { name, marker, seriesName, value } = item;
            const iValue = value
              ? params[0].value - 0
                ? `<span style="font-weight: 700;padding-left:10px;">${`${Math.round(value * 100) / 100} (${((value / (params[0].value - 0)) * 100).toFixed(2)}`}%)</span>`
                : `<span style="font-weight: 700;padding-left:10px;">${Math.round(value * 100) / 100}</span>`
              : '';

            if (i === 0) {
              html += `${name}<div style="display: flex;justify-content: space-between;font-weight: 700;color:#000;"><div>${marker}${seriesName}</div><span style="padding-left:10px;">${value / 10000}w</span></div>`;

              const totalSalesSpan = params[0].value - 0
                ? `<span style="padding-left:10px;">${`${Math.round(totalSales * 100) / 100} (${((totalSales / (params[0].value - 0)) * 100).toFixed(2)}`}%)</span>`
                : `<span style="padding-left:10px;">${Math.round(totalSales * 100) / 100}</span>`;

              html += `
                <div style="display: flex;justify-content: space-between;font-weight: 700;color:#000;">
                  <div>
                    <span style="display:inline-block;margin-right:4px;border-radius:10px;width:10px;height:10px;background-color:rgb(193, 35, 43);"></span>
                    累计
                  </div>
                  ${totalSalesSpan}
                </div>
                <hr/>
              `;
            } else if (iValue) {
              html += `<div style="display: flex;justify-content: space-between;"><div>${marker}${seriesName}</div>${iValue}</div>`;
            }
          });

          return html;
        }
      },
      legend: {
        orient: 'vertical',
        left: 'center',
        bottom: 'bottom',
        data: date.slice(-5)
      },
      xAxis: [
        {
          type: 'category',
          data: xAxis,
          axisTick: {
            alignWithLabel: true
          },
          axisLabel: {
            interval: 0,
            rotate: 45
          }
        }
      ],
      yAxis: [
        {
          type: 'value'
        }
      ],
      series: []
    };

    date.forEach((d, i) => {
      let obj = {
        name: d,
        type: 'bar',
        barWidth: 25,
        emphasis: {
          focus: 'series'
        },
        data: dataSource[i]
      };

      if (d === '目标') {
        obj = {
          ...obj,
          z: '-1',
          barGap: '-100%',
          label: {
            normal: {
              show: true, // 显示数值
              position: 'top',
              textStyle: { color: '#000' }, // 设置数值颜色
              formatter: (params) => {
                return `${params.value / 10000}w`;
              }
            }
          },
          itemStyle: {
            normal: {
              color: '#ddd'
            }
          }
        };
      } else {
        obj = {
          ...obj,
          stack: '目标',
          label: {
            normal: {
              show: true, // 显示数值
              position: 'top', //  位置设为top
              formatter: (params) => {
                if (params.seriesIndex !== dataSource.length - 1) return '';
                return dataSource[0][params.dataIndex]
                  ? dataSource[0][params.dataIndex] - 0
                    ? `${Math.round(params.value * 100) / 100} (${((params.value / dataSource[0][params.dataIndex]) * 100).toFixed(2)}%)`
                    : `${Math.round(params.value * 100) / 100}`
                  : Math.round(params.value * 100) / 100;
              },
              textStyle: { color: '#000' } // 设置数值颜色
            }
          }
        };
      }

      option.series.push({ ...obj });
    });

    return (
      <ReactEChartsCore
        notMerge
        echarts={echarts}
        option={option}
        style={{
          height: 'calc(100% - 32px)'
        }}
      />
    );
  }
}

export default BarEchart;
