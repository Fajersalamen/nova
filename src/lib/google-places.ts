export interface GoogleReview {
  authorName: string;
  rating: number;
  text: string;
  relativeTimeDescription: string;
  profilePhotoUrl: string | null;
}

interface PlacesDetailsResponse {
  result?: {
    reviews?: Array<{
      author_name: string;
      rating: number;
      text: string;
      relative_time_description: string;
      profile_photo_url?: string;
    }>;
    rating?: number;
    user_ratings_total?: number;
  };
  status: string;
}

/**
 * Fetches reviews for a restaurant from the Google Places Details API.
 * Callers are expected to cache/revalidate this (see the [slug] page's
 * `revalidate` export) — Places API usage is billed per request, so this
 * should never be called on every visitor hit.
 */
export async function fetchGoogleReviews(placeId: string): Promise<{
  reviews: GoogleReview[];
  averageRating: number | null;
  totalRatings: number | null;
}> {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  if (!apiKey) {
    return { reviews: [], averageRating: null, totalRatings: null };
  }

  const url = new URL('https://maps.googleapis.com/maps/api/place/details/json');
  url.searchParams.set('place_id', placeId);
  url.searchParams.set('fields', 'reviews,rating,user_ratings_total');
  url.searchParams.set('key', apiKey);

  const res = await fetch(url, { next: { revalidate: 21600 } }); // 6 hours
  if (!res.ok) {
    return { reviews: [], averageRating: null, totalRatings: null };
  }

  const data = (await res.json()) as PlacesDetailsResponse;
  if (data.status !== 'OK' || !data.result) {
    return { reviews: [], averageRating: null, totalRatings: null };
  }

  return {
    reviews: (data.result.reviews ?? []).map((r) => ({
      authorName: r.author_name,
      rating: r.rating,
      text: r.text,
      relativeTimeDescription: r.relative_time_description,
      profilePhotoUrl: r.profile_photo_url ?? null,
    })),
    averageRating: data.result.rating ?? null,
    totalRatings: data.result.user_ratings_total ?? null,
  };
}
