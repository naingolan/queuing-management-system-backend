const AfricasTalking = require('africastalking');

const username = 'sandbox';
const apiKey = 'd483bd325dd453eff3c220f98d234bb96dab1922214221e0be2518c6a5a5c36b';

// Initialize Africa's Talking SDK
const africasTalking = AfricasTalking({
  username,
  apiKey,
});

// Create an instance of the SMS service
const sms = africasTalking.SMS;

// Function to send an SMS
function sendSMS(recipient, message) {
  const options = {
    to: [recipient],
    message: message,
  };

  sms
    .send(options)
    .then((response) => {
      console.log('SMS sent successfully:', response);
    })
    .catch((error) => {
      console.error('Error sending SMS:', error);
    });
}

// // Usage example
// const recipientNumber = '+255758224960'; 
// const message = 'Thank you for subscribing to IFM-Queiuing Management System, you will be informed when your turn is near.'; 

// sendSMS(recipientNumber, message);


module.exports = { sendSMS };