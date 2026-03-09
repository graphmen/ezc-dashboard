import { MapContainer, TileLayer, Circle, CircleMarker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

function MapFitter({ items }) {
    const map = useMap();
    if (items.length > 0 && items.length < 50) {
        const bounds = items.map((i) => [i.lat, i.lng]);
        map.fitBounds(bounds, { padding: [60, 60] });
    }
    return null;
}

const churchColor = { large: '#10b981', medium: '#f59e0b', small: '#ef4444' };
const memberColor = { large: '#10b981', medium: '#f59e0b', small: '#ef4444' };

export default function MapArea({ activeView, items, layers }) {
    const isPastor = activeView === 'pastor';

    return (
        <MapContainer
            center={[-19.0154, 29.1549]}
            zoom={6}
            style={{ width: '100%', height: '100%' }}
            zoomControl={true}
        >
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>'
                url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
            />

            {isPastor && layers.heat &&
                items.map((c) => (
                    <Circle key={`heat-${c.id}`} center={[c.lat, c.lng]} radius={15000 + c.members * 25}
                        pathOptions={{ color: '#10b981', fillColor: '#10b981', fillOpacity: 0.12, weight: 1, opacity: 0.4 }} />
                ))}

            {isPastor && layers.boundaries &&
                items.map((c) => (
                    <Circle key={`bnd-${c.id}`} center={[c.lat, c.lng]} radius={12000}
                        pathOptions={{ color: '#3b82f6', fillColor: '#3b82f6', fillOpacity: 0.06, weight: 2, dashArray: '6,6', opacity: 0.7 }} />
                ))}

            {layers.churches && items.map((i) => {
                let sizeCategory = i.memberCategory || 'small';
                if (!isPastor) {
                    if (i.totalMembers >= 6) sizeCategory = 'large';
                    else if (i.totalMembers >= 3) sizeCategory = 'medium';
                }

                const colorMap = isPastor ? churchColor : memberColor;
                const radiusMap = isPastor ? { large: 11, medium: 8, small: 6 } : { large: 8, medium: 5, small: 4 };
                const radius = radiusMap[sizeCategory] || 6;

                // Special highlighting for special needs households
                const isSpecial = !isPastor && i.hasSpecialNeeds;
                const fillColor = isSpecial ? '#8b5cf6' : colorMap[sizeCategory];

                return (
                    <CircleMarker
                        key={`${activeView}-${i.id}`}
                        center={[i.lat, i.lng]}
                        radius={isSpecial ? radius + 2 : radius}
                        pathOptions={{
                            color: '#fff',
                            fillColor: fillColor,
                            fillOpacity: 1,
                            weight: isSpecial ? 3 : 2,
                        }}
                    >
                        <Popup minWidth={240}>
                            <div className="map-popup">
                                {isPastor ? (
                                    <>
                                        <h3 className="popup-title">{i.name}</h3>
                                        {i.address && <p className="popup-address"><em>{i.address}</em></p>}
                                        <div className="popup-row"><span className="popup-label">Pastor</span><span>{i.pastor}</span></div>
                                        <div className="popup-row"><span className="popup-label">Head Elder</span><span>{i.headElder}</span></div>
                                        <div className="popup-divider" />
                                        <div className="popup-stats">
                                            <div className="popup-stat"><strong>{i.members}</strong><span>Members</span></div>
                                            <div className="popup-stat"><strong>{i.district}</strong><span>District</span></div>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <h3 className="popup-title">{i.leader} Family</h3>
                                        <div className="popup-row"><span className="popup-label">Church</span><span>{i.churchName}</span></div>
                                        {i.address && <div className="popup-row"><span className="popup-label">Address</span><span>{i.address}</span></div>}
                                        <div className="popup-divider" />
                                        <div className="popup-stats">
                                            <div className="popup-stat"><strong>{i.totalMembers}</strong><span>Members</span></div>
                                            <div className="popup-stat" style={{ color: '#ec4899' }}><strong>{i.demographics.females0_12 + i.demographics.females13_17 + i.demographics.females18_64 + i.demographics.females65plus}</strong><span>Females</span></div>
                                            <div className="popup-stat" style={{ color: '#3b82f6' }}><strong>{i.demographics.males0_12 + i.demographics.males13_17 + i.demographics.males18_64 + i.demographics.males65plus}</strong><span>Males</span></div>
                                        </div>
                                        {i.hasSpecialNeeds && (
                                            <div className="popup-warn" style={{ marginTop: '0.75rem', color: '#c4b5fd' }}>
                                                <strong>⭐ Special Needs Household</strong>
                                                {i.specialNeedsDetails && <p style={{ fontSize: '0.7rem', fontStyle: 'italic', marginTop: '2px', color: '#a78bfa' }}>{i.specialNeedsDetails}</p>}
                                            </div>
                                        )}
                                    </>
                                )}
                                {i.accuracy > 8 && <p className="popup-warn">⚠️ Low GPS accuracy — location approximate</p>}
                            </div>
                        </Popup>
                    </CircleMarker>
                );
            })}

            <MapFitter items={items} />
        </MapContainer>
    );
}
