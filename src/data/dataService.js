import Papa from 'papaparse';

const SHEET_CSV_URL =
    'https://docs.google.com/spreadsheets/d/1Nv5z1koKVmh9EJ0T-7fTsnHvDf3QJ9r6cmP7SsUbUl4/export?format=csv&gid=0';

const SHEET_MEMBERS_CSV_URL =
    'https://docs.google.com/spreadsheets/d/1Nv5z1koKVmh9EJ0T-7fTsnHvDf3QJ9r6cmP7SsUbUl4/export?format=csv&gid=1291377026';

/**
 * Parse Community Needs free text into an array of tags
 */
function parseNeeds(needsStr) {
    if (!needsStr || needsStr.toLowerCase() === 'none' || needsStr.toLowerCase() === 'n/a') return [];
    return needsStr
        .split(/[,;\/]+/)
        .map((s) => s.trim())
        .filter((s) => s.length > 2);
}

/**
 * Map a member count to a size category
 */
function memberCategory(count) {
    if (count >= 200) return 'large';
    if (count >= 50) return 'medium';
    return 'small';
}

/**
 * Derive a district label based on GPS location (best-effort for Zimbabwe)
 */
function deriveDistrict(lat, lng) {
    if (lat > -18.5 && lng < 31.3) return 'Harare';
    if (lat < -18.5 && lat > -19.5 && lng < 30.5) return 'Gweru';
    if (lat < -19.5 && lng < 30) return 'Bulawayo';
    if (lng > 32) return 'Mutare / Eastern';
    if (lat < -19.5 && lng > 30) return 'South / Masvingo';
    return 'Other';
}

/**
 * Fetch and parse the Google Sheet CSV into our internal data model for Churches/Pastors.
 */
export async function fetchChurches() {
    try {
        const response = await fetch(SHEET_CSV_URL);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const csvText = await response.text();

        const { data, errors } = Papa.parse(csvText, {
            header: true,
            skipEmptyLines: true,
        });

        if (errors.length > 0) {
            console.warn('CSV parse warnings:', errors);
        }

        const churches = data
            .map((row, i) => {
                const lat = parseFloat(row['Location Lat']);
                const lng = parseFloat(row['Location Lng']);
                const members = parseInt(row['Total Members'], 10) || 0;
                const accuracy = parseInt(row['Location Accuracy'], 10) || 99;
                const churchName = (row['Church Name'] || '').trim();

                // Skip rows with invalid GPS, no church name, or zero members
                if (!churchName || isNaN(lat) || isNaN(lng) || members === 0) return null;
                // Skip entries with GPS outside reasonable Zimbabwe/Africa range
                if (lat > 5 || lat < -35 || lng < 20 || lng > 50) return null;

                return {
                    id: i + 1,
                    name: churchName,
                    address: row['Church Address'] || '',
                    pastor: row['Pastor Name'] || 'N/A',
                    pastorContact: row['Pastor Contact'] || '',
                    pastorEmail: row['Pastor Email'] || '',
                    headElder: row['Elder Name'] || 'N/A',
                    elderContact: row['Elder Contact'] || '',
                    elderEmail: row['Elder Email'] || '',
                    pmDirector: row['Director Name'] || 'N/A',
                    directorContact: row['Director Contact'] || '',
                    directorEmail: row['Director Email'] || '',
                    members,
                    memberCategory: memberCategory(members),
                    communityNeeds: parseNeeds(row['Community Needs']),
                    needsRaw: row['Community Needs'] || '',
                    comments: row['Comments'] || '',
                    lat,
                    lng,
                    accuracy,
                    timestamp: row['Timestamp'] ? new Date(row['Timestamp']) : null,
                    // Assign a district based on lat/lng cluster (best-effort)
                    district: deriveDistrict(lat, lng),
                };
            })
            .filter(Boolean);

        return { churches, error: null };
    } catch (err) {
        console.error('Failed to fetch Google Sheets data:', err);
        return { churches: [], error: err.message };
    }
}

/**
 * Fetch and parse the Google Sheet CSV into our internal data model for Households/Members.
 */
