export default function StatCard({ label, value, icon: Icon, tone = 'navy' }) {
    return (
        <div className="stat-card">
            {Icon && (
                <div className={`stat-icon stat-icon-${tone}`}>
                    <Icon size={20} strokeWidth={2} />
                </div>
            )}
            <div>
                <div className="stat-label">{label}</div>
                <div className="stat-value">{value}</div>
            </div>
        </div>
    );
}
