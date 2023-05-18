import React from "react";
import { Line } from "react-chartjs-2";
import { Chart as ChartJS } from "chart.js/auto";
import {
    Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend,} from 'chart.js';

function LineChart({ chartData }) {
  return <Line data={chartData} />;
}

export default LineChart;