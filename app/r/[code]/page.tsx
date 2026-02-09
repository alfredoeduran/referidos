import ReferralLanding from '../../components/ReferralLanding'

export default async function ReferralPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params
  
  return <ReferralLanding code={code} />
}
