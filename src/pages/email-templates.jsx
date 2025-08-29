import { Helmet } from 'react-helmet-async';
import EmailTemplatesView from 'src/sections/email-templates/view/email-templates-view';

export default function EmailTemplatesPage() {
  return (
    <>
      <Helmet>
        <title> Email Templates | Minimal UI </title>
      </Helmet>
      <EmailTemplatesView />
    </>
  );
}

