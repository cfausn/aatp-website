import config from './config.js';

document.addEventListener('DOMContentLoaded', () => {
  fetchUpcomingEvents();
});

/**
 * Fetches upcoming events from Google Calendar Public API
 */
async function fetchUpcomingEvents() {
  try {
    // Get Google Calendar API configuration from config.js
    const { apiKey, calendarId } = config.googleCalendar;
    
    // URL for Google Calendar API - this is for public calendars
    const url = `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events?key=${apiKey}&timeMin=${new Date().toISOString()}&maxResults=5&singleEvents=true&orderBy=startTime`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error('Failed to fetch calendar events');
    }
    
    const data = await response.json();
    displayEvents(data.items || []);
  } catch (error) {
    console.error('Error fetching upcoming events:', error);
    document.getElementById('upcoming-shows-container').innerHTML = `
      <div class="col-12">
        <p class="text-center">Unable to load upcoming shows. Please check back later.</p>
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
  
  if (!events.length) {
    container.innerHTML = `
      <div class="col-12">
        <p class="text-center">No upcoming shows scheduled at this time. Check back soon!</p>
      </div>
    `;
    return;
  }
  
  // Create HTML for each event
  const eventsHTML = events.map(event => {
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
    
    return `
      <div class="col-12 col-md-6 col-lg-4">
        <div class="single-event-area mb-30">
          <div class="event-text">
            <h4>${event.summary}</h4>
            <div class="event-meta-data">
              <a href="#" class="event-place">${location}</a>
              <a href="#" class="event-date">${formattedDate}, ${formattedTime}</a>
            </div>
            ${event.htmlLink ? `<a href="${event.htmlLink}" target="_blank" class="btn oneMusic-btn">Event Details</a>` : ''}
          </div>
        </div>
      </div>
    `;
  }).join('');
  
  container.innerHTML = eventsHTML;
} 