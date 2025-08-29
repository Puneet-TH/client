# DailyTube Frontend

🚀 **Live Demo:** [https://dailytube.vercel.app/](https://dailytube.vercel.app/)
🚀 **Its backend:** [https://github.com/Puneet-TH/backend](https://github.com/Puneet-TH/backend)


 A modern, responsive React (Vite) frontend for the DailyTube video-sharing platform. This app provides a YouTube-like user experience with video browsing, channel pages, subscriptions, playlists, comments, and more.

 ## Features
 - **Authentication:** Login, registration, and protected routes
 - **Video Feed:** Trending, search, and personalized video recommendations
 - **Channel Pages:** View user profiles, subscribe/unsubscribe, see playlists and tweets
 - **Video Player:** Watch videos, like, comment, and share
 - **Playlists:** Create and manage playlists
 - **Subscriptions:** Subscribe to channels and view your subscriptions
 - **Tweets:** Microblogging for users
 - **Responsive Design:** Fully mobile-friendly with modern UI/UX
 - **Dark Mode:** Sleek dark theme by default
 - **Notifications:** Toasts for actions and errors

 ## Tech Stack
 - **React** (Vite)
 - **Tailwind CSS**
 - **React Router**
 - **Axios** (API calls)
 - **Cloudinary** (media hosting)
 - **react-hot-toast** (notifications)

 ## Getting Started

 ### Prerequisites
 - Node.js (v18+ recommended)
 - DailyTube backend API running (see backend repo)

 ### Installation
 1. Clone the repository:
	 ```bash
	 git clone <your-frontend-repo-url>
	 cd dailytube
	 ```
 2. Install dependencies:
	 ```bash
	 npm install
	 ```
 3. Create a `.env` file in the root directory and add:
	 ```env
	 VITE_API_URL=https://your-backend-api-url/api/v1
	 ```
 4. Start the development server:
	 ```bash
	 npm run dev
	 ```

 ## Folder Structure
 ```
 dailytube/
	src/
	  components/
	  pages/
	  services/
	  contexts/
	  hooks/
	  utils/
	public/
	package.json
	.env
	README.md
 ```

 ## Deployment
 - Deploy on Vercel, Netlify, or your preferred static hosting
 - Set the `VITE_API_URL` environment variable in your deployment settings

 ## Contributing
 Pull requests are welcome! For major changes, please open an issue first to discuss what you would like to change.

 ## License
 [MIT](LICENSE)