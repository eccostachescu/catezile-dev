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

  // Movies
  'movies.title': 'Movies in Romania',
  'movies.inCinema': 'in cinema',
  'movies.onStreaming': 'on streaming',
  'movies.thisMonth': 'This month',
  'movies.nextMonth': 'Next month',
  'movies.watchOn': 'Watch on',
  'movies.trailer': 'Trailer',
  'movies.releaseDate': 'Release date',

  // Sport
  'sport.title': 'Sport Romania',
  'sport.live': 'LIVE',
  'sport.fixtures': 'Fixtures',
  'sport.results': 'Results',
  'sport.table': 'Table',
  'sport.kickoff': 'Kickoff',
  'sport.fullTime': 'Full time',
  'sport.halftime': 'Half time',
  'sport.tvChannels': 'TV channels',

  // Holidays
  'holidays.title': 'Holidays and free days in Romania',
  'holidays.national': 'National holidays',
  'holidays.religious': 'Religious holidays',
  'holidays.school': 'School calendar',
  'holidays.workingDay': 'working day',
  'holidays.weekend': 'weekend',
  'holidays.holiday': 'holiday',

  // Countdown & Duration
  'countdown.in': 'in',
  'countdown.and': 'and',
  'countdown.startsAt': 'starts at',
  'countdown.endsIn': 'ends in',
  'countdown.ended': 'ended',

  // Forms
  'form.required': 'Required field',
  'form.email': 'Email address',
  'form.name': 'Name',
  'form.title': 'Title',
  'form.description': 'Description',
  'form.date': 'Date',
  'form.time': 'Time',
  'form.submit': 'Submit',
  'form.submitting': 'Submitting...',

  // Messages
  'msg.success': 'Operation completed successfully',
  'msg.error': 'An error occurred',
  'msg.noResults': 'No results found',
  'msg.tryAgain': 'Try again',

  // Legal
  'legal.terms': 'Terms and conditions',
  'legal.privacy': 'Privacy policy',
  'legal.cookies': 'Cookie policy',
  'legal.accept': 'I accept the terms and conditions',

  // SEO
  'seo.defaultTitle': 'CateZile.ro — How many days until...',
  'seo.defaultDescription': 'Timers and countdowns for popular events in Romanian',
} as const;
