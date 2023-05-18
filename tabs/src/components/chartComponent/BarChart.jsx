import React from "react";
import { Bar } from "react-chartjs-2";
import { Chart as ChartJS } from "chart.js/auto";
import {
    Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend,} from 'chart.js';

function BarChart({ chartData }) {
  return <Bar data={chartData} />;
}

export default BarChart;