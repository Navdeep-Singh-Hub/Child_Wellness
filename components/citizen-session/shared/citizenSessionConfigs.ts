/** Per-session hub metadata for The Citizen · Section 8 */
export type SessionCard = { icon: string; title: string; desc: string };

export type SessionPalette = {
  accent: string;
  glow: string;
  secondary: string;
};

export type CitizenSessionConfig = {
  sessionNumber: number;
  hubTitle: string;
  hubSubtitle: string;
  cards: SessionCard[];
  example?: { emojis: string; label: string };
  tags?: string[];
  resultTitle: string;
  resultBadge: string;
  resultBadgeEmoji: string;
  palette: SessionPalette;
  finale?: boolean;
};

export const CITIZEN_SESSIONS: Record<number, CitizenSessionConfig> = {
  1: {
    sessionNumber: 1,
    hubTitle: 'Safety District',
    hubSubtitle: 'Learn STOP, GO, and EXIT — then coins and a real-world sign photo!',
    example: { emojis: '🛑 GO EXIT', label: 'tap the right safety sign' },
    tags: ['Signs', 'Meaning', 'Coins', 'Count'],
    cards: [
      { icon: '🛑', title: 'Sign Scan', desc: 'Tap the STOP sign' },
      { icon: '📋', title: 'Meaning Match', desc: 'What does it mean?' },
      { icon: '🪙', title: 'Coin Spotter', desc: 'Find ₹1, ₹2, ₹5' },
      { icon: '💰', title: 'Coin Counter', desc: 'Add them up' },
    ],
    resultTitle: 'Safety district cleared!',
    resultBadge: 'Safety Sign Star',
    resultBadgeEmoji: '⭐',
    palette: { accent: '#EC4899', glow: '#FDA4AF', secondary: '#F59E0B' },
  },
  2: {
    sessionNumber: 2,
    hubTitle: 'Public Plaza',
    hubSubtitle: 'Learn restroom and exit signs — then match coin values around town!',
    example: { emojis: '🚻 MEN WOMEN', label: 'tap the right public sign' },
    tags: ['Restroom', 'Exit', 'Coins', 'Value'],
    cards: [
      { icon: '🚻', title: 'Sign Scan', desc: 'Tap the TOILET sign' },
      { icon: '📋', title: 'Place Match', desc: 'Restroom, exit' },
      { icon: '🪙', title: 'Value Spotter', desc: 'Match ₹5, ₹10' },
      { icon: '💰', title: 'Value Builder', desc: '₹5 + ₹5 = ?' },
    ],
    resultTitle: 'Public plaza cleared!',
    resultBadge: 'Public Signs Star',
    resultBadgeEmoji: '⭐',
    palette: { accent: '#38BDF8', glow: '#BAE6FD', secondary: '#F59E0B' },
  },
  3: {
    sessionNumber: 3,
    hubTitle: 'Wayfinder Depot',
    hubSubtitle: 'Learn LEFT, RIGHT, and EXIT — then sort coins and buy something!',
    example: { emojis: '⬅️ RIGHT EXIT', label: 'tap the right direction sign' },
    tags: ['Left', 'Right', 'Exit', 'Coins'],
    cards: [
      { icon: '⬅️', title: 'Sign Scan', desc: 'Tap the LEFT sign' },
      { icon: '📋', title: 'Direction Match', desc: 'Go left, go right' },
      { icon: '🪙', title: 'Coin Sorter', desc: 'Sort ₹1–₹10' },
      { icon: '🍎', title: 'Shop Stop', desc: 'Buy the item' },
    ],
    resultTitle: 'Wayfinder depot cleared!',
    resultBadge: 'Direction Signs Star',
    resultBadgeEmoji: '⭐',
    palette: { accent: '#14B8A6', glow: '#5EEAD4', secondary: '#F59E0B' },
  },
  4: {
    sessionNumber: 4,
    hubTitle: 'Shopfront Row',
    hubSubtitle: 'Learn OPEN, CLOSED, and SALE — then read price tags and buy a toy!',
    example: { emojis: '🏪 OPEN SALE', label: 'tap the right store sign' },
    tags: ['Open', 'Sale', 'Prices', 'Buy'],
    cards: [
      { icon: '🏪', title: 'Sign Scan', desc: 'Tap the OPEN sign' },
      { icon: '📋', title: 'Sign Match', desc: 'Discount, open' },
      { icon: '🏷️', title: 'Price Hunter', desc: 'Find ₹10, ₹20' },
      { icon: '🧸', title: 'Toy Counter', desc: 'Buy the toy' },
    ],
    resultTitle: 'Shopfront row cleared!',
    resultBadge: 'Store Signs Star',
    resultBadgeEmoji: '⭐',
    palette: { accent: '#F97316', glow: '#FDBA74', secondary: '#EC4899' },
  },
  5: {
    sessionNumber: 5,
    hubTitle: 'Traffic Circuit',
    hubSubtitle: 'Learn STOP, NO ENTRY, and PARKING — then count coins and pay to park!',
    example: { emojis: '🛑 NO ENTRY 🅿️', label: 'tap the right traffic sign' },
    tags: ['Stop', 'No Entry', 'Parking', 'Pay'],
    cards: [
      { icon: '🛑', title: 'Sign Scan', desc: 'Tap the STOP sign' },
      { icon: '📋', title: 'Traffic Match', desc: 'Stop, no entry' },
      { icon: '🪙', title: 'Coin Counter', desc: '₹5 + ₹5 + ₹5' },
      { icon: '🅿️', title: 'Parking Pay', desc: 'Pay the fee' },
    ],
    resultTitle: 'Traffic circuit cleared!',
    resultBadge: 'Traffic Signs Star',
    resultBadgeEmoji: '⭐',
    palette: { accent: '#EF4444', glow: '#FCA5A5', secondary: '#F59E0B' },
  },
  6: {
    sessionNumber: 6,
    hubTitle: 'Campus Corridor',
    hubSubtitle: 'Learn LIBRARY, CLASSROOM, and PLAYGROUND — then sort coins and buy a pencil!',
    example: { emojis: '📚 CLASSROOM 🛝', label: 'tap the right school sign' },
    tags: ['Library', 'Classroom', 'Playground', 'Buy'],
    cards: [
      { icon: '📚', title: 'Sign Scan', desc: 'Tap the LIBRARY sign' },
      { icon: '📋', title: 'Place Match', desc: 'Library, classroom' },
      { icon: '🪙', title: 'Coin Sorter', desc: 'Sort ₹1–₹10' },
      { icon: '✏️', title: 'Pencil Shop', desc: 'Buy the pencil' },
    ],
    resultTitle: 'Campus corridor cleared!',
    resultBadge: 'School Signs Star',
    resultBadgeEmoji: '⭐',
    palette: { accent: '#6366F1', glow: '#A5B4FC', secondary: '#F59E0B' },
  },
  7: {
    sessionNumber: 7,
    hubTitle: 'Dining District',
    hubSubtitle: 'Learn MENU, ORDER, and PAY — then tap coins and buy juice!',
    example: { emojis: '🍽️ MENU ORDER', label: 'tap the right restaurant sign' },
    tags: ['Menu', 'Order', 'Pay', 'Coins'],
    cards: [
      { icon: '🍽️', title: 'Sign Scan', desc: 'Tap the MENU sign' },
      { icon: '📋', title: 'Meaning Match', desc: 'Menu, order, pay' },
      { icon: '🪙', title: 'Coin Tap', desc: 'Find ₹1–₹10' },
      { icon: '🧃', title: 'Juice Bar', desc: 'Pay for juice' },
    ],
    resultTitle: 'Dining district cleared!',
    resultBadge: 'Restaurant Signs Star',
    resultBadgeEmoji: '⭐',
    palette: { accent: '#F59E0B', glow: '#FDE68A', secondary: '#EC4899' },
  },
  8: {
    sessionNumber: 8,
    hubTitle: 'Emergency Lane',
    hubSubtitle: 'Learn EXIT, FIRE, and HELP — then count coins and pay for water!',
    example: { emojis: '🚨 EXIT FIRE', label: 'tap the right emergency sign' },
    tags: ['Exit', 'Fire', 'Help', 'Coins'],
    cards: [
      { icon: '🚨', title: 'Sign Scan', desc: 'Tap the EXIT sign' },
      { icon: '📋', title: 'Meaning Match', desc: 'Exit, fire, help' },
      { icon: '🪙', title: 'Coin Counter', desc: 'Add ₹2+₹2+₹5' },
      { icon: '🫙', title: 'Water Pay', desc: 'Pay the right coin' },
    ],
    resultTitle: 'Emergency lane cleared!',
    resultBadge: 'Emergency Safety Star',
    resultBadgeEmoji: '⭐',
    palette: { accent: '#DC2626', glow: '#FCA5A5', secondary: '#F59E0B' },
  },
  9: {
    sessionNumber: 9,
    hubTitle: 'Community Square',
    hubSubtitle: 'Learn HOSPITAL, POLICE, and BUS STOP — then count coins and buy a ticket!',
    example: { emojis: '🚍 HOSPITAL POLICE', label: 'tap the right community sign' },
    tags: ['Hospital', 'Police', 'Bus Stop', 'Ticket'],
    cards: [
      { icon: '🚍', title: 'Sign Scan', desc: 'Tap the BUS STOP sign' },
      { icon: '📋', title: 'Place Match', desc: 'Bus, hospital, police' },
      { icon: '🪙', title: 'Coin Total', desc: 'Count the coins' },
      { icon: '🎫', title: 'Bus Ticket', desc: 'Pay ₹10' },
    ],
    resultTitle: 'Community square cleared!',
    resultBadge: 'Community Signs Star',
    resultBadgeEmoji: '⭐',
    palette: { accent: '#10B981', glow: '#6EE7B7', secondary: '#8B5CF6' },
  },
  10: {
    sessionNumber: 10,
    hubTitle: 'Citizen Master',
    hubSubtitle: 'Use everything you learned about signs and money!',
    tags: ['Signs', 'Meaning', 'Coins', 'Buying'],
    cards: [
      { icon: '🔍', title: 'Sign Hunt', desc: 'EXIT, STOP, TOILET' },
      { icon: '📋', title: 'Meaning Quiz', desc: 'STOP, EXIT' },
      { icon: '🪙', title: 'Coin Challenge', desc: '₹2+₹5+₹1' },
      { icon: '🛒', title: 'Store Sim', desc: 'Buy apple ₹5' },
    ],
    resultTitle: 'Congratulations! You completed Level 8.',
    resultBadge: 'Citizen Master',
    resultBadgeEmoji: '🏆',
    palette: { accent: '#FBBF24', glow: '#FEF3C7', secondary: '#7C3AED' },
    finale: true,
  },
};
