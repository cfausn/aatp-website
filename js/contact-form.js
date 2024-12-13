import config from './config.js';

(function() {
    emailjs.init(config.emailjs.publicKey);
    console.log('EmailJS initialized');
})();

async function handleSubmit(event) {
    event.preventDefault();
    event.stopPropagation();
    console.log('Form submitted');
    
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const subject = document.getElementById('subject').value;
    const message = document.getElementById('message').value;
    
    console.log('Form data:', { name, email, subject, message });
    
    try {
        console.log('Attempting to send email with:', {
            serviceId: config.emailjs.serviceId,
            templateId: config.emailjs.templateId
        });

        const response = await emailjs.send(
            config.emailjs.serviceId,
            config.emailjs.templateId,
            {
                from_name: name,
                from_email: email,
                subject: `Website Submission: ${subject}`,
                message: message,
                to_email: "austinandthepowers@gmail.com"
            }
        );

        console.log('EmailJS Response:', response);

        if (response.status === 200) {
            alert('Thank you for your message! We will get back to you soon.');
            document.getElementById('contactForm').reset();
        } else {
            throw new Error(`Failed to send message: ${response.text}`);
        }
    } catch (error) {
        console.error('Detailed Error:', error);
        alert('Sorry, there was an error sending your message. Please try again later.');
    }

    return false;
}

window.handleSubmit = handleSubmit; 