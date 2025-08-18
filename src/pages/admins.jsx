import { Helmet } from 'react-helmet-async';
import { AdminsView } from 'src/sections/admins/view';

export default function AdminsPage() {
  return (
    <>
      <Helmet>
        <title> Admins | Minimal UI </title>
      </Helmet>
      <AdminsView />
    </>
  );
}
