# Live Auction Platform

A real-time auction platform built with Laravel, Inertia.js, and React. This platform enables users to participate in live auctions with real-time updates using Laravel Reverb for WebSocket connections.

##  Features

- Real-time bidding system
- Live auction updates
- User authentication and authorization
- Role-based access control using Spatie Permissions
- Modern and responsive UI with Tailwind CSS
- WebSocket integration with Laravel Reverb

##  Requirements

- PHP >= 8.2
- Node.js >= 16
- MySQL >= 8.0
- Composer
- npm

##  Tech Stack

- **Backend:**
  - Laravel 12.x
  - Spatie Permission (Role management)

- **Frontend:**
  - React 18
  - Inertia.js


- **Database:**
  - MySQL

##  Installation & Setup

```bash
# 1. Clone the repository
git clone https://github.com/mhd-janfishan/live_auction.git
cd live_auction

# 2. Install PHP dependencies
composer install

# 3. Install JavaScript dependencies
npm install

# 4. Configure environment
cp .env.example .env
php artisan key:generate

# 5. Configure your database in .env file
# Update these values in .env:
# DB_CONNECTION=mysql
# DB_HOST=127.0.0.1
# DB_PORT=3306
# DB_DATABASE=your_database_name
# DB_USERNAME=your_database_user
# DB_PASSWORD=your_database_password

# 6. Run database migrations and seeders
php artisan migrate --seed

# 7. Configure Reverb WebSocket server in .env
# Add these values:
# REVERB_APP_KEY=your_app_key
# REVERB_APP_SECRET=your_app_secret
# REVERB_APP_ID=your_app_id

# 8. Start the development servers
# In separate terminal windows:

# Terminal 1 - Laravel development server
php artisan serve

# Terminal 2 - Vite development server
npm run dev

```

