export type MockMovie = {
  id: string;
  title: string;
  year: number;
  poster: string;
  videoId: string;
};

// All use embeddable video IDs (verified to play in iframes)
const EMBEDDABLE_VIDEOS = [
  "dQw4w9WgXcQ", // Reliably embeddable
  "jNQXAC9IVRw", // First YouTube video
  "9bZkp7q19f0", // Gangnam Style (official)
  "kJQP7kiw5Fk", // Despacito (official)
  "RgKAFK5djSk", // See You Again (official)
  "OPf0YbXqDm0", // Uptown Funk (official)
  "fJ9rUzIMcZQ", // Bohemian Rhapsody (official)
  "09R8_2nJtjg", // Shape of You (official)
  "y6120QOlsfU", // Blinding Lights (official)
  "2Vv-BfVoq4g", // Perfect (official)
];

export const MOCK_MOVIES: MockMovie[] = [
  { id: "1", title: "Inception", year: 2010, poster: "https://picsum.photos/seed/inception/300/450", videoId: EMBEDDABLE_VIDEOS[0]! },
  { id: "2", title: "The Dark Knight", year: 2008, poster: "https://picsum.photos/seed/darkknight/300/450", videoId: EMBEDDABLE_VIDEOS[1]! },
  { id: "3", title: "Avatar", year: 2009, poster: "https://picsum.photos/seed/avatar/300/450", videoId: EMBEDDABLE_VIDEOS[2]! },
  { id: "4", title: "Titanic", year: 1997, poster: "https://picsum.photos/seed/titanic/300/450", videoId: EMBEDDABLE_VIDEOS[3]! },
  { id: "5", title: "Jurassic Park", year: 1993, poster: "https://picsum.photos/seed/jurassic/300/450", videoId: EMBEDDABLE_VIDEOS[4]! },
  { id: "6", title: "The Avengers", year: 2012, poster: "https://picsum.photos/seed/avengers/300/450", videoId: EMBEDDABLE_VIDEOS[5]! },
  { id: "7", title: "Star Wars", year: 2015, poster: "https://picsum.photos/seed/starwars/300/450", videoId: EMBEDDABLE_VIDEOS[6]! },
  { id: "8", title: "The Matrix", year: 1999, poster: "https://picsum.photos/seed/matrix/300/450", videoId: EMBEDDABLE_VIDEOS[7]! },
  { id: "9", title: "Pulp Fiction", year: 1994, poster: "https://picsum.photos/seed/pulpfiction/300/450", videoId: EMBEDDABLE_VIDEOS[8]! },
  { id: "10", title: "Forrest Gump", year: 1994, poster: "https://picsum.photos/seed/forrest/300/450", videoId: EMBEDDABLE_VIDEOS[9]! },
];
