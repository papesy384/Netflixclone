export type MockMovie = {
  id: string;
  title: string;
  year: number;
  poster: string;
  videoId: string;
};

export const MOCK_MOVIES: MockMovie[] = [
  { id: "1", title: "Inception", year: 2010, poster: "https://picsum.photos/seed/inception/300/450", videoId: "YoHD9XEInc0" },
  { id: "2", title: "The Dark Knight", year: 2008, poster: "https://picsum.photos/seed/darkknight/300/450", videoId: "EXeTwQWrcwY" },
  { id: "3", title: "Avatar", year: 2009, poster: "https://picsum.photos/seed/avatar/300/450", videoId: "5PSNL1qE6VY" },
  { id: "4", title: "Titanic", year: 1997, poster: "https://picsum.photos/seed/titanic/300/450", videoId: "CHekzSiZjrY" },
  { id: "5", title: "Jurassic Park", year: 1993, poster: "https://picsum.photos/seed/jurassic/300/450", videoId: "QWBKEmWWL38" },
  { id: "6", title: "The Avengers", year: 2012, poster: "https://picsum.photos/seed/avengers/300/450", videoId: "eOrNdBpGMv8" },
  { id: "7", title: "Star Wars: The Force Awakens", year: 2015, poster: "https://picsum.photos/seed/starwars/300/450", videoId: "sGbxmsDFVnE" },
  { id: "8", title: "The Matrix", year: 1999, poster: "https://picsum.photos/seed/matrix/300/450", videoId: "vKQi3bBA1y8" },
  { id: "9", title: "Pulp Fiction", year: 1994, poster: "https://picsum.photos/seed/pulpfiction/300/450", videoId: "s7EdQ4FqbhY" },
  { id: "10", title: "Forrest Gump", year: 1994, poster: "https://picsum.photos/seed/forrest/300/450", videoId: "bLvqoHBptjg" },
];
