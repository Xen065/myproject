# EduMaster Web App - Deployment Guide

## Overview
This is the web version of EduMaster, a spaced repetition learning platform. The app has been converted from an Android native app to a web application suitable for deployment on Netlify.

## Features
- **Dashboard**: View study progress, streaks, and active courses
- **Study Mode**: Interactive flashcards with spaced repetition algorithm (SM-2)
- **Calendar**: Track study sessions and upcoming reviews
- **Store**: Browse available course packs
- **Profile**: View achievements, stats, and settings
- **Local Storage**: All data is saved locally in your browser

## Deploying to Netlify

### Option 1: Deploy from GitHub (Recommended)

1. Push this repository to GitHub
2. Log in to [Netlify](https://www.netlify.com/)
3. Click "Add new site" → "Import an existing project"
4. Select your GitHub repository
5. Configure build settings:
   - **Build command**: Leave empty (static site)
   - **Publish directory**: `public`
6. Click "Deploy site"

### Option 2: Manual Deploy via Netlify CLI

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login to Netlify
netlify login

# Deploy the site
netlify deploy --prod --dir=public
```

### Option 3: Drag and Drop Deploy

1. Go to [Netlify Drop](https://app.netlify.com/drop)
2. Drag and drop the `public` folder
3. Your site will be deployed instantly

## Project Structure

```
public/
├── index.html          # Main HTML file
├── styles.css          # All CSS styles
└── app.js              # Application logic and functionality

netlify.toml            # Netlify configuration
```

## Technologies Used

- **HTML5**: Semantic markup
- **CSS3**: Modern styling with CSS Grid and Flexbox
- **Vanilla JavaScript**: No framework dependencies
- **LocalStorage API**: Client-side data persistence

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Features Implemented

### Spaced Repetition Algorithm
The app uses a simplified SM-2 algorithm to schedule card reviews:
- Cards rated "Again" or "Hard" are reviewed more frequently
- Cards rated "Good" or "Easy" have longer intervals
- Ease factor adjusts based on performance

### Data Persistence
All data is stored in browser's localStorage:
- Flashcards and learning progress
- Study sessions and schedules
- User preferences

### Responsive Design
- Mobile-first design approach
- Optimized for screens from 320px to 768px+
- Touch-friendly interface

## Development

To run locally:

1. Clone the repository
2. Open `public/index.html` in a browser
3. Or use a local server:
   ```bash
   # Using Python
   cd public
   python -m http.server 8000

   # Using Node.js
   npx serve public
   ```

## Customization

### Adding New Courses
Edit the course data in `app.js`:

```javascript
const sampleCards = [
    {
        question: "Your question here",
        answer: "Your answer here",
        hint: "Optional hint",
        category: "category-name"
    }
];
```

### Changing Theme Colors
Edit CSS variables in `styles.css`:

```css
:root {
    --primary: #6366f1;
    --secondary: #8b5cf6;
    /* ... other colors */
}
```

## Performance

- No external dependencies
- Minimal CSS and JS (~50KB total)
- Fast initial load time
- Efficient rendering with vanilla JS

## Security

- No server-side code
- No external API calls
- Data stored locally only
- HTTPS enforced by Netlify
- Security headers configured in netlify.toml

## Future Enhancements

Potential features to add:
- [ ] Cloud sync with backend
- [ ] User authentication
- [ ] Course sharing and imports
- [ ] Statistics and analytics
- [ ] Dark mode
- [ ] Audio pronunciation
- [ ] Image support in flashcards
- [ ] Export/import data

## Support

For issues or questions:
- Open an issue in the GitHub repository
- Check the original Android app documentation

## License

This project is converted from the EduMaster Android app.

---

**Live Demo**: Your site will be available at `https://your-site-name.netlify.app` after deployment.
