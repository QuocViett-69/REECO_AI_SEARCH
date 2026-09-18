import { Link } from 'react-router-dom';
import { StatePanel } from '../components/StatePanel';

export function NotFoundPage() {
  return (
    <div className="page-container">
      <StatePanel
        action={
          <Link className="button button-primary" to="/">
            Return home
          </Link>
        }
        description="The requested page does not exist."
        title="Page not found"
      />
    </div>
  );
}
