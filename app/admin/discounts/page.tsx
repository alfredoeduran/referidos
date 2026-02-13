import prisma from '@/lib/prisma'
import DiscountsTable from '@/app/components/DiscountsTable'

export default async function DiscountsPage() {
  const discounts = await prisma.discount.findMany({
    orderBy: {
      createdAt: 'desc'
    }
  })

  return (
    <div className="bg-white rounded-[32px] shadow-sm border border-gray-100 p-8">
      <h2 className="text-xl font-bold text-[#2D2D2D] mb-8">Descuentos</h2>
      <DiscountsTable initialDiscounts={discounts} />
    </div>
  )
}
