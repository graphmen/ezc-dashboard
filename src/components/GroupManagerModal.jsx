import { useState, useMemo } from 'react';
import { X, Users, Home, Search, ChevronDown, CheckCircle } from 'lucide-react';

export default function GroupManagerModal({ isOpen, onClose, churches, members, activeView }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [expandedId, setExpandedId] = useState(null);
    const [toast, setToast] = useState(null);

    const isPastor = activeView === 'pastor';
    const dataList = isPastor ? churches : members;

    const filteredList = useMemo(() => {
        if (!searchTerm.trim()) return dataList;
        const s = searchTerm.toLowerCase();
        return dataList.filter((item) => {
            if (isPastor) {
                return item.name.toLowerCase().includes(s) || item.pastor.toLowerCase().includes(s);
            } else {
                return item.leader.toLowerCase().includes(s) || item.churchName.toLowerCase().includes(s);
            }
        });
    }, [searchTerm, dataList, isPastor]);

    if (!isOpen) return null;

    const totalItems = dataList.length;
    const totalPeople = isPastor ? churches.reduce((a, c) => a + c.members, 0) : members.reduce((a, m) => a + m.totalMembers, 0);

    const showToast = (message) => {
        setToast(message);
        setTimeout(() => setToast(null), 3000);
    };

    const toggleExpand = (id) => {
        setExpandedId(expandedId === id ? null : id);
    };

    return (
        <div className="modal-backdrop" onClick={onClose}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <div className="modal-title">
                        {isPastor ? <Users size={20} /> : <Home size={20} />}
                        {isPastor ? 'Small Group Management' : 'Household Management'}
                    </div>
                    <button className="close-btn" onClick={onClose}>
                        <X size={20} />
                    </button>
                </div>

                <div className="modal-summary">
                    <div className="modal-stat">
                        <strong>{totalItems}</strong>
                        <span>{isPastor ? 'Churches' : 'Households'}</span>
                    </div>
                    <div className="modal-stat">
                        <strong>{totalPeople.toLocaleString()}</strong>
                        <span>{isPastor ? 'Total Members' : 'Total Persons'}</span>
                    </div>
                    {isPastor && (
                        <div className="modal-stat">
                            <strong>{churches.reduce((a, c) => a + Math.max(1, Math.floor(c.members / 15)), 0)}</strong>
                            <span>Est. Small Groups</span>
                        </div>
                    )}
                </div>

                <div className="modal-search">
                    <div style={{ position: 'relative' }}>
                        <Search size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                        <input
                            type="text"
                            placeholder={isPastor ? "Search churches or pastors..." : "Search families or churches..."}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{ paddingLeft: '2.5rem' }}
                        />
                    </div>
                </div>

                <div className="modal-body">
                    {filteredList.length === 0 ? (
                        <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>
                            No results found for "{searchTerm}"
                        </div>
                    ) : (
                        <div className="accordion-list">
                            {filteredList.map((item) => {
                                const isExpanded = expandedId === item.id;

                                return (
                                    <div key={item.id} className={`accordion-item ${isExpanded ? 'expanded' : ''}`}>
                                        <div className="accordion-header" onClick={() => toggleExpand(item.id)}>
                                            <div className="accordion-title">
                                                <strong>{isPastor ? item.name : `${item.leader} Family`}</strong>
                                                <span>{isPastor ? `Pastor: ${item.pastor}` : `Church: ${item.churchName}`}</span>
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                                <div className="group-badge">
                                                    {isPastor ? `${item.members} members` : `${item.totalMembers} persons`}
                                                </div>
                                                <ChevronDown size={18} className="accordion-icon" />
                                            </div>
                                        </div>

                                        {isExpanded && (
                                            <div className="accordion-body">
                                                <div className="detail-grid">
                                                    {isPastor ? (
                                                        <>
                                                            <div className="detail-box">
                                                                <span className="db-label">Head Elder</span>
                                                                <span className="db-value">{item.headElder}</span>
                                                            </div>
                                                            <div className="detail-box">
                                                                <span className="db-label">PM Director</span>
                                                                <span className="db-value">{item.pmDirector}</span>
                                                            </div>
                                                            <div className="detail-box">
                                                                <span className="db-label">Active Groups</span>
                                                                <span className="db-value">{Math.max(1, Math.floor(item.members / 15))} assigned</span>
                                                            </div>
                                                            <div className="detail-box">
                                                                <span className="db-label">District</span>
                                                                <span className="db-value">{item.district}</span>
                                                            </div>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <div className="detail-box">
                                                                <span className="db-label">Address</span>
                                                                <span className="db-value">{item.address || 'N/A'}</span>
                                                            </div>
                                                            <div className="detail-box">
                                                                <span className="db-label">Dependents (0-17)</span>
                                                                <span className="db-value">
                                                                    {item.demographics.males0_12 + item.demographics.males13_17 +
                                                                        item.demographics.females0_12 + item.demographics.females13_17}
                                                                </span>
                                                            </div>
                                                            <div className="detail-box">
                                                                <span className="db-label">Adults (18+)</span>
                                                                <span className="db-value">
                                                                    {item.demographics.males18_64 + item.demographics.males65plus +
                                                                        item.demographics.females18_64 + item.demographics.females65plus}
                                                                </span>
                                                            </div>
                                                            <div className="detail-box">
                                                                <span className="db-label">Special Needs</span>
                                                                <span className="db-value" style={{ color: item.hasSpecialNeeds ? 'var(--warning)' : 'inherit' }}>
                                                                    {item.hasSpecialNeeds ? 'Yes' : 'No'}
                                                                </span>
                                                            </div>
                                                        </>
                                                    )}
                                                </div>

                                                <div className="action-row">
                                                    {isPastor ? (
                                                        <>
                                                            <button className="btn btn-secondary btn-sm" onClick={() => showToast(`Report requested for ${item.name}`)}>
                                                                Request Report
                                                            </button>
                                                            <button className="btn btn-primary btn-sm" onClick={() => showToast(`New Small Group created for ${item.name}`)}>
                                                                + Add Small Group
                                                            </button>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <button className="btn btn-secondary btn-sm" onClick={() => showToast(`Message sent to ${item.leader} Family`)}>
                                                                Send Message
                                                            </button>
                                                            <button className="btn btn-primary btn-sm" onClick={() => showToast(`${item.leader} Family assigned to a Small Group`)}>
                                                                Assign to Group
                                                            </button>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>

            {toast && (
                <div className="toast">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <CheckCircle size={16} />
                        {toast}
                    </div>
                </div>
            )}
        </div>
    );
}
