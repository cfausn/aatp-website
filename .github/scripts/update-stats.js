const fs = require('fs');
const https = require('https');
const zlib = require('zlib');

const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY;

async function makeRequest(trackId) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'songstats.p.rapidapi.com',
            path: `/tracks/stats?source=spotify&spotify_track_id=${trackId}&with_playlists=false&with_charts=false&with_videos=false&with_links=false`,
            method: 'GET',
            headers: {
                'x-rapidapi-host': 'songstats.p.rapidapi.com',
                'x-rapidapi-key': RAPIDAPI_KEY,
                'accept': 'application/json',
                'accept-encoding': 'gzip'
            }
        };

        const req = https.request(options, (res) => {
            const encoding = res.headers['content-encoding'];
            let buffer = [];

            const stream = encoding === 'gzip' ? res.pipe(zlib.createGunzip()) : res;

            stream.on('data', (chunk) => {
                buffer.push(chunk);
            });

            stream.on('end', () => {
                const data = Buffer.concat(buffer).toString();
                try {
                    resolve(JSON.parse(data));
                } catch (e) {
                    console.error('Error parsing JSON:', e);
                    reject(e);
                }
            });

            stream.on('error', (e) => {
                console.error('Stream error:', e);
                reject(e);
            });
        });
        
        req.on('error', (e) => {
            console.error('Request error:', e);
            reject(e);
        });
        req.end();
    });
}

async function updateStats() {
    try {
        // Read current stats
        const statsFile = fs.readFileSync('js/song-stats.json', 'utf8');
        const stats = JSON.parse(statsFile);
        let updatedCount = 0;

        // Process each song
        for (const [songName, songData] of Object.entries(stats.songs)) {
            try {
                console.log(`Fetching stats for: ${songName}`);
                const songStats = await makeRequest(songData.spotify_id);

                if (songStats.result === 'success' && 
                    songStats.stats && 
                    songStats.stats[0] && 
                    songStats.stats[0].data && 
                    songStats.stats[0].data.streams_total) {
                    
                    stats.songs[songName].streams = songStats.stats[0].data.streams_total;
                    updatedCount++;
                    console.log(`Updated ${songName} with ${songStats.stats[0].data.streams_total} streams`);
                } else {
                    console.log(`Skipping ${songName} - No valid data returned`);
                }

                // Add a delay between requests to respect rate limits
                await new Promise(resolve => setTimeout(resolve, 1000));
                
            } catch (error) {
                console.error(`Error updating ${songName}:`, error);
                continue; // Skip to next song on error
            }
        }

        if (updatedCount > 0) {
            stats.last_updated = new Date().toISOString().split('T')[0];
            fs.writeFileSync('js/song-stats.json', JSON.stringify(stats, null, 2));
            console.log(`Successfully updated ${updatedCount} songs`);
        } else {
            console.log('No songs were updated');
        }
    } catch (error) {
        console.error('Error in updateStats:', error);
        process.exit(1);
    }
}

updateStats();