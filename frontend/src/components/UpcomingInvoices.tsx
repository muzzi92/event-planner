import React from 'react';

interface Invoice {
    id: number;
    filename: string;
    vendor: string;
    amount: number;
    due_date: string;
    is_paid: boolean;
}

interface Project {
    id: number;
    name: string;
    budget: number;
    invoices: Invoice[];
}

interface Props {
    project: Project;
}

const UpcomingInvoices: React.FC<Props> = ({ project }) => {
    const upcomingInvoices: Invoice[] = [];
    const today = new Date();
    const nextWeek = new Date();
    nextWeek.setDate(today.getDate() + 7);

    project.invoices.forEach((invoice: Invoice) => {
        const dueDate = new Date(invoice.due_date);
        if (!invoice.is_paid && dueDate > today && dueDate <= nextWeek) {
            upcomingInvoices.push(invoice);
        }
    });

    return (
        <div>
            <h2>Upcoming Invoices (Next 7 Days)</h2>
            <ul className="list-group">
                {upcomingInvoices.map((invoice: Invoice) => (
                    <li key={invoice.id} className="list-group-item">
                        <strong>{invoice.vendor}</strong> - ${invoice.amount.toLocaleString()} - Due: {new Date(invoice.due_date).toLocaleDateString()}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default UpcomingInvoices;
