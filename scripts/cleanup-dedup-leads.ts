import prisma from '../lib/prisma'

async function main() {
  const leads = await prisma.lead.findMany({
    include: { commission: true },
    orderBy: { createdAt: 'asc' }
  })

  const byPhone: Record<string, typeof leads> = {}
  for (const lead of leads) {
    const digits = (lead.phone || '').replace(/\D/g, '')
    const key = digits || (lead.phone || '').trim().toLowerCase()
    if (!byPhone[key]) byPhone[key] = []
    byPhone[key].push(lead)
  }

  let totalGroups = 0
  let deleted = 0
  let reassigns = 0

  for (const [key, group] of Object.entries(byPhone)) {
    if (group.length <= 1) continue
    totalGroups++

    // Prioridad: mantener el que tenga comisión; si hay más de uno, mantener el más antiguo
    const withCommission = group.filter(g => !!g.commission)
    const primary = (withCommission.length > 0 ? withCommission : group).sort(
      (a, b) => a.createdAt.getTime() - b.createdAt.getTime()
    )[0]

    for (const dup of group) {
      if (dup.id === primary.id) continue

      // Si el duplicado tiene comisión y el primario no, reasignar comisión
      if (dup.commission && !primary.commission) {
        await prisma.commission.update({
          where: { id: dup.commission.id },
          data: { leadId: primary.id, referrerId: primary.referrerId }
        })
        reassigns++
      }

      // Si ambos tienen comisión, no borrar por seguridad
      if (dup.commission && primary.commission) {
        console.warn(`Saltando eliminación: ambos tienen comisión (primary ${primary.id}, dup ${dup.id})`)
        continue
      }

      await prisma.lead.delete({ where: { id: dup.id } })
      deleted++
    }
  }

  console.log(JSON.stringify({ totalGroups, deleted, reassigns }, null, 2))
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })

