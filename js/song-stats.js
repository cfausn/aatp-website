async function updateStreamCounts() {
    try {
        const response = await fetch('js/song-stats.json');
        const stats = await response.json();

        const albums = document.querySelectorAll('.single-album');
        
        albums.forEach(album => {
            const titleElement = album.querySelector('h5');
            const streamCountElement = album.querySelector('p');
            
            if (titleElement && streamCountElement) {
                const songName = titleElement.textContent;
                const songStats = stats.songs[songName];
                
                if (songStats) {
                    const streams = songStats.streams.toLocaleString();
                    streamCountElement.textContent = `${streams} streams`;
                    
                    const parentLink = titleElement.parentElement;
                    if (parentLink && parentLink.tagName === 'A') {
                        const spotifyUrl = `https://open.spotify.com/track/${songStats.spotify_id}`;
                        parentLink.href = spotifyUrl;
                        parentLink.target = '_blank';
                        parentLink.rel = 'noopener noreferrer';
                        
                        parentLink.addEventListener('click', (e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            window.open(spotifyUrl, '_blank', 'noopener,noreferrer');
                        });
                    }
                }
            }
        });
    } catch (error) {
        console.error('Error updating stream counts:', error);
    }
}

// Update counts when page loads
document.addEventListener('DOMContentLoaded', updateStreamCounts); 