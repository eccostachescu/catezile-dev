export default {
  // Global
  'site.name': 'CateZile.ro',
  'site.tagline': 'Câte zile până...',
  'loading': 'Se încarcă...',
  'error': 'Eroare',
  'retry': 'Încearcă din nou',
  'save': 'Salvează',
  'cancel': 'Anulează',
  'delete': 'Șterge',
  'edit': 'Editează',
  'view': 'Vezi',
  'back': 'Înapoi',
  'next': 'Următorul',
  'prev': 'Anteriorul',
  'search': 'Caută',
  'filter': 'Filtrează',
  'reset': 'Resetează',
  'close': 'Închide',
  'open': 'Deschide',
  'yes': 'Da',
  'no': 'Nu',

  // Navigation
  'nav.home': 'Acasă',
  'nav.events': 'Evenimente',
  'nav.movies': 'Filme',
  'nav.sport': 'Sport',
  'nav.holidays': 'Sărbători',
  'nav.tv': 'Ghid TV',
  'nav.search': 'Căutare',
  'nav.admin': 'Admin',
  'nav.account': 'Contul meu',
  'nav.login': 'Autentificare',
  'nav.logout': 'Delogare',

  // Time & Dates
  'time.now': 'acum',
  'time.today': 'azi',
  'time.tomorrow': 'mâine',
  'time.yesterday': 'ieri',
  'time.dayAfterTomorrow': 'poimâine',
  'time.dayBeforeYesterday': 'alaltăieri',
  'time.live': 'LIVE',
  'time.ended': 'încheiat',
  'time.at': 'la',
  'time.hour': 'ora',
  'time.thisWeekend': 'în weekend',
  'time.thisMonth': 'luna aceasta',
  'time.nextMonth': 'luna viitoare',

  // Countdown & Duration
  'countdown.in': 'în',
  'countdown.and': 'și',
  'countdown.startsAt': 'începe la',
  'countdown.endsIn': 'se încheie în',
  'countdown.ended': 's-a încheiat',

  // Pluralization helpers (functions)
  'unit.day': (count: number) => {
    const hasDeParticle = count === 0 || count >= 20;
    if (count === 1) return `${count} zi`;
    return `${count}${hasDeParticle ? ' de' : ''} zile`;
  },
  'unit.hour': (count: number) => {
    const hasDeParticle = count === 0 || count >= 20;
    if (count === 1) return `${count} oră`;
    return `${count}${hasDeParticle ? ' de' : ''} ore`;
  },
  'unit.minute': (count: number) => {
    const hasDeParticle = count === 0 || count >= 20;
    if (count === 1) return `${count} minut`;
    return `${count}${hasDeParticle ? ' de' : ''} minute`;
  },
  'unit.second': (count: number) => {
    const hasDeParticle = count === 0 || count >= 20;
    if (count === 1) return `${count} secundă`;
    return `${count}${hasDeParticle ? ' de' : ''} secunde`;
  },

  // Events
  'events.title': 'Evenimente în România',
  'events.subtitle': 'Descoperă festivaluri, concerte, expoziții și alte evenimente din țara ta',
  'events.noEvents': 'Nu am găsit evenimente pentru criteriile selectate',
  'events.thisWeekend': 'În weekend',
  'events.thisMonth': 'Luna aceasta',
  'events.festivals': 'Festivaluri majore',
  'events.recommended': 'Recomandate',
  'events.details': 'Detalii',
  'events.addEvent': 'Adaugă eveniment',
  'events.location': 'Locația',
  'events.category': 'Categorie',
  'events.tickets': 'Bilete',

  // Movies
  'movies.title': 'Filme noi în România',
  'movies.inCinema': 'la cinema',
  'movies.onStreaming': 'pe streaming',
  'movies.thisMonth': 'Luna aceasta',
  'movies.nextMonth': 'Luna viitoare',
  'movies.watchOn': 'Urmărește pe',
  'movies.trailer': 'Trailer',
  'movies.releaseDate': 'Data lansării',

  // Sport
  'sport.title': 'Sport România',
  'sport.live': 'LIVE',
  'sport.fixtures': 'Meciuri',
  'sport.results': 'Rezultate',
  'sport.table': 'Clasament',
  'sport.kickoff': 'Începe',
  'sport.fullTime': 'Finalul meciului',
  'sport.halftime': 'Pauză',
  'sport.tvChannels': 'Canale TV',

  // Holidays
  'holidays.title': 'Sărbători și zile libere în România',
  'holidays.national': 'Sărbători naționale',
  'holidays.religious': 'Sărbători religioase',
  'holidays.school': 'Calendar școlar',
  'holidays.workingDay': 'zi lucrătoare',
  'holidays.weekend': 'weekend',
  'holidays.holiday': 'sărbătoare',

  // Admin
  'admin.dashboard': 'Tablou de bord',
  'admin.events': 'Evenimente',
  'admin.moderation': 'Moderare',
  'admin.approve': 'Aprobă',
  'admin.reject': 'Respinge',
  'admin.pending': 'În așteptare',
  'admin.approved': 'Aprobat',
  'admin.rejected': 'Respins',

  // Forms
  'form.required': 'Câmp obligatoriu',
  'form.email': 'Adresa de email',
  'form.name': 'Nume',
  'form.title': 'Titlu',
  'form.description': 'Descriere',
  'form.date': 'Data',
  'form.time': 'Ora',
  'form.submit': 'Trimite',
  'form.submitting': 'Se trimite...',

  // Messages
  'msg.success': 'Operațiune realizată cu succes',
  'msg.error': 'A apărut o eroare',
  'msg.noResults': 'Nu s-au găsit rezultate',
  'msg.tryAgain': 'Încearcă din nou',

  // Legal
  'legal.terms': 'Termeni și condiții',
  'legal.privacy': 'Politica de confidențialitate',
  'legal.cookies': 'Politica de cookie-uri',
  'legal.accept': 'Accept termenii și condițiile',

  // SEO
  'seo.defaultTitle': 'CateZile.ro — Câte zile până...',
  'seo.defaultDescription': 'Cronometre și countdown-uri pentru evenimente populare în limba română',
} as const;