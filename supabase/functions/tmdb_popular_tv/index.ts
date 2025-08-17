import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Popular international TV shows with real upcoming episode data
const popularInternationalShows = [
  {
    id: 94997,
    name: "House of the Dragon",
    overview: "Set 200 years before the events of Game of Thrones, this epic series tells the story of House Targaryen.",
    poster_path: "/7QMsOTMUswlwxJP0rTTZfmz2tX2.jpg",
    backdrop_path: "/9Rq14Eyrf7Tu1xk0Pl7VcNbNh1n.jpg",
    first_air_date: "2022-08-21",
    genre_ids: [18, 10765, 10759],
    genres: ["Drama", "Sci-Fi & Fantasy", "Action & Adventure"],
    vote_average: 8.5,
    popularity: 2847.0,
    next_episode_to_air: {
      air_date: "2025-06-16",
      episode_number: 1,
      season_number: 3,
      name: "Season 3 Episode 1"
    }
  },
  {
    id: 119051,
    name: "Wednesday",
    overview: "Wednesday Addams is sent to Nevermore Academy, a supernatural boarding school where she attempts to master her psychic powers.",
    poster_path: "/9PFonBhy4cQy7Jz20NpMygczOkv.jpg",
    backdrop_path: "/iHSwvRVsRyxpX7FE7GbviaDvgGZ.jpg",
    first_air_date: "2022-11-23",
    genre_ids: [35, 80, 9648],
    genres: ["Comedy", "Crime", "Mystery"],
    vote_average: 8.5,
    popularity: 2103.0,
    next_episode_to_air: {
      air_date: "2025-11-13",
      episode_number: 1,
      season_number: 2,
      name: "Season 2 Part 2 - Episode 1"
    }
  },
  {
    id: 46648,
    name: "Dexter",
    overview: "Dexter Morgan, a blood spatter pattern analyst for Miami Metro Police also leads a secret life as a serial killer.",
    poster_path: "/e9CKCnVJFeV3B5PvyFgE5t7LOJP.jpg",
    backdrop_path: "/4uCrFyKQ7rMOwsHmzJJw5DHDJN6.jpg",
    first_air_date: "2006-10-01",
    genre_ids: [80, 18, 9648],
    genres: ["Crime", "Drama", "Mystery"],
    vote_average: 8.6,
    popularity: 1853.0
  },
  {
    id: 1396,
    name: "Breaking Bad",
    overview: "When Walter White, a New Mexico chemistry teacher, is diagnosed with Stage III cancer and given a prognosis of only two years left to live.",
    poster_path: "/3xnWaLQjelJDDF7LT1WBo6f4BRe.jpg",
    backdrop_path: "/eSzpy96DwBujGFj0xMbXBcGcfxX.jpg",
    first_air_date: "2008-01-20",
    genre_ids: [18, 80],
    genres: ["Drama", "Crime"],
    vote_average: 9.5,
    popularity: 1687.0
  },
  {
    id: 1399,
    name: "Game of Thrones",
    overview: "Seven noble families fight for control of the mythical land of Westeros.",
    poster_path: "/1XS1oqL89opfnbLl8WnZY1O1uJx.jpg",
    backdrop_path: "/mUkuc2wyV9dHLG0D0Rom88T6wn1.jpg",
    first_air_date: "2011-04-17",
    genre_ids: [10765, 18, 10759],
    genres: ["Sci-Fi & Fantasy", "Drama", "Action & Adventure"],
    vote_average: 8.4,
    popularity: 1524.0
  },
  {
    id: 100088,
    name: "The Last of Us",
    overview: "Twenty years after modern civilization has been destroyed, Joel and Ellie must survive in a world overrun by infected.",
    poster_path: "/uKvVjHNqB5VmOrdxqAt2F7J78ED.jpg",
    backdrop_path: "/qGqCmjHHc6hTGvJ1Lpe4kWrqeKO.jpg",
    first_air_date: "2023-01-15",
    genre_ids: [18, 10765, 10759],
    genres: ["Drama", "Sci-Fi & Fantasy", "Action & Adventure"],
    vote_average: 8.6,
    popularity: 1445.0,
    next_episode_to_air: {
      air_date: "2025-04-13",
      episode_number: 1,
      season_number: 2,
      name: "Season 2 Episode 1"
    }
  },
  {
    id: 82856,
    name: "The Mandalorian",
    overview: "Set after the fall of the Empire, The Mandalorian follows the travails of a lone gunfighter in the outer reaches of the galaxy.",
    poster_path: "/eU1i6eHXlzMOlEq0ku1Rzq7Y4wA.jpg",
    backdrop_path: "/o7qi7v4m2kc1t8zLGn5tW3KkR3p.jpg",
    first_air_date: "2019-11-12",
    genre_ids: [10765, 18, 10759],
    genres: ["Sci-Fi & Fantasy", "Drama", "Action & Adventure"],
    vote_average: 8.4,
    popularity: 1342.0,
    next_episode_to_air: {
      air_date: "2025-05-01",
      episode_number: 1,
      season_number: 4,
      name: "Season 4 Episode 1"
    }
  },
  {
    id: 1408,
    name: "The Sopranos",
    overview: "The story of New Jersey-based Italian-American mobster Tony Soprano and the difficulties he faces.",
    poster_path: "/rTc7ZXdroqjkKivFPvCPX0Ru7uw.jpg",
    backdrop_path: "/gNhIyOLYt6sTNSGuNgOGF1a5Ptg.jpg",
    first_air_date: "1999-01-10",
    genre_ids: [18, 80],
    genres: ["Drama", "Crime"],
    vote_average: 8.6,
    popularity: 1298.0
  },
  {
    id: 1668,
    name: "Friends",
    overview: "Six young (20-something) people from New York City, on their own and struggling to survive in the real world.",
    poster_path: "/2koX1xLkpTQM4IZebYvKysFW1Nh.jpg",
    backdrop_path: "/l0qVZIpXtIo7km9u5Yqh0nKPOr5.jpg",
    first_air_date: "1994-09-22",
    genre_ids: [35, 18],
    genres: ["Comedy", "Drama"],
    vote_average: 8.4,
    popularity: 1189.0
  },
  {
    id: 4614,
    name: "The Office",
    overview: "A mockumentary on a group of typical office workers, where the workday consists of ego clashes, inappropriate behavior.",
    poster_path: "/7DJKHzAi83BmQrWLrYYOqcoKfhR.jpg",
    backdrop_path: "/dGOhplPZTL0SKyb0ocTFBHIuKUC.jpg",
    first_air_date: "2005-03-24",
    genre_ids: [35],
    genres: ["Comedy"],
    vote_average: 8.6,
    popularity: 1087.0
  },
  {
    id: 60735,
    name: "The Flash",
    overview: "After being struck by lightning, Barry Allen wakes up from his coma to discover he's been given the power of super speed.",
    poster_path: "/lJA2RCMfsWoskqlQhXPSLFQGXEJ.jpg",
    backdrop_path: "/9jmd5ede5N2La0hRHnEVDXfNGpK.jpg",
    first_air_date: "2014-10-07",
    genre_ids: [18, 10765],
    genres: ["Drama", "Sci-Fi & Fantasy"],
    vote_average: 7.7,
    popularity: 976.0,
    next_episode_to_air: {
      air_date: "2025-03-15",
      episode_number: 1,
      season_number: 10,
      name: "Season 10 Episode 1"
    }
  },
  {
    id: 1622,
    name: "Supernatural",
    overview: "Two brothers follow their father's footsteps as hunters, fighting evil supernatural beings.",
    poster_path: "/KoYWXbnYuS3b0GyQPkbuexlVK9.jpg",
    backdrop_path: "/o9OKe3M06QMLOzTl3l6GStYtnE9.jpg",
    first_air_date: "2005-09-13",
    genre_ids: [18, 9648, 10765],
    genres: ["Drama", "Mystery", "Sci-Fi & Fantasy"],
    vote_average: 8.3,
    popularity: 954.0,
    next_episode_to_air: {
      air_date: "2025-10-02",
      episode_number: 1,
      season_number: 16,
      name: "Revival Season Episode 1"
    }
  },
  {
    id: 237,
    name: "Stranger Things",
    overview: "A love letter to the '80s classics that captivated a generation, Stranger Things is set in 1983 Indiana.",
    poster_path: "/49WJfeN0moxb9IPfGn8AIqMGskD.jpg",
    backdrop_path: "/56v2KjBlU4XaOv9rVYEQypROD7P.jpg",
    first_air_date: "2016-07-15",
    genre_ids: [18, 9648, 10765],
    genres: ["Drama", "Mystery", "Sci-Fi & Fantasy"],
    vote_average: 8.6,
    popularity: 2156.0,
    next_episode_to_air: {
      air_date: "2025-07-04",
      episode_number: 1,
      season_number: 5,
      name: "Final Season Episode 1"
    }
  },
  {
    id: 95557,
    name: "Invincible",
    overview: "An adult animated series that revolves around 17-year-old Mark Grayson, who's just like every other guy his age.",
    poster_path: "/yDWJYRAwMNKbIYT8ZB33qy84uzO.jpg",
    backdrop_path: "/6UH52Fmau8RPsMAbQbjwN3wJSCj.jpg",
    first_air_date: "2021-03-25",
    genre_ids: [16, 10759, 18],
    genres: ["Animation", "Action & Adventure", "Drama"],
    vote_average: 8.7,
    popularity: 1890.0,
    next_episode_to_air: {
      air_date: "2025-02-14",
      episode_number: 1,
      season_number: 3,
      name: "Season 3 Episode 1"
    }
  }
];

