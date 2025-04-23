import React, { useRef, useEffect } from 'react';
import Chart from 'chart.js/auto';

interface BarGraphProps {
    sortedData: number[];
}

const BarGraph: React.FC<BarGraphProps> = ({ sortedData }) => {
    const chartRef = useRef<HTMLCanvasElement>(null);
    const chartInstanceRef = useRef<Chart | null>(null);

    useEffect(() => {
        if (chartRef.current) {
            const ctx = chartRef.current.getContext('2d');
            if (ctx) {
                if (chartInstanceRef.current) {
                    chartInstanceRef.current.destroy(); // Destroy the previous chart instance
                }
                chartInstanceRef.current = new Chart(ctx, {
                    type: 'bar',
                    data: {
                        labels: sortedData.map((_, index) => `Review ${index + 1}`),
                        datasets: [{
                            label: 'Average Review Score',
                            data: sortedData,
                            backgroundColor: 'rgba(255, 193, 7)',
                            borderColor:'rgba(255, 193, 7)',
                            borderWidth: 1,
                        }],
                    },
                    options: {
                        scales: {
                            x: {
                                display: false, // Hide the x-axis
                            },
                            y: {
                                display: false,
                                beginAtZero: true,
                            },
                        },
                    },
                });
            }
        }

        return () => {
            if (chartInstanceRef.current) {
                chartInstanceRef.current.destroy(); // Clean up the chart instance on component unmount
            }
        };
    }, [sortedData]);

    return (
        <div  style={{ width: '200px', height:'100px'}}>
            <canvas ref={chartRef } />
        </div>
    
    );
};

export default BarGraph;
