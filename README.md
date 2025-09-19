# Nextjs Template

Really fast nextjs template with web vitals and a config :)

## Getting Started

Here's how to get this project up and running on your local machine.

### Clone the Repository

First, clone the repository from gh:

```bash
git clone https://github.com/LydonDev/nextjs-template
cd preformance
```

### Install Dependencies

This project uses Bun as the package manager. Install all the required dependencies:

```bash
bun install
```

### Configure the Application

Before running the app, you'll need to set up your configuration:

1. Copy the example configuration file:
   ```bash
   cp example.config.toml config.toml
   ```

2. Open `config.toml` and adjust the settings as needed. The default configuration sets the app to run on port 5173 and enables web vitals tracking.

### Running the Application

For development, start the development server:

```bash
bun run dev
```

This will start the app in development mode. Open your browser and navigate to the port shown in your terminal (usually http://localhost:5173).

### Building for Production

When you're ready to deploy, build the application:

```bash
bun run build
```

Then serve the built application:

```bash
bun run start
```

This will serve the optimized production build using the serve package.
