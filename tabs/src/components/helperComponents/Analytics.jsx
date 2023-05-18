import { useContext,useState,useEffect } from "react";
import { Image } from "@fluentui/react-northstar";
import "./Welcome.css";
import {
    Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend,} from 'chart.js';
  import { Bar } from 'react-chartjs-2';
  require('../../../node_modules/bootstrap/dist/css/bootstrap.min.css');

  export function Analytics() {
    ChartJS.register(
        CategoryScale,
        LinearScale,
        BarElement,
        Title,
        Tooltip,
        Legend
      );
       const options = {
        responsive: true,
        plugins: {
          legend: {
            position: 'top',
          },
          title: {
            display: true,
            text: 'Chart.js Bar Chart',
          },
        },
      };
      const labels = ['January', 'February', 'March', 'April', 'May', 'June', 'July'];
       const barchartdata = {
        labels,
        datasets: [
          {
            label: 'Dataset 1',
            data: [65, 59, 80, 81, 56, 55, 40],
            backgroundColor: 'rgba(255, 99, 132, 0.5)',
          },
          {
            label: 'Dataset 2',
            data: [65, 59, 80, 81, 56, 55, 40],
            backgroundColor: 'rgba(53, 162, 235, 0.5)',
          },
        ],
      };
    
  }