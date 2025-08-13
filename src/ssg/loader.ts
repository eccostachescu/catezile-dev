import { supabase } from "@/integrations/supabase/client";

// Existing loader functions (stubs for now)
export async function loadHome() {
  return {};
}

export async function loadEvent(slug: string) {
  return null;
}

export async function loadRelated(kind: string, id: string) {
  return [];
}

// Removed duplicate functions

export async function loadCategoryHub(slug: string, params?: { year?: number } | string) {
  return null;
}

export async function loadSportList(params?: { days?: number } | string) {
  try {
    const days = typeof params === 'object' ? params?.days || 14 : 14;
    const from = new Date();
    const to = new Date(from.getTime() + days * 24 * 60 * 60 * 1000);
    
    const { data: matches } = await supabase
      .from('match')
      .select(`
        id,
        home,
        away,
        kickoff_at,
        status,
        score,
        tv_channels,
        slug,
        competition_id,
        is_derby
      `)
      .gte('kickoff_at', from.toISOString())
      .lte('kickoff_at', to.toISOString())
      .order('kickoff_at');

    if (!matches || matches.length === 0) {
      return {
        days: [],
        filters: { teams: [], tv: [] }
      };
    }

    // Group matches by date
    const groupedByDate = matches.reduce((acc: any, match: any) => {
      const date = new Intl.DateTimeFormat('ro-RO', { timeZone: 'Europe/Bucharest' }).format(new Date(match.kickoff_at));
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(match);
      return acc;
    }, {});

    const daysList = Object.entries(groupedByDate).map(([date, matches]) => ({
      date,
      matches: matches as any[]
    }));

    // Extract unique teams and TV channels for filters
    const teams = Array.from(new Set(matches.flatMap(m => [m.home, m.away]))).sort();
    const tvChannels = Array.from(new Set(matches.flatMap(m => m.tv_channels || []))).sort();

    return {
      days: daysList,
      filters: {
        teams,
        tv: tvChannels
      }
    };
  } catch (error) {
    console.error('Error loading sport list:', error);
    return {
      days: [],
      filters: { teams: [], tv: [] }
    };
  }
}

export async function loadMatch(slug: string, params?: { days?: number } | string) {
  return null;
}

// Add missing functions that prerender.tsx expects
export async function loadMovies() {
  return loadMoviesHome();
}

export async function loadCategory(slug: string) {
  return null;
}

export async function loadCountdown(id: string) {
  return null;
}

// Holiday-related loaders
export async function loadHolidays() {
  try {
    const currentYear = new Date().getFullYear();
    const { data: instances } = await supabase
      .from('holiday_instance')
      .select(`
        *,
        holiday:holiday_id (*)
      `)
      .in('year', [currentYear, currentYear + 1])
      .order('date');
    
    return {
      instances: instances || [],
      currentYear,
      nextYear: currentYear + 1
    };
  } catch (error) {
    console.error('Error loading holidays:', error);
    return { instances: [], currentYear: new Date().getFullYear(), nextYear: new Date().getFullYear() + 1 };
  }
}

export async function loadHoliday(slug: string) {
  try {
    const response = await supabase.functions.invoke('holiday_detail', {
      body: { slug }
    });
    return response.data;
  } catch (error) {
    console.error('Error loading holiday:', error);
    return null;
  }
}

export async function loadSchoolCalendar(schoolYear?: string) {
  try {
    const yearParam = schoolYear || `${new Date().getFullYear()}-${new Date().getFullYear() + 1}`;
    const { data: periods } = await supabase
      .from('school_calendar')
      .select('*')
      .eq('school_year', yearParam)
      .order('starts_on');
    
    return {
      periods: periods || [],
      schoolYear: yearParam
    };
  } catch (error) {
    console.error('Error loading school calendar:', error);
    const fallbackYear = schoolYear || `${new Date().getFullYear()}-${new Date().getFullYear() + 1}`;
    return { periods: [], schoolYear: fallbackYear };
  }
}

export async function loadExams(year?: number) {
  try {
    const currentYear = year || new Date().getFullYear();
    const { data: exams } = await supabase
      .from('exam')
      .select(`
        *,
        phases:exam_phase (*)
      `)
      .in('year', [currentYear, currentYear + 1])
      .order('year', { ascending: false });
    
    return {
      exams: exams || [],
      currentYear
    };
  } catch (error) {
    console.error('Error loading exams:', error);
    const fallbackYear = year || new Date().getFullYear();
    return { exams: [], currentYear: fallbackYear };
  }
}

export async function loadExam(slug: string) {
  try {
    const { data: exam } = await supabase
      .from('exam')
      .select('*')
      .eq('slug', slug)
      .single();
    
    if (!exam) return null;
    
    const { data: phases } = await supabase
      .from('exam_phase')
      .select('*')
      .eq('exam_id', exam.id)
      .order('starts_on');
    
    return {
      exam,
      phases: phases || []
    };
  } catch (error) {
    console.error('Error loading exam:', error);
    return null;
  }
}

