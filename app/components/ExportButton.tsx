'use client'

export default function ExportButton({ data }: { data: any[] }) {
  const handleExport = () => {
    if (!data || !data.length) return
    
    // Flatten data for CSV
    const csvRows = [
      ['Fecha', 'Nombre', 'Email', 'Teléfono', 'Ciudad', 'Proyecto', 'Estado', 'Referidor', 'Comisión']
    ]

    data.forEach(lead => {
      csvRows.push([
        new Date(lead.createdAt).toLocaleDateString(),
        lead.name || '',
        lead.email || '',
        lead.phone || '',
        lead.city || '',
        lead.projectInterest || '',
        lead.status || '',
        lead.referrer?.name || 'N/A',
        lead.commission?.amount ? `$${lead.commission.amount}` : '0'
      ])
    })

    const csvContent = "data:text/csv;charset=utf-8," 
        + csvRows.map(e => e.join(",")).join("\n")
    
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement("a")
    link.setAttribute("href", encodedUri)
    link.setAttribute("download", "leads_export.csv")
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <button 
      onClick={handleExport}
      className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors flex items-center gap-2"
    >
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
      Exportar CSV
    </button>
  )
}
