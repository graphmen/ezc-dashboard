import { BarChart2, Filter, Layers, Users, RefreshCw, BarChart, X } from 'lucide-react';
import sdaLogo from '../sda.png';

export default function Sidebar({
    isOpen, onCloseSidebar,
    activeView, onViewChange,
    items, allCount, 
    districts, churches,
    filters, onFilterChange,
    layers, onLayerToggle, onOpenModal,
    showCharts, onToggleCharts,
    loading, error, lastSynced, onRefresh,
}) {
    const isPastor = activeView === 'pastor';
    const totalPeople = isPastor
        ? items.reduce((acc, c) => acc + c.members, 0)
        : items.reduce((acc, m) => acc + m.totalMembers, 0);

    const totalGroups = isPastor
        ? items.reduce((acc, c) => acc + Math.max(1, Math.floor(c.members / 15)), 0)
        : items.length; // 1 household = 1 group element

    const isFiltered = filters.district !== 'all' || filters.church !== 'all' || filters.search || filters.minMembers > 0;
    const currentDistricts = districts || [...new Set(items.map((i) => i.district))].sort();

    return (
        <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
            <div className="sidebar-header">
                <div className="sidebar-logo">
                    <img src={sdaLogo} alt="SDA Logo" style={{ width: 36, height: 36, objectFit: 'contain' }} />
                    <div>
                        <h1>Hagios Small Groups</h1>
                        <p>Evangelism &amp; Mapping Exercise</p>
                    </div>
                </div>
                <div className="header-actions">
                    <button className="icon-btn mobile-close-btn" title="Close Sidebar" onClick={onCloseSidebar}>
                        <X size={15} />
                    </button>
                    <button className="icon-btn" title="Refresh data" onClick={onRefresh} disabled={loading}>
                        <RefreshCw size={15} className={loading ? 'spinning' : ''} />
                    </button>
                    <button
                        className={`icon-btn ${showCharts ? 'active' : ''}`}
                        title="Toggle data charts"
                        onClick={onToggleCharts}
                    >
                        <BarChart size={15} />
                    </button>
                </div>
            </div>

            <div className="view-toggle">
                <button
                    className={`toggle-btn ${isPastor ? 'active' : ''}`}
                    onClick={() => onViewChange('pastor')}
                >👨‍💼 Pastor Data</button>
                <button
                    className={`toggle-btn ${!isPastor ? 'active' : ''}`}
                    onClick={() => onViewChange('member')}
                >👥 Member Data</button>
            </div>

            {lastSynced && (
                <div className="sync-bar">
                    {loading
                        ? 'Syncing live data…'
                        : error
                            ? <span className="sync-error">⚠ {error}</span>
                            : `Synced ${lastSynced.toLocaleTimeString()}`}
                </div>
            )}

            <div className="sidebar-content">
                {/* Stats */}
                <div className="card">
                    <div className="card-title"><BarChart2 size={15} />{isPastor ? 'Conference Stats' : 'Demographics Stats'}</div>
                    <div className="stat-grid">
                        <div className="stat-box">
                            <div className="stat-value">{items.length}</div>
                            <div className="stat-label">{isPastor ? 'Churches' : 'Households'}</div>
                        </div>
                        <div className="stat-box">
                            <div className="stat-value">{totalPeople.toLocaleString()}</div>
                            <div className="stat-label">{isPastor ? 'Total Members' : 'Total Persons'}</div>
                        </div>
                        <div className="stat-box">
                            <div className="stat-value">~{totalGroups}</div>
                            <div className="stat-label">{isPastor ? 'Small Groups' : 'Families'}</div>
                        </div>
                        <div className="stat-box">
                            <div className="stat-value">{currentDistricts.length}</div>
                            <div className="stat-label">Districts</div>
                        </div>
                    </div>
                </div>

                {/* Filters */}
                <div className="card">
                    <div className="card-title">
                        <Filter size={15} />Filters
                        {isFiltered && (
                            <button className="reset-btn" onClick={() => {
                                onFilterChange('district', 'all');
                                onFilterChange('church', 'all');
                                onFilterChange('search', '');
                                onFilterChange('minMembers', 0);
                            }}>
                                <X size={11} /> Clear
                            </button>
                        )}
                    </div>
                    <div className="filter-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                        <div className="input-group">
                            <label className="input-label">District</label>
                            <select className="select-input" value={filters.district} onChange={(e) => onFilterChange('district', e.target.value)}>
                                <option value="all">All</option>
                                {districts && districts.map((d) => <option key={d} value={d}>{d}</option>)}
                            </select>
                        </div>
                        <div className="input-group">
                            <label className="input-label">Church</label>
                            <select className="select-input" value={filters.church} onChange={(e) => onFilterChange('church', e.target.value)}>
                                <option value="all">All</option>
                                {churches && churches.map((c) => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>
                    </div>
                    <div className="input-group" style={{ marginTop: '8px' }}>
                        <label className="input-label">{isPastor ? 'Search Church / Leader' : 'Search Household / Church'}</label>
                        <input
                            type="text" className="text-input"
                            placeholder="Search name…"
                            value={filters.search}
                            onChange={(e) => onFilterChange('search', e.target.value)}
                        />
                    </div>
                    <div className="input-group">
                        <label className="input-label">Min. {isPastor ? 'Members' : 'Household Size'}: {filters.minMembers || 'Any'}</label>
                        <input
                            type="range" min={0} max={isPastor ? 500 : 20} step={isPastor ? 10 : 1}
                            className="range-input"
                            value={filters.minMembers || 0}
                            onChange={(e) => onFilterChange('minMembers', parseInt(e.target.value))}
                        />
                    </div>
                    {isFiltered && (
                        <p className="filter-result">Showing {items.length} of {allCount} items</p>
                    )}
                </div>

                {/* Map Layers */}
                <div className="card">
                    <div className="card-title"><Layers size={15} />Map Layers</div>
                    <div className="layer-list">
                        <label className="layer-item">
                            <input type="checkbox" checked={layers.churches} onChange={() => onLayerToggle('churches')} />
                            <span className={`layer-dot ${isPastor ? 'church-dot' : 'member-dot'}`} />
                            {isPastor ? 'Church Locations' : 'Household Locations'}
                        </label>
                        {isPastor && (
                            <>
                                <label className="layer-item">
                                    <input type="checkbox" checked={layers.heat} onChange={() => onLayerToggle('heat')} />
                                    <span className="layer-dot heat-dot" />Growth Areas (Density)
                                </label>
                                <label className="layer-item">
                                    <input type="checkbox" checked={layers.boundaries} onChange={() => onLayerToggle('boundaries')} />
                                    <span className="layer-dot boundary-dot" />Catchment Boundaries
                                </label>
                            </>
                        )}
                    </div>
                </div>

                {/* Legend */}
                <div className="card">
                    <div className="card-title">Map Legend ({isPastor ? 'Churches' : 'Households'})</div>
                    <div className="legend-item"><span className="legend-dot" style={{ background: '#10b981' }} /> {isPastor ? 'Large Church (200+)' : 'Large Family (6+)'}</div>
                    <div className="legend-item"><span className="legend-dot" style={{ background: '#f59e0b' }} /> {isPastor ? 'Medium Church (50–199)' : 'Standard Family (3–5)'}</div>
                    <div className="legend-item"><span className="legend-dot" style={{ background: '#ef4444' }} /> {isPastor ? 'Small Church (<50)' : 'Small Family (<3)'}</div>
                    {!isPastor && (
                        <div className="legend-item"><span className="legend-dot" style={{ background: '#8b5cf6', borderRadius: '2px' }} /> Has Special Needs</div>
                    )}
                </div>

                <button className="btn btn-primary" onClick={onOpenModal}>
                    <Users size={15} />Interactive Group Manager
                </button>
            </div>
        </aside>
    );
}
