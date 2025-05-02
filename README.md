# SportsPal App

A social sports app that helps users find games, organize activities, and connect with other sports enthusiasts.

## Backend Setup with Supabase

This project uses Supabase as the backend. To set up the backend:

1. Apply the SQL migrations in the `sql/migrations` folder to your Supabase project in the following order:
   - `0000_init/up.sql`
   - `0001_auth/up.sql`
   - `0002_games/up.sql`
   - `0003_social/up.sql`
   - `0004_venues/up.sql`
   - `0005_sample_data/up.sql` (optional, for testing)

2. Update the Supabase credentials in `lib/supabase.js`:
   ```javascript
   const supabaseUrl = 'https://your-project-id.supabase.co';
   const supabaseAnonKey = 'YOUR_SUPABASE_ANON_KEY';
   ```

3. Enable Email/Password authentication in your Supabase project:
   - Go to Authentication > Providers > Email
   - Enable "Email Signup"
   - Configure other settings as needed

## Getting Started

```bash
# Install dependencies
npm install

# Start the development server
npm run start

# Run on iOS
npm run ios

# Run on Android
npm run android
```

## Features

- **Authentication**: Sign up, login, and profile management
- **Games**: Find, join, and organize sports games
- **Venues**: Discover and book sports venues
- **Activities**: Track and share sports activities
- **Social**: Connect with friends and chat with other users
- **Wallet**: Manage in-app credits and transactions

## Tech Stack

- **Frontend**: React Native with Expo
- **Backend**: Supabase (PostgreSQL + Auth + Storage)
- **State Management**: Zustand
- **Navigation**: Expo Router
- **UI Components**: Custom components with Expo linear gradient

## Database Schema

The database schema includes tables for:

- Users and profiles
- Games and participants
- Activities and interactions
- Venues and bookings
- Social features (friendships, chat, notifications)
- Wallet and transactions

See `sql/README.md` for more details on the database schema.

## Contributing

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add some amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
