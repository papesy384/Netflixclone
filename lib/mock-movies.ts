export type MockMovie = {
  id: string;
  title: string;
  year: number;
  poster: string;
  videoUrl: string;
};

// Direct MP4 URLs - no YouTube, works without VPN (Google sample bucket)
const BASE = "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample";
const DIRECT_VIDEOS = [
  `${BASE}/BigBuckBunny.mp4`,
  `${BASE}/Sintel.mp4`,
  `${BASE}/TearsOfSteel.mp4`,
  `${BASE}/ElephantsDream.mp4`,
  `${BASE}/ForBiggerFun.mp4`,
  `${BASE}/BigBuckBunny.mp4`,
  `${BASE}/Sintel.mp4`,
  `${BASE}/TearsOfSteel.mp4`,
  `${BASE}/ElephantsDream.mp4`,
  `${BASE}/ForBiggerBlazes.mp4`,
];

export const MOCK_MOVIES: MockMovie[] = [
  { id: "1", title: "Big Buck Bunny", year: 2008, poster: "https://picsum.photos/seed/bunny/300/450", videoUrl: DIRECT_VIDEOS[0]! },
  { id: "2", title: "Sintel", year: 2010, poster: "https://picsum.photos/seed/sintel/300/450", videoUrl: DIRECT_VIDEOS[1]! },
  { id: "3", title: "Tears of Steel", year: 2012, poster: "https://picsum.photos/seed/tears/300/450", videoUrl: DIRECT_VIDEOS[2]! },
  { id: "4", title: "Elephants Dream", year: 2006, poster: "https://picsum.photos/seed/elephants/300/450", videoUrl: DIRECT_VIDEOS[3]! },
  { id: "5", title: "For Bigger Fun", year: 2014, poster: "https://picsum.photos/seed/fun/300/450", videoUrl: DIRECT_VIDEOS[4]! },
  { id: "6", title: "Big Buck Bunny 2", year: 2008, poster: "https://picsum.photos/seed/bunny2/300/450", videoUrl: DIRECT_VIDEOS[5]! },
  { id: "7", title: "Sintel Short", year: 2010, poster: "https://picsum.photos/seed/sintel2/300/450", videoUrl: DIRECT_VIDEOS[6]! },
  { id: "8", title: "Tears of Steel 2", year: 2012, poster: "https://picsum.photos/seed/tears2/300/450", videoUrl: DIRECT_VIDEOS[7]! },
  { id: "9", title: "Elephants Dream 2", year: 2006, poster: "https://picsum.photos/seed/elephants2/300/450", videoUrl: DIRECT_VIDEOS[8]! },
  { id: "10", title: "For Bigger Blazes", year: 2014, poster: "https://picsum.photos/seed/blazes/300/450", videoUrl: DIRECT_VIDEOS[9]! },
];
