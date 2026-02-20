import prisma from '@/lib/prisma'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import StatusBadge from '../../components/StatusBadge'
import { uploadDocument } from '../../actions'

export default async function DocumentacionPage() {
  const cookieStore = await cookies()
  const userId = cookieStore.get('userId')?.value
  const role = cookieStore.get('role')?.value

  if (!userId) redirect('/login')
  if (role === 'ADMIN' || role === 'SUPERADMIN') redirect('/admin')

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { documents: true },
  })
  if (!user) redirect('/login')

  const documents = user.documents
  const requiredDocs = [
    { type: 'ID_CARD_FRONT', label: 'Cédula (Frontal)' },
    { type: 'ID_CARD_BACK', label: 'Cédula (Trasera)' },
    { type: 'RUT', label: 'RUT' },
    { type: 'BANK_CERT', label: 'Certificación Bancaria' },
  ]

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 px-6 py-5">
        <h1 className="text-xl font-bold text-[#2D2D2D]">Documentación</h1>
        <p className="text-sm text-gray-500">Carga y estado de validación</p>
      </div>
      <div className="bg-white shadow rounded-lg p-6">
        <div className="space-y-4">
          {requiredDocs.map((doc) => {
            const existingDoc = documents.find((d) => d.type === doc.type)
            return (
              <div key={doc.type} className="border rounded p-4 flex justify-between items-center">
                <div>
                  <h4 className="font-medium text-gray-900">{doc.label}</h4>
                  {existingDoc ? (
                    <div className="flex items-center gap-2 mt-1">
                      <StatusBadge status={existingDoc.status} />
                      {existingDoc.feedback && <span className="text-sm text-red-500">{existingDoc.feedback}</span>}
                    </div>
                  ) : (
                    <span className="text-sm text-gray-500">Pendiente de carga</span>
                  )}
                </div>
                <div>
                  {(!existingDoc || existingDoc.status === 'REJECTED') && (
                    <form action={uploadDocument} className="flex items-center gap-2">
                      <input type="hidden" name="type" value={doc.type} />
                      <input
                        type="file"
                        name="file"
                        accept="image/*,application/pdf"
                        required
                        className="text-sm text-gray-700 file:mr-2 file:py-1 file:px-3 file:rounded-lg file:border-0 file:bg-gray-100 file:text-gray-700 cursor-pointer"
                      />
                      <button className="bg-gray-900 text-white px-3 py-1 rounded text-sm hover:bg-gray-800">Subir</button>
                    </form>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