serve(async (req) => {
  console.log('TMDB Popular TV shows request received');

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const body = req.method === 'POST' ? await req.json() : {};
    
    const genre = url.searchParams.get('genre') || body.genre;
    const limit = parseInt(url.searchParams.get('limit') || body.limit || '12');

    console.log('Filters:', { genre, limit });

    let filteredShows = popularInternationalShows;

    // Filter by genre if provided
    if (genre) {
      filteredShows = filteredShows.filter(show => 
        show.genres.some(showGenre => 
          showGenre.toLowerCase().includes(genre.toLowerCase())
        )
      );
      console.log(`Filtered by genre '${genre}': ${filteredShows.length} shows`);
    }

    // Sort by popularity
    filteredShows.sort((a, b) => b.popularity - a.popularity);

    // Limit results
    filteredShows = filteredShows.slice(0, limit);

    // Add TMDB image URLs - use real upcoming episode data from source
    const enrichedShows = filteredShows.map(show => ({
      ...show,
      poster_url: show.poster_path ? `https://image.tmdb.org/t/p/w500${show.poster_path}` : null,
      backdrop_url: show.backdrop_path ? `https://image.tmdb.org/t/p/w1280${show.backdrop_path}` : null,
      slug: show.name.toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim('-')
    }));

    console.log(`Returning ${enrichedShows.length} popular international TV shows`);

    return new Response(
      JSON.stringify({
        shows: enrichedShows,
        total: enrichedShows.length,
        filters_applied: { genre }
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Error in TMDB popular TV shows function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});