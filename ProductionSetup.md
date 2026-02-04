# Production Setup Guide

This document outlines the detailed steps to set up the Vakrangee Onboarding Portal in a production environment (e.g., Ubuntu Server).

## 📋 Prerequisites

- **Node.js**: v18 or higher
- **MySQL Server**: v8.0 or higher
- **Nginx**: Web Server
- **PM2**: Process Manager for Node.js (`npm install -g pm2`)

---

## 1. Database Setup

### Step 1.1: Configure Environment Variables

Ensure your `Backend/.env` file has the correct database credentials.

```ini
DB_HOST=localhost
DB_USER=your_prod_user
DB_PASSWORD=your_prod_password
DB_NAME=vakrangee_onboarding_db
```

### Step 1.2: Create Database and Tables

We have a script that automatically connects to MySQL, creates the database (if it doesn't exist), and syncs all the tables based on the Sequelize models.

1.  Navigate to the `Backend` directory:

    ```bash
    cd Backend
    ```

2.  Run the setup script:
    ```bash
    npm run db:setup
    ```
    _If this command fails, you can try running the script directly:_
    ```bash
    node scripts/setup-db.js
    ```

**What this does:**

- Connects to MySQL.
- Creates `vakrangee_onboarding_db` (or whatever is in your `.env`).
- Creates all required tables (`users`, `employee_masters`, `forms`, etc.).

---

## 2. Create HR Super Admin

To access the system, you need at least one Super Admin account.

1.  Navigate to the `Backend` directory (if not already there).

2.  Run the creation script:

    ```bash
    node scripts/create_super_admin.js
    ```

3.  **Default Credentials**:
    - **Email**: `superhr@admin.com`
    - **Password**: `admin@123`

> **Security Note**: Immediately log in and change this password or delete this user after creating your own personal admin account.

---

## 3. Nginx Configuration

Nginx acts as a reverse proxy, serving the Frontend files and forwarding API requests to the Backend.

### Step 3.1: Create Configuration File

Create a new file in `/etc/nginx/sites-available/vakrangee`:

```bash
sudo nano /etc/nginx/sites-available/vakrangee
```

### Step 3.2: Paste Configuration

Replace `your-domain.com` with your actual domain or IP address.

```nginx
server {
    listen 80;
    server_name your-domain.com; # e.g., ecartsit.vakrangee.in

    # 1. Serve Frontend Static Files
    root /path/to/your/project/Frontend/dist;
    index index.html;

    link_log /var/log/nginx/vakrangee_access.log;
    error_log /var/log/nginx/vakrangee_error.log;

    # Handle React Routing (SPA)
    location /vakrangee-onboarding-portal/ {
        alias /path/to/your/project/Frontend/dist/;
        try_files $uri $uri/ /index.html;
    }

    # Also handle root if desired
    location / {
        try_files $uri $uri/ /index.html;
    }

    # 2. Proxy API Requests to Backend
    # Important: No trailing slash in proxy_pass to preserve /api path
    location /api/ {
        proxy_pass http://localhost:3001;

        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # 3. Serve Uploaded Documents
    location /uploads/ {
        alias /path/to/your/project/Backend/uploads/;
        expires 30d;
        add_header Cache-Control "public, no-transform";
    }
}
```

### Step 3.3: Enable Site & Restart Nginx

1.  **Link the config**:

    ```bash
    sudo ln -s /etc/nginx/sites-available/vakrangee /etc/nginx/sites-enabled/
    ```

2.  **Test configuration**:

    ```bash
    sudo nginx -t
    ```

    _(Fix any errors if reported)_

3.  **Restart Nginx**:
    ```bash
    sudo systemctl restart nginx
    ```

---

## 4. Application Management

### 4.1 Manage Backend (PM2)

We use PM2 to keep the backend server running in the background.

**Start the Backend:**

```bash
cd Backend
pm2 start server.js --name "vakrangee-backend"
pm2 save
```

**Common PM2 Commands:**

- **List all processes**: `pm2 list`
- **View logs**: `pm2 logs vakrangee-backend`
- **Restart**: `pm2 restart vakrangee-backend`
- **Stop**: `pm2 stop vakrangee-backend`
- **Delete Process** (If created by mistake or to rename):
  ```bash
  pm2 delete vakrangee-backend
  ```

### 4.2 Manage Frontend

Since the Frontend is served as static files by Nginx, "running" it just means building the files. Nginx serves them automatically.

**To Update/Deploy Frontend Changes:**

1.  Navigate to Frontend: `cd Frontend`
2.  Update code (`git pull`) or confiugration (`.env`).
3.  **Rebuild**:
    ```bash
    npm run build
    ```
4.  (Optional) If you changed Nginx config, restart it: `sudo systemctl restart nginx`

---

## 5. Final Verification

1.  **Frontend**: Visit `http://your-domain.com/vakrangee-onboarding-portal/`. You should see the login page.
2.  **Backend Connectivity**: Try logging in with the Super Admin credentials.
3.  **Process Status**: Check if backend is stable.
    ```bash
    pm2 status
    ```

## 6. Troubleshooting common errors

- **404 on API**: Check `location /api/` in Nginx. Ensure `proxy_pass` does **NOT** have a trailing slash (`http://localhost:3001` ✅, `http://localhost:3001/` ❌).
- **White Screen on Frontend**: Check console for `VITE_API_URL` issues. Ensure `Frontend/.env` is correct and you ran `npm run build`.
- **Database Connection Error**: Verify `Backend/.env` credentials and that MySQL service is running (`sudo systemctl status mysql`).
