import ReactECharts from 'echarts-for-react';
import type { EChartsOption } from 'echarts';

interface TimeSeriesData {
  timestamp: number;
  value: number;
}

interface SeriesConfig {
  name: string;
  data: TimeSeriesData[];
  color?: string;
  type?: 'line' | 'bar' | 'scatter';
  yAxisIndex?: number;
}

interface TimeSeriesChartProps {
  series: SeriesConfig[];
  title?: string;
  yAxisName?: string;
  yAxisName2?: string;
  height?: number;
}

export function TimeSeriesChart({
  series,
  title,
  yAxisName,
  yAxisName2,
  height = 300,
}: TimeSeriesChartProps) {
  const hasSecondAxis = series.some((s) => s.yAxisIndex === 1);

  const yAxis: EChartsOption['yAxis'] = [
    {
      type: 'value',
      name: yAxisName,
    },
  ];

  if (hasSecondAxis) {
    (yAxis as object[]).push({
      type: 'value',
      name: yAxisName2,
    });
  }

  const option: EChartsOption = {
    title: title
      ? {
          text: title,
          textStyle: { fontSize: 14 },
        }
      : undefined,
    tooltip: {
      trigger: 'axis',
    },
    legend: {
      data: series.map((s) => s.name),
      bottom: 30,
    },
    xAxis: {
      type: 'time',
    },
    yAxis,
    series: series.map((s) => ({
      name: s.name,
      type: s.type ?? 'line',
      data: s.data.map((d) => [d.timestamp * 1000, d.value]),
      smooth: true,
      symbol: 'none',
      lineStyle: s.color ? { color: s.color } : undefined,
      itemStyle: s.color ? { color: s.color } : undefined,
      yAxisIndex: s.yAxisIndex ?? 0,
    })),
    dataZoom: [
      {
        type: 'inside',
        start: 0,
        end: 100,
        zoomOnMouseWheel: true,
        moveOnMouseMove: true,
      },
      {
        type: 'slider',
        start: 0,
        end: 100,
        bottom: 5,
      },
    ],
    grid: {
      left: '3%',
      right: hasSecondAxis ? '6%' : '4%',
      bottom: '20%',
      containLabel: true,
    },
  };

  return <ReactECharts option={option} style={{ height }} />;
}
