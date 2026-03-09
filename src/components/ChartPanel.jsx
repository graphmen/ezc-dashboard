import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend, LineChart, Line,
} from 'recharts';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6'];

const CustomTooltipBar = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div className="chart-tooltip">
                <p className="ct-label">{label}</p>
                <p className="ct-value">{payload[0].value} {payload[0].payload.suffix || 'members'}</p>
            </div>
        );
    }
    return null;
};

const CustomTooltipPie = ({ active, payload }) => {
    if (active && payload && payload.length) {
        return (
            <div className="chart-tooltip">
                <p className="ct-label">{payload[0].name}</p>
                <p className="ct-value">{payload[0].value} {payload[0].payload.suffix || 'entities'}</p>
            </div>
        );
    }
    return null;
};

export default function ChartPanel({ activeView, churches, members, churchNeeds, memberNeeds, memberDemos }) {
    if (activeView === 'pastor') {
        if (churches.length === 0) return <div className="chart-panel empty-charts">No data.</div>;

        // Pastor Data Charts
        const memberData = churches.slice().sort((a, b) => b.members - a.members).slice(0, 12).map((c) => ({
            name: c.name.length > 18 ? c.name.slice(0, 18) + '…' : c.name,
            members: c.members,
            suffix: 'members'
        }));

        const districtMap = {};
        churches.forEach((c) => { districtMap[c.district] = (districtMap[c.district] || 0) + 1; });
        const districtData = Object.entries(districtMap).map(([name, value]) => ({ name, value, suffix: 'churches' }));

        const categoryCounts = { large: 0, medium: 0, small: 0 };
        churches.forEach((c) => { categoryCounts[c.memberCategory]++; });
        const categoryData = [
            { name: 'Large (200+)', value: categoryCounts.large, color: '#10b981', suffix: 'churches' },
            { name: 'Medium (50–199)', value: categoryCounts.medium, color: '#f59e0b', suffix: 'churches' },
            { name: 'Small (<50)', value: categoryCounts.small, color: '#ef4444', suffix: 'churches' },
        ].filter((d) => d.value > 0);

        return (
            <div className="chart-panel">
                <div className="chart-section">
                    <h3 className="chart-title">Members by Church</h3>
                    <ResponsiveContainer width="100%" height={200}>
                        <BarChart data={memberData} layout="vertical" margin={{ left: 8, right: 16, top: 4, bottom: 4 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.07)" horizontal={false} />
                            <XAxis type="number" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
                            <YAxis type="category" dataKey="name" tick={{ fill: '#cbd5e1', fontSize: 10 }} width={110} axisLine={false} tickLine={false} />
                            <Tooltip content={<CustomTooltipBar />} cursor={{ fill: 'rgba(59,130,246,0.1)' }} />
                            <Bar dataKey="members" fill="#3b82f6" radius={[0, 4, 4, 0]}>
                                {memberData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                <div className="chart-row">
                    <div className="chart-section half">
                        <h3 className="chart-title">By District</h3>
                        <ResponsiveContainer width="100%" height={170}>
                            <PieChart>
                                <Pie data={districtData} cx="50%" cy="45%" outerRadius={55} dataKey="value" labelLine={false}>
                                    {districtData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                                </Pie>
                                <Tooltip content={<CustomTooltipPie />} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="chart-section half">
                        <h3 className="chart-title">Church Size</h3>
                        <ResponsiveContainer width="100%" height={170}>
                            <PieChart>
                                <Pie data={categoryData} cx="50%" cy="45%" innerRadius={30} outerRadius={55} dataKey="value" labelLine={false}>
                                    {categoryData.map((d, i) => <Cell key={i} fill={d.color} />)}
                                </Pie>
                                <Tooltip content={<CustomTooltipPie />} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        );
    } else {
        // Member Data Charts
        if (members.length === 0) return <div className="chart-panel empty-charts">No member data.</div>;

        const sizeCounts = { large: 0, medium: 0, small: 0 };
        members.forEach((m) => {
            // Repurposed memberCategory for household sizes: small=1-2, medium=3-5, large=6+
            if (m.totalMembers >= 6) sizeCounts.large++;
            else if (m.totalMembers >= 3) sizeCounts.medium++;
            else sizeCounts.small++;
        });

        const sizeData = [
            { name: 'Large (6+)', value: sizeCounts.large, color: '#10b981', suffix: 'families' },
            { name: 'Medium (3-5)', value: sizeCounts.medium, color: '#f59e0b', suffix: 'families' },
            { name: 'Small (<3)', value: sizeCounts.small, color: '#ef4444', suffix: 'families' },
        ].filter(d => d.value > 0);

        const specialNeedsData = [
            { name: 'Has Special Needs', value: memberDemos.specialNeeds, color: '#8b5cf6', suffix: 'families' },
            { name: 'None Reported', value: members.length - memberDemos.specialNeeds, color: '#334155', suffix: 'families' },
        ];

        const ageData = memberDemos.age.map(a => ({ ...a, suffix: 'people' }));
        const genderData = memberDemos.gender.map(a => ({ ...a, suffix: 'people' }));

        return (
            <div className="chart-panel">
                <div className="chart-row">
                    <div className="chart-section half">
                        <h3 className="chart-title">Gender Split</h3>
                        <ResponsiveContainer width="100%" height={170}>
                            <PieChart>
                                <Pie data={genderData} cx="50%" cy="45%" innerRadius={30} outerRadius={55} dataKey="value" labelLine={false}>
                                    {genderData.map((d, i) => <Cell key={i} fill={d.color} />)}
                                </Pie>
                                <Tooltip content={<CustomTooltipPie />} />
                                <Legend iconSize={8} iconType="circle" wrapperStyle={{ fontSize: 10, color: '#94a3b8' }} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="chart-section half">
                        <h3 className="chart-title">Special Needs</h3>
                        <ResponsiveContainer width="100%" height={170}>
                            <PieChart>
                                <Pie data={specialNeedsData} cx="50%" cy="45%" outerRadius={55} dataKey="value" labelLine={false}>
                                    {specialNeedsData.map((d, i) => <Cell key={i} fill={d.color} />)}
                                </Pie>
                                <Tooltip content={<CustomTooltipPie />} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="chart-section">
                    <h3 className="chart-title">Age Demographics</h3>
                    <ResponsiveContainer width="100%" height={160}>
                        <BarChart data={ageData} margin={{ left: 8, right: 16, top: 4, bottom: 4 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.07)" vertical={false} />
                            <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 10 }} axisLine={false} tickLine={false} />
                            <YAxis tick={{ fill: '#94a3b8', fontSize: 10 }} axisLine={false} tickLine={false} />
                            <Tooltip content={<CustomTooltipBar />} cursor={{ fill: 'rgba(59,130,246,0.1)' }} />
                            <Bar dataKey="value" fill="#ec4899" radius={[4, 4, 0, 0]}>
                                {ageData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                <div className="chart-section">
                    <h3 className="chart-title">Household Sizes</h3>
                    <ResponsiveContainer width="100%" height={170}>
                        <PieChart>
                            <Pie data={sizeData} cx="50%" cy="45%" innerRadius={30} outerRadius={55} dataKey="value" labelLine={false}>
                                {sizeData.map((d, i) => <Cell key={i} fill={d.color} />)}
                            </Pie>
                            <Tooltip content={<CustomTooltipPie />} />
                            <Legend iconSize={8} iconType="circle" wrapperStyle={{ fontSize: 10, color: '#94a3b8' }} />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>
        );
    }
}
