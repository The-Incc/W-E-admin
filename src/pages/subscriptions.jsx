import { Helmet } from 'react-helmet-async';
import { SubscriptionView } from 'src/sections/subscription/view';

export default function SubscriptionsPage() {
  return (
    <>
      <Helmet>
        <title> Subscriptions | Minimal UI </title>
      </Helmet>
      <SubscriptionView />
    </>
  );
}