export async function fetchMembers() {
    try {
        const response = await fetch(SHEET_MEMBERS_CSV_URL);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const csvText = await response.text();

        const { data, errors } = Papa.parse(csvText, {
            header: true,
            skipEmptyLines: true,
        });

        if (errors.length > 0) {
            console.warn('CSV parse warnings (Members):', errors);
        }

        const members = data
            .map((row, i) => {
                // Handle variations in column names (e.g., 'Location X (or Location Lat)')
                const getVal = (col) => {
                    const key = Object.keys(row).find((k) => k.toLowerCase().includes(col.toLowerCase()));
                    return key ? row[key] : undefined;
                };

                const lat = parseFloat(getVal('Lat') || getVal('Location X'));
                const lng = parseFloat(getVal('Lng') || getVal('Location Y'));
                const totalMembers = parseInt(getVal('Total Members'), 10) || 0;
                const familyLeader = (getVal('Family Leader') || '').trim();

                // Skip rows with invalid GPS or zero members/no leader
                if (!familyLeader || isNaN(lat) || isNaN(lng) || totalMembers === 0) return null;
                if (lat > 5 || lat < -35 || lng < 20 || lng > 50) return null;

                const parseNum = (val) => parseInt(val, 10) || 0;

                return {
                    id: i + 1,
                    churchName: (getVal('Church Name') || 'Unassigned').trim(),
                    leader: familyLeader,
                    address: getVal('Family Address') || '',
                    totalMembers,
                    memberCategory: memberCategory(totalMembers), // repurposing to large/med/small household

                    demographics: {
                        males0_12: parseNum(getVal('Males 0-12')),
                        males13_17: parseNum(getVal('Males 13-17')),
                        males18_64: parseNum(getVal('Males 18-64')),
                        males65plus: parseNum(getVal('Males 65+')),
                        females0_12: parseNum(getVal('Females 0-12')),
                        females13_17: parseNum(getVal('Females 13-17')),
                        females18_64: parseNum(getVal('Females 18-64')),
                        females65plus: parseNum(getVal('Females 65+')),
                    },

                    hasSpecialNeeds: (getVal('Has Special Needs') || '').toLowerCase().trim() === 'yes',
                    specialNeedsDetails: getVal('Special Needs Details') || '',
                    communityChallenges: parseNeeds(getVal('Community Challenges')),

                    lat,
                    lng,
                    accuracy: parseInt(getVal('Accuracy'), 10) || 99,
                    timestamp: getVal('Timestamp') ? new Date(getVal('Timestamp')) : null,
                    district: deriveDistrict(lat, lng),
                };
            })
            .filter(Boolean);

        return { members, error: null };
    } catch (err) {
        console.error('Failed to fetch Member data:', err);
        return { members: [], error: err.message };
    }
}

/**
 * Aggregate demographics for the chart panel (Male vs Female, and Age groups)
 */
export function aggregateDemographics(members) {
    let males = 0, females = 0;
    let age0_12 = 0, age13_17 = 0, age18_64 = 0, age65 = 0;
    let specialNeedsCount = 0;

    members.forEach((m) => {
        const d = m.demographics;
        males += d.males0_12 + d.males13_17 + d.males18_64 + d.males65plus;
        females += d.females0_12 + d.females13_17 + d.females18_64 + d.females65plus;

        age0_12 += d.males0_12 + d.females0_12;
        age13_17 += d.males13_17 + d.females13_17;
        age18_64 += d.males18_64 + d.females18_64;
        age65 += d.males65plus + d.females65plus;

        if (m.hasSpecialNeeds) specialNeedsCount++;
    });

    return {
        gender: [
            { name: 'Male', value: males, color: '#3b82f6' },
            { name: 'Female', value: females, color: '#ec4899' },
        ],
        age: [
            { name: '0-12 yrs', value: age0_12 },
            { name: '13-17 yrs', value: age13_17 },
            { name: '18-64 yrs', value: age18_64 },
            { name: '65+ yrs', value: age65 },
        ],
        specialNeeds: specialNeedsCount,
    };
}

/**
 * Aggregate community needs tags across all churches
 */
export function aggregateNeeds(churches) {
    const counts = {};
    churches.forEach((c) => {
        c.communityNeeds.forEach((need) => {
            const key = need.toLowerCase();
            counts[key] = (counts[key] || 0) + 1;
        });
    });
    return Object.entries(counts)
        .map(([name, value]) => ({ name: name.charAt(0).toUpperCase() + name.slice(1), value }))
        .sort((a, b) => b.value - a.value);
}
