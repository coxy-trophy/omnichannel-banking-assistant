import FinancialActionPage from '@/components/FinancialAction';
import { getSession, getUserBalance } from '@/app/actions';
import { redirect } from 'next/navigation';

export default async function WithdrawPage() {
  const session = await getSession();

  if (!session.data?.user) {
    redirect('/login');
  }

  const balance = await getUserBalance(session.data.user.id);

  return <FinancialActionPage type="withdraw" balance={balance} />;
}