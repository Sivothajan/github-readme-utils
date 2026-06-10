# GitHub README Utils

A modern collection of utilities to enhance your GitHub README files with dynamic, visually appealing components. Generate streak cards, visitor counters, and more to make your profile stand out.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FSivothajan%2Fgithub-readme-utils&project-env=NEXT_PUBLIC_BASE_URL:your_base_url_here&project-env=GITHUB_TOKEN:your_github_token_here&project-env=KV_REST_API_URL:your_kv_url_here&project-env=KV_REST_API_TOKEN:your_kv_token_here)

## 🚀 Features

- **📊 Streak Cards**: Display GitHub contribution streaks with customizable themes and styling.
- **👁️ Visitor Counter**: Track profile or repository visits with animated SVG counters.
- **⚡ Modern Stack**: Rebuilt from the ground up using **Next.js 16**, **TypeScript**, and **Serverless Functions**.
- **🎨 Live Preview**: Real-time preview dashboard to generate your URLs.
- **🌓 Theme Support**: Dark and light mode compatible with preset themes.
- **🎯 Highly Customizable**: Control colors, locales, borders, and animations via URL parameters.

## 📋 Table of Contents

- [Demo](#-demo)
- [Getting Started](#-getting-started)
- [Usage](#-usage)
  - [Streak Card](#streak-card)
  - [Visitor Counter](#visitor-counter)
- [Available Themes](#-available-themes)
- [API Endpoints](#-api-endpoints)
- [Development](#%EF%B8%8F-development)
- [Deployment](#-deployment)
- [Credits & Inspiration](#-credits--inspiration)
- [License](#-license)

## 🌐 Demo

Visit the live application to try the interactive builders:  
**[https://readme-utils.vercel.app](https://readme-utils.vercel.app)**

## 🏁 Getting Started

### Prerequisites

- Node.js 18+
- bun, npm, yarn, or pnpm
- Redis instance (for visitor counter functionality)

### Installation

1. **Clone the repository:**

   ```bash
   git clone https://github.com/Sivothajan/github-readme-utils.git
   cd github-readme-utils
   ```

2. **Install dependencies:**

   ```bash
    # using bun
   bun install

    # or using npm
    npm install

    # or using yarn
    yarn install

    # or using pnpm
    pnpm install
   ```

3. **Configure Environment:**
   Create a `.env` file in the root directory:

   ```env
   # Required for generating absolute URLs
   NEXT_PUBLIC_BASE_URL=http://localhost:3000/

   # Required for visitor counter
   KV_REST_API_URL=your_redis_url
   KV_REST_API_TOKEN=your_redis_token
   ```

4. **Run the development server:**

   ```bash
   # using bun
   bun run dev

    # or using npm
    npm run dev

    # or using yarn
    yarn dev

    # or using pnpm
    pnpm dev
   ```

   Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📖 Usage

### Streak Card

Display your GitHub contribution streak with a beautiful card.

![Streak Card Example](https://readme-utils.vercel.app/streak?user=Sivothajan&theme=dark)

```markdown
![GitHub Streak](https://readme-utils.vercel.app/streak?user=your-username)
```

#### Customization Options

| Parameter       | Type    | Description                 | Default       |
| --------------- | ------- | --------------------------- | ------------- |
| `user`          | string  | GitHub username             | **Required**  |
| `theme`         | string  | Theme name (see list below) | `default`     |
| `hide_border`   | boolean | Hide card border            | `false`       |
| `border_radius` | number  | Border radius in pixels     | `4.5`         |
| `background`    | hex     | Background color            | Theme default |
| `date_format`   | string  | PHP-style date format       | `M j[, Y]`    |
| `mode`          | string  | `daily` or `weekly`         | `daily`       |

_For a full list of parameters including specific color overrides, visit the [/streak-preview](https://readme-utils.vercel.app/streak-preview) page._

### Visitor Counter

Track visits to your GitHub profile or repositories.

![Visitor Count](https://readme-utils.vercel.app/count/demo)

**Global Profile Counter:**

```markdown
![Visitor Count](https://readme-utils.vercel.app/count)
```

**Repository Specific Counter:**

```markdown
![Visitor Count](https://your-domain.com/count/username/repo-name)
```

## 🎨 Available Themes

The Streak Card supports various built-in themes. You can also use the [Streak Preview](https://readme-utils.vercel.app/streak-preview) Page to create your own.

| Theme            | Description                                                                                 |
| ---------------- | ------------------------------------------------------------------------------------------- |
| `default`        | Standard gray/white theme                                                                   |
| `dark`           | Dark mode optimized                                                                         |
| `highcontrast`   | High contrast for accessibility                                                             |
| `radical`        | Cyberpunk style colors                                                                      |
| `tokyonight`     | Tokyo Night color palette                                                                   |
| `solarized-dark` | Solarized Dark palette                                                                      |
| ...              | _Check the [Streak Preview](https://readme-utils.vercel.app/streak-preview) for all themes_ |

## 🔌 API Endpoints

### `GET /streak`

Renders a GitHub contribution streak card.

- **Returns:** `image/svg+xml` (default), `application/json`, or `image/png`

### `GET /count`

Returns an SVG displaying the visitor count.

- **Returns:** `image/svg+xml`
- **Logic:** Increments on view. Uses smart logic to avoid double-counting reload spams if configured.

## 🛠️ Development

### Project Structure

```text
github-readme-utils/
├── src/
│   ├── app/                    # Next.js App Router (API & Pages)
│   │   ├── streak/            # Streak endpoint
│   │   ├── count/             # Counter endpoint
│   ├── components/            # ShadCN UI Components
│   ├── lib/                   # Core Logic and Utilities
├── scripts/                   # Asset Generation Scripts
└── public/                    # Static Assets
```

### Key Technologies

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/)
- **Database**: Redis KV DB

## 🚀 Deployment

The easiest way to deploy is via Vercel.

1. Click the "Deploy" button at the top of this README.
2. Connect your GitHub repository.
3. Create a Redis KV database (Storage tab) and link it to the project.
4. Add your `NEXT_PUBLIC_BASE_URL`.

## 💡 Credits & Inspiration

This project is a modern TypeScript/Next.js port inspired by the amazing work of the open-source community.

**Original Projects:**

1. **[GitHub Readme Streak Stats](https://github.com/DenverCoder1/github-readme-streak-stats)** by [Jonah Lawrence](https://github.com/DenverCoder1)  
   _The original PHP implementation of the Streak Card._

2. **[GitHub Profile Views Counter](https://github.com/antonkomarev/github-profile-views-counter)** by [Anton Komarev](https://github.com/antonkomarev)  
   _The inspiration for the visitor counter logic._

This project aims to bring these utilities to a unified **Next.js** environment for easier self-hosting and extension.

## 📝 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

---

Made with ❤️ and ☕ by [Sivothayan](https://github.com/Sivothajan)
