# 🌎 Racool_App

**Prototype of the Racool Project by Bastien Notéris**  
## 🖥️ Run the App

### Local Development (with Express server)

Start the server:

```bash
node server.js
```

If everything is set up correctly, you'll see:

```
Server running at http://localhost:3000/
```

Then open your browser and visit 👉 [http://localhost:3000](http://localhost:3000)

### Static Version (for GitHub Pages)

You can also open `index.html` directly in your browser for a static version of the app.

### 🌐 Live Demo

Visit the live GitHub Pages deployment: 👉 [https://ARTHURVANBELLE.github.io/Racool_App](https://ARTHURVANBELLE.github.io/Racool_App)

You should see a full-screen **Leaflet map** centered on **London** 🗺️ app that displays an interactive **Leaflet map** served via an **Express.js** backend and rendered with **EJS** templates.

---

## ✨ Features

- ⚡ Express.js backend serving EJS templates and static files  
- 🗺️ Leaflet map rendered directly in the browser  
- 📱 Fully responsive full-screen map  
- 🌐 Uses OpenStreetMap tiles  
- 💡 Simple and extendable architecture  

---

## 🧩 Project Structure

```
Racool_App/
│
├── server.js        # Express server setup
├── index.ejs        # View template (HTML + Leaflet)
├── style.css        # Page styling
└── package.json     # Project configuration
```

---

## 🧰 Requirements

Before running the app, ensure you have:

- **Node.js** (version 16 or newer)  
- **npm** (Node package manager)

Check your versions:

```bash
node -v
npm -v
```

---

## ⚙️ Setup Instructions

1. **Clone or download this repository**

   ```bash
   git clone https://github.com/yourusername/Racool_App.git
   cd Racool_App
   ```

2. **Initialize the project (if not already done)**

   ```bash
   npm init -y
   ```

3. **Install dependencies**

   ```bash
   npm install express ejs
   ```

4. **(Optional)** Add this to your `package.json` if you’re using ES modules:

   ```json
   {
     "type": "module"
   }
   ```

---

## 🖥️ Run the App

Start the server:

```bash
node server.js
```

If everything is set up correctly, you’ll see:

```
Server running at http://localhost:3000/
```

Then open your browser and visit 👉 [http://localhost:3000](http://localhost:3000)

You should see a full-screen **Leaflet map** centered on **London** 🗺️

---

## 🧾 File Overview

### `server.js`
Sets up the Express server, serves static assets, and renders the `index.ejs` template.

### `index.ejs`
Contains the main HTML structure and the Leaflet map script loaded via CDN.

### `style.css`
Removes default margins and ensures the map occupies the entire viewport.

---

## 🛠️ Customization

### 🌍 Change the default map view
Inside `index.ejs`, modify:
```js
var map = L.map('map').setView([LATITUDE, LONGITUDE], ZOOM_LEVEL);
```

### 📍 Add a marker with popup
```js
L.marker([LATITUDE, LONGITUDE]).addTo(map)
  .bindPopup('Hello world!')
  .openPopup();
```

---

## � GitHub Pages Deployment

This project is automatically deployed to GitHub Pages using GitHub Actions. Here's how to set it up:

### Automatic Deployment Setup

1. **Push your code to GitHub**
   ```bash
   git add .
   git commit -m "Add GitHub Pages deployment"
   git push origin main
   ```

2. **Configure GitHub Pages in your repository**
   - Go to your GitHub repository
   - Navigate to **Settings** → **Pages**
   - Under **Source**, select **GitHub Actions**
   - The deployment will start automatically on the next push to `main`

3. **Access your deployed app**
   - Your app will be available at: `https://ARTHURVANBELLE.github.io/Racool_App`
   - The deployment typically takes 2-3 minutes

### Manual Deployment

If you prefer to deploy manually:
1. Go to the **Actions** tab in your GitHub repository
2. Click **Deploy to GitHub Pages** workflow
3. Click **Run workflow** → **Run workflow**

### Files for Deployment

- `index.html` - Static version of the app (converted from EJS)
- `.github/workflows/pages.yml` - GitHub Actions deployment configuration
- All static assets (CSS, JS, CSV files) are served directly

---

## �📦 Dependencies

| Package | Purpose |
|----------|----------|
| express | Web server framework |
| ejs | Template engine for rendering HTML |

---

## 📜 License

This project is open-source and available under the **MIT License**.