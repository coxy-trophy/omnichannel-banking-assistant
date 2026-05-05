import FinancialActionPage from '@/components/FinancialAction';
import { getSession, getUserBalance } from '@/app/actions';
import { redirect } from 'next/navigation';

export default async function DepositPage() {
  const session = await getSession();

  if (!session.data?.user) {
    redirect('/login');
  }

  const balance = await getUserBalance(session.data.user.id);

  return <FinancialActionPage type="deposit" balance={balance} />;
}