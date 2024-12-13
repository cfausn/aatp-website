const SPOTIFY_TRACKS = {
    'Thinking': 'SPOTIFY_TRACK_ID_1',
    'Im (Not) Okay': 'SPOTIFY_TRACK_ID_2',
    'Colorado': 'SPOTIFY_TRACK_ID_3',
    'Heads Up': 'SPOTIFY_TRACK_ID_4',
    'Nexus (Is It Over)': 'SPOTIFY_TRACK_ID_5',
    'Echoes': 'SPOTIFY_TRACK_ID_6',
    'Empty Thoughts': 'SPOTIFY_TRACK_ID_7',
    'Looking Up (The End)': 'SPOTIFY_TRACK_ID_8'
};

async function getSpotifyToken() {
    const response = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': 'Basic ' + btoa(CLIENT_ID + ':' + CLIENT_SECRET)
        },
        body: 'grant_type=client_credentials'
    });
    const data = await response.json();
    return data.access_token;
}

async function getTrackPlayCount(trackId, token) {
    const response = await fetch(`https://api.spotify.com/v1/tracks/${trackId}`, {
        headers: {
            'Authorization': 'Bearer ' + token
        }
    });
    const data = await response.json();
    return data.popularity; // Note: Spotify doesn't provide exact stream counts, only popularity score
}

async function updateStreamCounts() {
    try {
        const token = await getSpotifyToken();
        const albums = document.querySelectorAll('.single-album');
        
        for (const album of albums) {
            const titleElement = album.querySelector('h5');
            const streamCountElement = album.querySelector('p');
            
            if (titleElement && streamCountElement) {
                const trackTitle = titleElement.textContent;
                const trackId = SPOTIFY_TRACKS[trackTitle];
                
                if (trackId) {
                    const popularity = await getTrackPlayCount(trackId, token);
                    streamCountElement.textContent = `Popularity: ${popularity}%`;
                }
            }
        }
    } catch (error) {
        console.error('Error updating stream counts:', error);
    }
}

// Update counts when page loads
document.addEventListener('DOMContentLoaded', updateStreamCounts); 