export async function loadMoviesHome() {
  try {
    const today = new Date().toISOString().split('T')[0];
    const twoMonthsBack = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const twoMonthsAhead = new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    // In cinema now (released in last 60 days)
    const { data: inCinema } = await supabase
      .from('movie')
      .select('id, title, slug, poster_path, overview, genres, runtime, popularity, cinema_release_ro')
      .gte('cinema_release_ro', twoMonthsBack)
      .lte('cinema_release_ro', today)
      .order('popularity', { ascending: false })
      .limit(12);

    // Coming to cinema this month + next
    const currentMonth = new Date();
    const nextMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1);
    const endNextMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 2, 0);

    const { data: comingToCinema } = await supabase
      .from('movie')
      .select('id, title, slug, poster_path, overview, genres, runtime, popularity, cinema_release_ro')
      .gte('cinema_release_ro', currentMonth.toISOString().split('T')[0])
      .lte('cinema_release_ro', endNextMonth.toISOString().split('T')[0])
      .order('cinema_release_ro', { ascending: true })
      .limit(12);

    // Coming to streaming (next 60 days)
    const { data: comingToStreaming } = await supabase
      .from('movie_platform')
      .select(`
        available_from,
        movie:movie_id (
          id, title, slug, poster_path, overview, genres, runtime, popularity
        ),
        platform:platform_id (name, slug)
      `)
      .gte('available_from', today)
      .lte('available_from', twoMonthsAhead)
      .order('available_from', { ascending: true })
      .limit(20);

    return {
      inCinema: inCinema || [],
      comingToCinema: comingToCinema || [],
      comingToStreaming: comingToStreaming || []
    };
  } catch (error) {
    console.error('Error loading movies home:', error);
    return {
      inCinema: [],
      comingToCinema: [],
      comingToStreaming: []
    };
  }
}

export async function loadMoviesMonth(year: string, month: string) {
  try {
    const startDate = `${year}-${month.padStart(2, '0')}-01`;
    const endDate = new Date(parseInt(year), parseInt(month), 0).toISOString().split('T')[0];

    // Cinema releases this month
    const { data: cinemaMovies } = await supabase
      .from('movie')
      .select('id, title, slug, poster_path, overview, genres, runtime, popularity, cinema_release_ro')
      .gte('cinema_release_ro', startDate)
      .lte('cinema_release_ro', endDate)
      .order('cinema_release_ro', { ascending: true });

    // Streaming releases this month
    const { data: streamingMovies } = await supabase
      .from('movie_platform')
      .select(`
        available_from,
        movie:movie_id (
          id, title, slug, poster_path, overview, genres, runtime, popularity
        ),
        platform:platform_id (name, slug)
      `)
      .gte('available_from', startDate)
      .lte('available_from', endDate)
      .order('available_from', { ascending: true });

    return {
      cinemaMovies: cinemaMovies || [],
      streamingMovies: streamingMovies || [],
      year,
      month
    };
  } catch (error) {
    console.error('Error loading movies month:', error);
    return {
      cinemaMovies: [],
      streamingMovies: [],
      year,
      month
    };
  }
}

export async function loadMovie(slug: string) {
  try {
    // Try by slug first
    let { data: movie } = await supabase
      .from('movie')
      .select(`
        *,
        platforms:movie_platform(
          available_from,
          url,
          platform:platform_id(name, slug)
        )
      `)
      .eq('slug', slug)
      .single();

    // Fallback to tmdb_id if no slug match
    if (!movie && /^\d+$/.test(slug)) {
      const { data: movieByTmdb } = await supabase
        .from('movie')
        .select(`
          *,
          platforms:movie_platform(
            available_from,
            url,
            platform:platform_id(name, slug)
          )
        `)
        .eq('tmdb_id', parseInt(slug))
        .single();
      movie = movieByTmdb;
    }

    if (!movie) return null;

    // Determine next relevant date
    const today = new Date().toISOString().split('T')[0];
    let nextDate = null;

    // Priority 1: Cinema release (if future)
    if (movie.cinema_release_ro && movie.cinema_release_ro > today) {
      nextDate = {
        date: movie.cinema_release_ro,
        type: 'cinema',
        platform: 'Cinema'
      };
    } else {
      // Priority 2: Next streaming date
      const futureStreaming = movie.platforms
        ?.filter((p: any) => p.available_from && p.available_from > today)
        ?.sort((a: any, b: any) => a.available_from.localeCompare(b.available_from));

      if (futureStreaming?.[0]) {
        nextDate = {
          date: futureStreaming[0].available_from,
          type: 'streaming',
          platform: futureStreaming[0].platform.name
        };
      } else if (movie.cinema_release_ro && movie.cinema_release_ro <= today) {
        // Already released in cinema
        nextDate = {
          date: movie.cinema_release_ro,
          type: 'released',
          platform: 'Cinema'
        };
      }
    }

    return {
      ...movie,
      next_date: nextDate
    };
  } catch (error) {
    console.error('Error loading movie:', error);
    return null;
  }
}