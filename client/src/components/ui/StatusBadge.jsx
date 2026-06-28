import { APPLICATION_STATUS_STYLES } from '../../utils/constants';

const StatusBadge = ({ status }) => {
  const style = APPLICATION_STATUS_STYLES[status] || APPLICATION_STATUS_STYLES.Pending;

  return (
    <span className={`badge border ${style.bg} ${style.border} ${style.text}`}>
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {status}
    </span>
  );
};

export default StatusBadge;
