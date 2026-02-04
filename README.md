# Vakrangee Onboarding Portal

A comprehensive web application designed to streamline the employee onboarding process at Vakrangee. This system facilitates the management of employee data, document verification, and form submissions through a role-based access control system (Employee, HR Admin, HR Super Admin).

## 📂 Project Structure

The project is divided into two main parts:

- **[Frontend](./Frontend)**: A React-based single-page application (SPA) built with Vite and Tailwind CSS.
- **[Backend](./Backend)**: A Node.js and Express REST API handling business logic, authentication, and database interactions (MySQL/Sequelize).

## 🚀 Quick Start Guide

To run the application locally, you will need to set up both the backend and frontend servers.

### Prerequisites

- Node.js (v18+ recommended)
- MySQL Server

### 1. Setup Backend

Navigate to the `Backend` directory and follow the setup instructions:

```bash
cd Backend
npm install
# Configure .env (see Backend/README.md)
npm run db:setup  # Creates database and tables
npm run dev
```

> The backend server typically runs on port `3001`.
> Check [Backend/README.md](./Backend/README.md) for detailed validation and API documentation.

### 2. Setup Frontend

Open a new terminal, navigate to the `Frontend` directory:

```bash
cd Frontend
npm install
npm run dev
```

> The frontend development server typically runs on `http://localhost:5173`.
> Check [Frontend/README.md](./Frontend/README.md) for UI features and component details.

## ✨ Key Features

- **Digital Onboarding**: Elimination of paper-based workflows.
- **Role-Based Dashboards**: Tailored views for Employees and HR staff.
- **Document Verification**: Secure upload and verification flow for regulatory documents.
- **Automated Tracker**: Real-time status updates on onboarding progress.
- **Secure Authentication**: JWT-based session management.

---

## 🔄 Status Reference Guide

This section provides a mapping of backend status codes to their user-facing display labels across the onboarding portal.

### 📋 Employee Onboarding Stages

Describes the overall progress of an employee through the system.

| (`onboarding_stage`)   | Display Label           | Description                                                     |
| :--------------------- | :---------------------- | :-------------------------------------------------------------- |
| `Not login yet`        | **Login Pending**       | Employee has been invited but hasn't logged in.                 |
| `BASIC_INFO`           | **Profile Pending**     | Employee needs to fill in their basic information.              |
| `PRE_JOINING`          | **In Progress**         | Pre-joining forms are being filled or are pending verification. |
| `PRE_JOINING_VERIFIED` | **Ready to Join**       | Required documents and forms have been verified.                |
| `POST_JOINING`         | **Joining Formalities** | Post-joining documents are being processed.                     |
| `ONBOARDED`            | **Completed**           | The employee is fully onboarded.                                |
| `Not_joined`           | **Not Joined**          | The candidate did not join the organization.                    |

### 👤 Account Statuses

Applies to both Admins and Employees for system access control.

| Status Code (`account_status`) | Display Label | Application                                              |
| :----------------------------- | :------------ | :------------------------------------------------------- |
| `INVITED`                      | **Invited**   | Waiting for the user to set up their account.            |
| `ACTIVE`                       | **Active**    | User has active access to the system.                    |
| `Inactive`                     | **Inactive**  | Access has been revoked or the user is no longer active. |

### 📝 Form Submission Statuses

Status of individual forms (EPF, Gratuity, NDA, etc.) submitted by employees.

| Status Code (`status`) | Display Label | Flow Status                                     |
| :--------------------- | :------------ | :---------------------------------------------- |
| `DRAFT`                | **Draft**     | Form saved but not yet submitted.               |
| `SUBMITTED`            | **Submitted** | Form submitted by employee, awaiting HR review. |
| `APPROVED`             | **Approved**  | Reviewed and accepted by HR.                    |
| `VERIFIED`             | **Verified**  | Final verification complete.                    |
| `REJECTED`             | **Rejected**  | Sent back to employee for corrections.          |

---

## 🌍 Production Deployment Guide

Follow these steps to deploy the application to a production server (Ubuntu/Linux recommended).

### 1. Prerequisites (Server Side)

- **Node.js**: Install Node.js v18+
- **PM2**: Process manager to keep backend alive (`npm install -g pm2`)
- **Nginx**: Web server for reverse proxy and static files
- **MySQL**: Production database instance

### 2. Backend Deployment

1.  **Prepare Directory**: Clone repo and navigate to `Backend`.
2.  **Install Dependencies**:
    ```bash
    npm install --production
    ```
3.  **Environment Setup**:
    - Copy the example production config: `cp .env.production.example .env`
    - Edit `.env` with your **Production Database Credentials** and **Secrets**.
    - Ensure `CORS_ORIGIN` points to your frontend domain.
4.  **Start Server**:
    ```bash
    pm2 start server.js --name "vakrangee-backend"
    pm2 save
    ```

### 3. Frontend Deployment

1.  **Prepare Directory**: Navigate to `Frontend`.
2.  **Install Dependencies**:
    ```bash
    npm install
    ```
3.  **Environment Setup**:
    - Copy the example config: `cp .env.production.example .env`
    - Edit `.env`: Set `VITE_API_URL` to your public backend URL (e.g., `https://api.yourcomapny.com` or `http://your-ip`).
    - **CRITICAL**: Do NOT use `localhost`.
4.  **Build Project**:
    ```bash
    npm run build
    ```

    - This creates a `dist` folder containing the optimized static files.

### 4. Nginx Configuration (Example)

Configure Nginx to serve the Frontend `dist` folder and proxy API requests to the Backend.

```nginx
server {
    listen 80;
    server_name your-domain.com;

    root /var/www/vakrangee/Frontend/dist;
    index index.html;

    # Serve Frontend
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Proxy API requests to Backend
    location /api/ {
        proxy_pass http://localhost:3001/api/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```
