import ReactECharts from 'echarts-for-react';
import type { EChartsOption } from 'echarts';
import { STATUS_COLORS } from '@/utils/constants';

interface BoardTempDataPoint {
  timestamp: number;
  value: number;
}

interface BoardTempChartProps {
  data: BoardTempDataPoint[];
  yellowThreshold?: number;
  redThreshold?: number;
  title?: string;
}

export function BoardTempChart({
  data,
  yellowThreshold = 60,
  redThreshold = 80,
  title = '보드온도',
}: BoardTempChartProps) {
  const option: EChartsOption = {
    title: {
      text: title,
      textStyle: { fontSize: 14 },
    },
    tooltip: {
      trigger: 'axis',
      formatter: (params: unknown) => {
        const p = (params as { value: [number, number] }[])[0];
        if (!p) return '';
        const date = new Date(p.value[0] * 1000);
        return `${date.toLocaleString('ko-KR')}<br/>온도: ${p.value[1]}°C`;
      },
    },
    xAxis: {
      type: 'time',
    },
    yAxis: {
      type: 'value',
      name: '°C',
    },
    series: [
      {
        type: 'line',
        data: data.map((d) => [d.timestamp * 1000, d.value]),
        smooth: true,
        symbol: 'none',
        lineStyle: { width: 2 },
        markLine: {
          silent: true,
          data: [
            {
              yAxis: yellowThreshold,
              lineStyle: { color: STATUS_COLORS.WARNING.color, type: 'dashed' },
              label: { formatter: `주의 ${yellowThreshold}°C` },
            },
            {
              yAxis: redThreshold,
              lineStyle: { color: STATUS_COLORS.DANGER.color, type: 'dashed' },
              label: { formatter: `위험 ${redThreshold}°C` },
            },
          ],
        },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(82, 196, 26, 0.3)' },
              { offset: 1, color: 'rgba(82, 196, 26, 0.05)' },
            ],
          },
        },
      },
    ],
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
