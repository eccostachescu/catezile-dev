export default {
  // Global
  'site.name': 'CateZile.ro',
  'site.tagline': 'How many days until...',
  'loading': 'Loading...',
  'error': 'Error',
  'retry': 'Try again',
  'save': 'Save',
  'cancel': 'Cancel',
  'delete': 'Delete',
  'edit': 'Edit',
  'view': 'View',
  'back': 'Back',
  'next': 'Next',
  'prev': 'Previous',
  'search': 'Search',
  'filter': 'Filter',
  'reset': 'Reset',
  'close': 'Close',
  'open': 'Open',
  'yes': 'Yes',
  'no': 'No',

  // Navigation
  'nav.home': 'Home',
  'nav.events': 'Events',
  'nav.movies': 'Movies',
  'nav.sport': 'Sport',
  'nav.holidays': 'Holidays',
  'nav.tv': 'TV Guide',
  'nav.search': 'Search',
  'nav.admin': 'Admin',
  'nav.account': 'My Account',
  'nav.login': 'Login',
  'nav.logout': 'Logout',

  // Time & Dates
  'time.now': 'now',
  'time.today': 'today',
  'time.tomorrow': 'tomorrow',
  'time.yesterday': 'yesterday',
  'time.dayAfterTomorrow': 'day after tomorrow',
  'time.dayBeforeYesterday': 'day before yesterday',
  'time.live': 'LIVE',
  'time.ended': 'ended',
  'time.at': 'at',
  'time.hour': 'hour',
  'time.thisWeekend': 'this weekend',
  'time.thisMonth': 'this month',
  'time.nextMonth': 'next month',

  // Simple pluralization for English
  'unit.day': (count: number) => count === 1 ? `${count} day` : `${count} days`,
  'unit.hour': (count: number) => count === 1 ? `${count} hour` : `${count} hours`,
  'unit.minute': (count: number) => count === 1 ? `${count} minute` : `${count} minutes`,
  'unit.second': (count: number) => count === 1 ? `${count} second` : `${count} seconds`,

  // Events
  'events.title': 'Events in Romania',
  'events.subtitle': 'Discover festivals, concerts, exhibitions and other events',
  'events.noEvents': 'No events found for the selected criteria',
  'events.thisWeekend': 'This weekend',
  'events.thisMonth': 'This month',
  'events.festivals': 'Major festivals',
  'events.recommended': 'Recommended',
  'events.details': 'Details',
  'events.addEvent': 'Add event',
  'events.location': 'Location',
  'events.category': 'Category',
  'events.tickets': 'Tickets',

  // Admin interface mostly in English
  'admin.dashboard': 'Dashboard',
  'admin.events': 'Events',
  'admin.moderation': 'Moderation',
  'admin.approve': 'Approve',
  'admin.reject': 'Reject',
  'admin.pending': 'Pending',
  'admin.approved': 'Approved',
  'admin.rejected': 'Rejected',

  // Rest would be English translations...
  // For brevity, keeping essential keys only
} as const;
