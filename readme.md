# About ClimaVita
ClimaVita is a digital platform dedicated to showcasing real-world examples of how climate change affects health in the Americas. Our goal is to enhance awareness and provide accessible, concrete evidence of climate change’s impact, catering to public health professionals, journalists, policymakers, and the general public. Through ClimaVita, we strive to bring forth compelling narratives and data that highlight the urgency of addressing climate change in the context of global health.

**Link to project:** https://climavita.org 

## Features:
- **Concise Posting**: Users can create and upload posts that are brief yet impactful, with a maximum length of 280 characters. This format is inspired by Twitter, encouraging clear, punchy communication. Additional details and context can be added in the extended post body.
- **Advanced Filtering and Sorting**: Users can easily navigate through the content by applying filters based on region, country, and type of health impact. Sorting options further enhance the user experience, allowing for quick access to the most relevant posts.
- **Interactive Engagement**: The platform encourages interaction by enabling users to like, save, and comment on posts. This interaction not only enhances user engagement but also promotes discussion and knowledge sharing.

## How It's Made:
- **Back-End**: Node.js, Express
- **Database**: MongoDB
- **Front-End**: EJS, Tailwind CSS, JavaScript
- **Authentication**: Passport.js

## Next Steps

ClimaVita is continuously evolving. We are exploring the expansion of the platform to feature ongoing projects, plans, and response actions addressing health and climate change impacts across the Americas, uploaded by users. This expansion aims to foster enhanced collaboration among project planners and implementers, creating a dynamic platform for sharing progress, lessons learned, and inspiring examples.

## Feedback
Want to help improve ClimaVita? Please submit feedback and requests for new features to the ClimaVita feedback board https://climavita.canny.io/feedback-and-feature-requests

## Instructions 

1. Open the terminal and run "npm install -y"
2. In the config" folder, create a file called ".env"
3. In .env, type 
    DB_CONNECTION = (your database connection string goes here)
    Replace <password> in the string with your password
    If you want a custom database name (recommended), add the database name between mongodb.net/ and the ? in the string. Example: mongodb.net/BasicFullStackMVC?
4. Save!
5. In the terminal, type "npm start"
6. Open the browser to http://localhost:8500/ and you should see the homepage
