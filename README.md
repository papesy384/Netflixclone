1. Project Vision
The Social Sofa is a high-fidelity Netflix clone designed to solve the "isolation" of modern streaming. It transforms passive viewing into an active social event by synchronizing video playback across multiple devices and providing integrated real-time communication tools.
2. Core Functional Requirements
2.1 Synchronization Engine (P0)
Master-Remote Logic: One user (the Host) controls the timeline. Play, Pause, and Seek events must propagate to all guests via Supabase Broadcast.
Initial State Sync: New joiners must automatically fetch the current last_timestamp and is_playing status from the database to "snap" to the current playback position immediately upon entering the room.
Drift Management: System must check synchronization every 5 seconds. If a guest is  seconds off from the host, the player must force-seek to the correct timestamp to maintain unity.
Host Handover: If the current Host disconnects (detected via Presence), the system must automatically promote the next active user in the Presence list to Host status to prevent room stagnation.
2.2 Content Discovery (P1)
TMDB Integration: Dynamic fetching of "Trending" and "Top Rated" movies for the dashboard/landing page.
Media Strategy: For the MVP, video_id will resolve to high-quality YouTube embeds or open-source HLS test streams to ensure legal and technical reliability during the demo.
Dynamic Routing: Each movie selection generates a unique watch/[roomId] where the party takes place.
2.3 Social Command Center (P1)
Real-time Chat: A persistent sidebar using Supabase Postgres Changes for history and Realtime for instant delivery.
Presence Tracking: Visual indicators showing exactly who is online. Display "User is typing..." states to increase social engagement.
Emoji Reactions: A "quick-tap" reaction bar that broadcasts floating SVGs over the video player using CSS animations.
3. Technical Specification
3.1 Database Schema (Supabase)
Table: rooms
id: UUID (Primary Key)
video_id: String (TMDB ID or YouTube ID)
is_playing: Boolean
last_timestamp: Float
host_id: UUID (Reference to the user currently in control)
Table: messages
id: BigInt
room_id: UUID (Foreign Key)
user_name: Text (Display name)
content: Text
created_at: Timestamp
3.2 Frontend Architecture (Next.js)
Video Player: react-player (configured for YouTube and HLS).
Real-time Layer: Supabase Realtime (Broadcast for playback commands, Presence for user lists).
Styling: Tailwind CSS with a "Netflix Dark" palette (#141414, #E50914).
4. User Experience (UX) Flow
Landing: User discovers trending movies via the TMDB-powered hero and slider components.
Creation: User clicks "Start Party" which initializes a row in the rooms table.
Invitation: A "Copy Invite Link" button provides the unique room URL for distribution.
Party: Participants join, snap to the host's time, and interact via the sidebar.
5. Success Metrics (The "5-Day" Bar)
Sync Latency: < 500ms broadcast delay.
Recovery: Users must be able to refresh their browser and resume the party within 2 seconds.
Responsive Design: Zero horizontal scrolling on mobile devices; chat collapses into an overlay.
6. Security & RLS (Row Level Security)
Public Access: Rooms are viewable by anyone with the link.
Write Access: Anon/Authenticated users can insert into messages.
Broadcast Permissions: Explicitly granted to the anon role for Realtime Broadcast events to facilitate the demo.
