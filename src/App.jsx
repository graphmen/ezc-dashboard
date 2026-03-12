import { useState, useEffect, useMemo } from 'react';
import { Menu, X } from 'lucide-react';
import Sidebar from './components/Sidebar';
import MapArea from './components/MapArea';
import GroupManagerModal from './components/GroupManagerModal';
import ChartPanel from './components/ChartPanel';
import { fetchChurches, fetchMembers, fetchDistrictMapping, aggregateNeeds, aggregateDemographics } from './data/dataService';
import './App.css';

export default function App() {
  const [activeView, setActiveView] = useState('pastor'); // 'pastor' or 'member'
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const [allChurches, setAllChurches] = useState([]);
  const [allMembers, setAllMembers] = useState([]);
  const [districtMapping, setDistrictMapping] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastSynced, setLastSynced] = useState(null);

  // Filters shared between views where applicable
  const [filters, setFilters] = useState({ district: 'all', church: 'all', search: '', minMembers: 0 });
  const [layers, setLayers] = useState({ churches: true, heat: true, boundaries: false });
  const [showModal, setShowModal] = useState(false);
  const [showCharts, setShowCharts] = useState(false);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const mapping = await fetchDistrictMapping();
      setDistrictMapping(mapping);

      const [churchRes, memberRes] = await Promise.all([
        fetchChurches(mapping),
        fetchMembers(mapping)
      ]);
      setAllChurches(churchRes.churches);
      setAllMembers(memberRes.members);
      if (churchRes.error || memberRes.error) {
        setError(churchRes.error || memberRes.error);
      }
    } catch (err) {
      setError(err.message);
    }
    setLastSynced(new Date());
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredChurches = useMemo(() => {
    let result = allChurches;
    if (filters.district !== 'all') {
      result = result.filter((c) => c.district === filters.district);
    }
    if (filters.church !== 'all') {
      result = result.filter((c) => c.name === filters.church);
    }
    if (filters.search.trim()) {
      const s = filters.search.toLowerCase();
      result = result.filter(
        (c) =>
          c.name.toLowerCase().includes(s) ||
          c.pastor.toLowerCase().includes(s) ||
          c.headElder.toLowerCase().includes(s) ||
          c.pmDirector.toLowerCase().includes(s)
      );
    }
    if (filters.minMembers > 0) {
      result = result.filter((c) => c.members >= filters.minMembers);
    }
    return result;
  }, [filters, allChurches]);

  const filteredMembers = useMemo(() => {
    let result = allMembers;
    if (filters.district !== 'all') {
      result = result.filter((m) => m.district === filters.district);
    }
    if (filters.church !== 'all') {
      result = result.filter((m) => m.churchName === filters.church);
    }
    if (filters.search.trim()) {
      const s = filters.search.toLowerCase();
      result = result.filter(
        (m) =>
          m.leader.toLowerCase().includes(s) ||
          m.churchName.toLowerCase().includes(s)
      );
    }
    if (filters.minMembers > 0) {
      result = result.filter((m) => m.totalMembers >= filters.minMembers);
    }
    return result;
  }, [filters, allMembers]);

  const churchNeeds = useMemo(() => aggregateNeeds(filteredChurches), [filteredChurches]);
  const memberNeeds = useMemo(() => aggregateNeeds(filteredMembers.map(m => ({ communityNeeds: m.communityChallenges }))), [filteredMembers]);
  const memberDemos = useMemo(() => aggregateDemographics(filteredMembers), [filteredMembers]);

  const handleFilterChange = (key, value) => {
    setFilters((prev) => {
      const newFilters = { ...prev, [key]: value };
      if (key === 'district') {
        newFilters.church = 'all'; // Reset church when district changes
      }
      return newFilters;
    });
  };

  const handleLayerToggle = (layer) => {
    setLayers((prev) => ({ ...prev, [layer]: !prev[layer] }));
  };

  const allDistricts = useMemo(() => {
    const d = new Set();
    Object.values(districtMapping).forEach(v => d.add(v));
    allChurches.forEach(c => d.add(c.district));
    return [...d].sort();
  }, [districtMapping, allChurches]);

  const churchesInSelectedDistrict = useMemo(() => {
    let churches = [];
    if (filters.district === 'all') {
        churches = allChurches.map(c => c.name);
    } else {
        churches = allChurches
            .filter(c => c.district === filters.district)
            .map(c => c.name);
        
        // Add churches from mapping that might not be in the results but are in the district
        Object.entries(districtMapping).forEach(([church, district]) => {
            if (district === filters.district && !churches.includes(church)) {
                churches.push(church);
            }
        });
    }
    return [...new Set(churches)].sort();
  }, [filters.district, allChurches, districtMapping]);

  return (
    <div className="app">
      <Sidebar
        isOpen={isSidebarOpen}
        onCloseSidebar={() => setIsSidebarOpen(false)}
        activeView={activeView}
        onViewChange={(view) => {
          setActiveView(view);
          setFilters({ district: 'all', church: 'all', search: '', minMembers: 0 }); // reset filters on switch
          setIsSidebarOpen(false); // Close sidebar on view switch for mobile UX
        }}
        items={activeView === 'pastor' ? filteredChurches : filteredMembers}
        allCount={activeView === 'pastor' ? allChurches.length : allMembers.length}
        districts={allDistricts}
        churches={churchesInSelectedDistrict}
        filters={filters}
        onFilterChange={handleFilterChange}
        layers={layers}
        onLayerToggle={handleLayerToggle}
        onOpenModal={() => setShowModal(true)}
        onToggleCharts={() => {
          setShowCharts((v) => !v);
          if (!showCharts) setIsSidebarOpen(false); // Close sidebar if opening charts on mobile
        }}
        loading={loading}
        error={error}
        lastSynced={lastSynced}
        onRefresh={loadData}
      />

      <aside className={`chart-sidebar ${showCharts ? 'open' : ''}`}>
        <div className="chart-sidebar-header">
          <span>Analytics & Demographics</span>
          <button className="icon-btn close-chart-btn" onClick={() => setShowCharts(false)}>
            <X size={18} />
          </button>
        </div>
        <div className="chart-sidebar-body">
          <ChartPanel
            activeView={activeView}
            churches={filteredChurches}
            members={filteredMembers}
            churchNeeds={churchNeeds}
            memberNeeds={memberNeeds}
            memberDemos={memberDemos}
          />
        </div>
      </aside>

      <main className="map-wrapper">
        <button 
          className="mobile-toggle-btn"
          onClick={() => {
            setIsSidebarOpen(!isSidebarOpen);
            if (!isSidebarOpen) setShowCharts(false); // Hide charts when opening sidebar on mobile
          }}
          title={isSidebarOpen ? "Close Menu" : "Open Data Menu"}
        >
          {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
        {loading && (
          <div className="loading-overlay">
            <div className="loader" />
            <p>Loading live data…</p>
          </div>
        )}
        <MapArea
          activeView={activeView}
          items={activeView === 'pastor' ? filteredChurches : filteredMembers}
          layers={layers}
        />
      </main>

      <GroupManagerModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        churches={filteredChurches}
        members={filteredMembers}
        activeView={activeView}
      />
    </div>
  );
}
