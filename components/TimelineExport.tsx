'use client';

import { useState } from 'react';
import { TimelinePrediction } from '@/types/financial';

interface TimelineExportProps {
  statusQuoData: TimelinePrediction[];
  whatIfData?: TimelinePrediction[];
  financialData: any;
}

export default function TimelineExport({ statusQuoData, whatIfData, financialData }: TimelineExportProps) {
  const [isExporting, setIsExporting] = useState(false);

  const exportToPDF = async () => {
    setIsExporting(true);
    
    try {
      // Create a simple HTML report
      const reportHTML = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>finosaur.ai Report</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { background: #0a0e27; color: #4a9eff; padding: 20px; border-radius: 8px; }
            .section { margin: 20px 0; padding: 15px; border: 1px solid #4a9eff; border-radius: 8px; }
            .chart-placeholder { background: #f0f0f0; height: 300px; display: flex; align-items: center; justify-content: center; }
            .milestone { background: #5dd98a; color: white; padding: 5px 10px; margin: 5px; border-radius: 4px; display: inline-block; }
            .final-values { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>🦕 finosaur.ai Report</h1>
            <p>Generated on ${new Date().toLocaleDateString()}</p>
          </div>
          
          <div class="section">
            <h2>Current Financial Status</h2>
            <p>Monthly Income: $${financialData.monthlyIncome.toLocaleString()}</p>
            <p>Current Savings: $${financialData.currentSavings.toLocaleString()}</p>
            <p>Current Debt: $${financialData.currentDebt.toLocaleString()}</p>
            <p>Net Worth: $${(financialData.currentSavings - financialData.currentDebt).toLocaleString()}</p>
          </div>
          
          <div class="section">
            <h2>Timeline Projection</h2>
            <div class="chart-placeholder">
              <p>📊 Interactive chart would be displayed here</p>
            </div>
          </div>
          
          <div class="final-values">
            <div class="section">
              <h3>Current Path Results</h3>
              <p>Final Net Worth: $${statusQuoData[statusQuoData.length - 1]?.netWorth.toLocaleString()}</p>
              <p>Final Savings: $${statusQuoData[statusQuoData.length - 1]?.savings.toLocaleString()}</p>
              <p>Final Debt: $${statusQuoData[statusQuoData.length - 1]?.debt.toLocaleString()}</p>
            </div>
            
            ${whatIfData ? `
            <div class="section">
              <h3>What-If Scenario Results</h3>
              <p>Final Net Worth: $${whatIfData[whatIfData.length - 1]?.netWorth.toLocaleString()}</p>
              <p>Final Savings: $${whatIfData[whatIfData.length - 1]?.savings.toLocaleString()}</p>
              <p>Final Debt: $${whatIfData[whatIfData.length - 1]?.debt.toLocaleString()}</p>
            </div>
            ` : ''}
          </div>
          
          <div class="section">
            <h2>Key Insights</h2>
            <p>• Your financial trajectory shows ${statusQuoData[statusQuoData.length - 1]?.netWorth > 0 ? 'positive' : 'negative'} growth</p>
            <p>• ${whatIfData ? 'Making changes could significantly impact your financial future' : 'Consider exploring what-if scenarios to optimize your financial path'}</p>
            <p>• Regular monitoring and adjustments are key to achieving your financial goals</p>
          </div>
        </body>
        </html>
      `;

      // Open in new window for printing
      const newWindow = window.open('', '_blank');
      if (newWindow) {
        newWindow.document.write(reportHTML);
        newWindow.document.close();
        newWindow.focus();
        // Trigger print dialog
        setTimeout(() => {
          newWindow.print();
        }, 500);
      }
    } catch (error) {
      console.error('Export failed:', error);
      alert('Export failed. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const exportToCSV = () => {
    setIsExporting(true);
    
    try {
      // Create CSV data
      const csvData = [
        ['Month', 'Status Quo Net Worth', 'Status Quo Savings', 'Status Quo Debt', 'What-If Net Worth', 'What-If Savings', 'What-If Debt'],
        ...statusQuoData.map((sq, index) => [
          sq.month,
          sq.netWorth,
          sq.savings,
          sq.debt,
          whatIfData?.[index]?.netWorth || '',
          whatIfData?.[index]?.savings || '',
          whatIfData?.[index]?.debt || ''
        ])
      ];

      const csvContent = csvData.map(row => row.join(',')).join('\n');
      
      // Download CSV
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `financial-timeline-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('CSV export failed:', error);
      alert('CSV export failed. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="bg-retro-darker p-4 rounded-lg border border-neon-green/30">
      <h3 className="text-neon-green font-bold text-sm mb-3">📊 Export Timeline</h3>
      <div className="flex gap-2">
        <button
          onClick={exportToPDF}
          disabled={isExporting}
          className="px-3 py-2 bg-neon-blue text-retro-dark rounded text-xs font-bold uppercase transition-all hover:bg-neon-green disabled:opacity-50"
        >
          {isExporting ? 'Exporting...' : '📄 PDF Report'}
        </button>
        <button
          onClick={exportToCSV}
          disabled={isExporting}
          className="px-3 py-2 bg-neon-green text-retro-dark rounded text-xs font-bold uppercase transition-all hover:bg-neon-blue disabled:opacity-50"
        >
          {isExporting ? 'Exporting...' : '📊 CSV Data'}
        </button>
      </div>
    </div>
  );
}
