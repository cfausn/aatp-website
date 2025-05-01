import config from './config.js';

document.addEventListener('DOMContentLoaded', () => {
  console.log('Upcoming shows component initialized');
  fetchUpcomingEvents();
});

/**
 * Fetches upcoming events from Google Calendar Public API
 */
async function fetchUpcomingEvents() {
  try {
    // Get Google Calendar API configuration from config.js
    const { apiKey, calendarId } = config.googleCalendar;
    
    console.log('Config loaded:', { 
      apiKey: apiKey ? 'API key exists' : 'API key missing', 
      calendarId: calendarId || 'Calendar ID missing' 
    });
    
    if (!apiKey || !calendarId || apiKey === 'YOUR_GOOGLE_API_KEY' || calendarId === 'YOUR_CALENDAR_ID') {
      throw new Error('Google Calendar API key or Calendar ID not configured');
    }
    
    // URL for Google Calendar API - this is for public calendars
    const url = `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events?key=${apiKey}&timeMin=${new Date().toISOString()}&maxResults=5&singleEvents=true&orderBy=startTime`;
    
    console.log('Fetching from URL:', url);
    
    const response = await fetch(url);
    console.log('Response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('API error details:', errorText);
      throw new Error(`Failed to fetch calendar events: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log('Events retrieved:', data.items ? data.items.length : 0);
    displayEvents(data.items || []);
  } catch (error) {
    console.error('Error fetching upcoming events:', error);
    document.getElementById('upcoming-shows-container').innerHTML = `
      <div class="col-12">
        <p class="text-center text-white">Unable to load upcoming shows: ${error.message}</p>
      </div>
    `;
  }
}

/**
 * Displays events in the upcoming shows section
 * @param {Array} events - Array of events from Google Calendar API
 */
function displayEvents(events) {
  const container = document.getElementById('upcoming-shows-container');
  console.log('Displaying events, container found:', !!container);
  
  if (!events.length) {
    container.innerHTML = `
      <div class="col-12">
        <p class="text-center text-white">No upcoming shows scheduled at this time. Check back soon!</p>
      </div>
    `;
    return;
  }
  
  try {
    // Create HTML for each event
    const eventsHTML = events.map(event => {
      console.log('Processing event:', event.summary);
      
      const startDate = new Date(event.start.dateTime || event.start.date);
      const formattedDate = startDate.toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
      
      const formattedTime = event.start.dateTime 
        ? startDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
        : 'All Day';
      
      const location = event.location || 'TBA';
      
      // Create Google Maps link for the location
      const mapsLink = location && location !== 'TBA' 
        ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location)}`
        : null;
      
      return `
        <div class="col-12 col-md-6 col-lg-4">
          <div class="single-event-area mb-30">
            <div class="event-text">
              <h4>${event.summary}</h4>
              <div class="event-meta-data">
                ${mapsLink 
                  ? `<a href="${mapsLink}" class="event-place" target="_blank" title="Open in Google Maps">${location}</a>` 
                  : `<span class="event-place">${location}</span>`
                }
                <a href="#" class="event-date">${formattedDate}, ${formattedTime}</a>
              </div>
              ${event.htmlLink ? `<a href="${event.htmlLink}" target="_blank" class="btn oneMusic-btn">Event Details</a>` : ''}
            </div>
          </div>
        </div>
      `;
    }).join('');
    
    container.innerHTML = eventsHTML;
    console.log('Events display complete');
  } catch (error) {
    console.error('Error displaying events:', error);
    container.innerHTML = `
      <div class="col-12">
        <p class="text-center text-white">Error displaying events: ${error.message}</p>
      </div>
    `;
  }
} 