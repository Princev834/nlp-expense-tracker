export function exportExpensesToCSV(expenses) {
  if (!Array.isArray(expenses) || expenses.length === 0) {
    alert('No expenses to export.');
    return;
  }

  const headers = ['Date', 'Category', 'Description', 'Merchant', 'Amount (₹)', 'Original Text'];

  const sanitize = (val) => {
    const str = String(val ?? '');
    return /^[=+\-@]/.test(str) ? `'${str}` : str;
  };

  const formatDate = (d) => {
    if (!d) return '';
    const date = d instanceof Date ? d : new Date(d);
    return isNaN(date) ? String(d) : date.toISOString().slice(0, 10);
  };

  const rows = expenses.map(e => [
    formatDate(e.date),
    e.category    ?? '',
    e.description ?? '',
    e.merchant    ?? '',
    e.amount?.toString() ?? '0',
    e.raw_text    ?? '',
  ]);

  const escape = (val) => `"${sanitize(val).replace(/"/g, '""')}"`;

  const csvLines = [
    headers.map(escape).join(','),
    ...rows.map(row => row.map(escape).join(',')),
  ];

  const csvContent = '\uFEFF' + csvLines.join('\r\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url  = URL.createObjectURL(blob);

  const link      = document.createElement('a');
  link.href       = url;
  link.download   = `expenses_${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}