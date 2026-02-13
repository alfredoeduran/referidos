export default function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    'Registrado': 'bg-[#E6F6F4] text-[#00A189]', // Teal
    'Contactado': 'bg-blue-50 text-blue-600',
    'Interesado': 'bg-indigo-50 text-indigo-600',
    'En negociación': 'bg-[#FFF4E5] text-[#FF9E2C]', // Orange
    'Separado': 'bg-purple-50 text-purple-600',
    'Cuota inicial': 'bg-green-50 text-green-600',
    'Pagado': 'bg-green-100 text-green-700',
    'No validado': 'bg-gray-100 text-gray-500',
  }

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${styles[status] || 'bg-gray-50 text-gray-500'}`}>
        {status}
    </span>
  )
}
