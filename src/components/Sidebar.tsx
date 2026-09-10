export const Sidebar = () => {
  return (
    <div className="sidebar">
      <h1 className="event-title">Aveda Campus Tour</h1>
      <div className="event-details">
        <div className="detail-item">
          <span className="material-icons">schedule</span>
          <div className="detail-text">60 minutes</div>
        </div>
        <div className="detail-item">
          <span className="material-icons">location_on</span>
          <div className="detail-text">
            <strong>Aveda Institute Winnipeg</strong>
            276 Portage Ave, Winnipeg, MB R3C 0B6, Canada
          </div>
        </div>
      </div>
    </div>
  );
};
