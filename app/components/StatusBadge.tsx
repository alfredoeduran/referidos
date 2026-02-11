export default function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    'Registrado': 'bg-gray-100 text-gray-800',
    'Contactado': 'bg-blue-100 text-blue-800',
    'Interesado': 'bg-indigo-100 text-indigo-800',
    'En negociación': 'bg-yellow-100 text-yellow-800',
    'Cuota inicial': 'bg-green-100 text-green-800',
    'Pagado': 'bg-green-800 text-white',
    // Legacy support
    'REGISTERED': 'bg-gray-100 text-gray-800',
    'CONTACTED': 'bg-blue-100 text-blue-800',
    'NEGOTIATION': 'bg-yellow-100 text-yellow-800',
    'DOWN_PAYMENT_PAID': 'bg-green-100 text-green-800',
    'COMMISSION_PAID': 'bg-green-800 text-white',
  }

  return (
    <span className={`px-3 py-1 rounded-md text-sm font-bold border ${styles[status] ? styles[status].replace('bg-', 'border-').replace('text-', 'text-') : 'border-gray-200 text-gray-800'} ${styles[status] || 'bg-gray-50'}`}>
        {status}
    </span>
  )
}
