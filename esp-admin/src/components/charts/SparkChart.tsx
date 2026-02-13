import ReactECharts from 'echarts-for-react';
import type { EChartsOption } from 'echarts';
import { STATUS_COLORS } from '@/utils/constants';

interface SparkDataPoint {
  timestamp: number;
  value: number;
}

interface SparkChartProps {
  data: SparkDataPoint[];
  yellowThreshold?: number;
  redThreshold?: number;
  title?: string;
}

export function SparkChart({
  data,
  yellowThreshold = 50,
  redThreshold = 70,
  title = '스파크',
}: SparkChartProps) {
  const option: EChartsOption = {
    title: {
      text: title,
      textStyle: { fontSize: 14 },
    },
    tooltip: {
      trigger: 'item',
      formatter: (params: unknown) => {
        const p = params as { value: [number, number] };
        if (!p?.value) return '';
        const date = new Date(p.value[0] * 1000);
        return `${date.toLocaleString('ko-KR')}<br/>스파크: ${p.value[1]}`;
      },
    },
    xAxis: {
      type: 'time',
    },
    yAxis: {
      type: 'value',
      name: '스파크 (0-99)',
      min: 0,
      max: 99,
    },
    series: [
      {
        type: 'scatter',
        data: data.map((d) => [d.timestamp * 1000, d.value]),
        symbolSize: 6,
        itemStyle: {
          color: (params: { value: [number, number] }) => {
            const val = params.value[1];
            if (val >= redThreshold) return STATUS_COLORS.DANGER.color;
            if (val >= yellowThreshold) return STATUS_COLORS.WARNING.color;
            return STATUS_COLORS.GOOD.color;
          },
        },
      },
    ],
    visualMap: {
      show: false,
      pieces: [
        { min: 0, max: yellowThreshold - 1, color: STATUS_COLORS.GOOD.color },
        { min: yellowThreshold, max: redThreshold - 1, color: STATUS_COLORS.WARNING.color },
        { min: redThreshold, max: 99, color: STATUS_COLORS.DANGER.color },
      ],
    },
    dataZoom: [
      {
        type: 'inside',
        start: 0,
        end: 100,
      },
      {
        type: 'slider',
        start: 0,
        end: 100,
      },
    ],
    grid: {
      left: '3%',
      right: '4%',
      bottom: '15%',
      containLabel: true,
    },
  };

  return <ReactECharts option={option} style={{ height: 300 }} />;
}
