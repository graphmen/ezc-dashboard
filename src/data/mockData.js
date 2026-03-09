// Mock data representing EZC church and member data
// Replace this with live Google Sheets API fetch when ready

const DISTRICTS = ['Harare Central', 'Chitungwiza', 'Bulawayo', 'Mutare', 'Gweru'];

const PASTORS = [
    'Pr. Emmanuel Chigwada', 'Pr. David Moyo', 'Pr. Samuel Ncube',
    'Pr. Philip Tshuma', 'Pr. Andrew Mhuri', 'Pr. Jonathan Sibanda',
    'Pr. Michael Dube', 'Pr. Peter Mutasa', 'Pr. Thomas Phiri', 'Pr. Isaac Banda',
];

const ELDERS = [
    'Elder John Mlambo', 'Elder Charles Nkomo', 'Elder George Mutendi',
    'Elder Frank Chirisa', 'Elder Paul Musiiwa', 'Elder Mark Chikwanda',
    'Elder Luke Ndlovu', 'Elder James Zulu', 'Elder Simon Gwete', 'Elder Daniel Mahachi',
];

const PM_DIRECTORS = [
    'Dir. Grace Mabunda', 'Dir. Ruth Dube', 'Dir. Mary Sibanda',
    'Dir. Lydia Moyo', 'Dir. Esther Ncube', 'Dir. Miriam Chiweshe',
    'Dir. Priscilla Nkosi', 'Dir. Deborah Mpofu', 'Dir. Hannah Mutiso', 'Dir. Naomi Sithole',
];

// Fixed seed for deterministic data (no random on reload)
const CHURCHES = [
    { id: 1, district: 'Harare Central', lat: -17.8252, lng: 31.0354, members: 420, smallGroups: 14 },
    { id: 2, district: 'Harare Central', lat: -17.8450, lng: 31.0620, members: 310, smallGroups: 11 },
    { id: 3, district: 'Harare Central', lat: -17.8100, lng: 31.0480, members: 560, smallGroups: 18 },
    { id: 4, district: 'Chitungwiza', lat: -18.0130, lng: 31.0730, members: 280, smallGroups: 9 },
    { id: 5, district: 'Chitungwiza', lat: -18.0380, lng: 31.1050, members: 340, smallGroups: 12 },
    { id: 6, district: 'Chitungwiza', lat: -18.0600, lng: 31.0900, members: 190, smallGroups: 7 },
    { id: 7, district: 'Bulawayo', lat: -20.1500, lng: 28.5800, members: 470, smallGroups: 16 },
    { id: 8, district: 'Bulawayo', lat: -20.1800, lng: 28.6100, members: 380, smallGroups: 13 },
    { id: 9, district: 'Bulawayo', lat: -20.1200, lng: 28.5500, members: 220, smallGroups: 8 },
    { id: 10, district: 'Bulawayo', lat: -20.2100, lng: 28.6400, members: 310, smallGroups: 10 },
    { id: 11, district: 'Mutare', lat: -18.9700, lng: 32.6500, members: 290, smallGroups: 10 },
    { id: 12, district: 'Mutare', lat: -18.9400, lng: 32.6800, members: 180, smallGroups: 6 },
    { id: 13, district: 'Mutare', lat: -19.0100, lng: 32.6300, members: 350, smallGroups: 12 },
    { id: 14, district: 'Gweru', lat: -19.4500, lng: 29.8200, members: 240, smallGroups: 8 },
    { id: 15, district: 'Gweru', lat: -19.4800, lng: 29.8500, members: 195, smallGroups: 7 },
    { id: 16, district: 'Harare Central', lat: -17.7900, lng: 31.0150, members: 410, smallGroups: 14 },
    { id: 17, district: 'Chitungwiza', lat: -17.9800, lng: 31.0600, members: 265, smallGroups: 9 },
    { id: 18, district: 'Bulawayo', lat: -20.0900, lng: 28.5200, members: 330, smallGroups: 11 },
    { id: 19, district: 'Mutare', lat: -18.9900, lng: 32.7100, members: 210, smallGroups: 7 },
    { id: 20, district: 'Gweru', lat: -19.5100, lng: 29.7900, members: 175, smallGroups: 6 },
];

export const churches = CHURCHES.map((c) => ({
    ...c,
    name: `EZC ${c.district} SDA Church ${c.id}`,
    pastor: PASTORS[c.id % PASTORS.length],
    headElder: ELDERS[c.id % ELDERS.length],
    pmDirector: PM_DIRECTORS[c.id % PM_DIRECTORS.length],
}));

export const districts = DISTRICTS;

export const conferenceStats = {
    totalChurches: churches.length,
    totalMembers: churches.reduce((acc, c) => acc + c.members, 0),
    totalSmallGroups: churches.reduce((acc, c) => acc + c.smallGroups, 0),
    totalDistricts: DISTRICTS.length,
};
