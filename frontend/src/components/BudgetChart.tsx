import React from 'react';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, Title } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend, Title);

interface Project {
    id: number;
    name: string;
    budget: number;
    invoices: any[];
}

interface Props {
    project: Project;
}

const BudgetChart: React.FC<Props> = ({ project }) => {
    const spent = project.invoices
        .filter(i => i.is_paid)
        .reduce((sum, i) => sum + i.amount, 0);

    const committed = project.invoices
        .filter(i => !i.is_paid)
        .reduce((sum, i) => sum + i.amount, 0);

    const remaining = project.budget - (spent + committed);

    const data = {
        labels: ['Spent (Paid)', 'Committed (Unpaid)', 'Remaining'],
        datasets: [
            {
                label: 'Budget Usage',
                data: [spent, committed, Math.max(0, remaining)],
                backgroundColor: [
                    'rgba(220, 53, 69, 0.7)',  // Danger Red
                    'rgba(255, 193, 7, 0.7)',   // Warning Yellow
                    'rgba(25, 135, 84, 0.7)',    // Success Green
                ],
                borderColor: [
                    'rgba(220, 53, 69, 1)',
                    'rgba(255, 193, 7, 1)',
                    'rgba(25, 135, 84, 1)',
                ],
                borderWidth: 1,
            },
        ],
    };

    const options = {
        responsive: true,
        plugins: {
            legend: {
                position: 'top' as const,
            },
            title: {
                display: true,
                text: 'Budget Overview',
                font: {
                    size: 18
                }
            },
        },
    };

    return <Pie data={data} options={options} />;
};

export default BudgetChart;