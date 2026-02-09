# Vakrangee Onboarding Portal

A comprehensive web application designed to streamline the employee onboarding process at Vakrangee. This system facilitates the management of employee data, document verification, and form submissions through a role-based access control system (Employee, HR Admin, HR Super Admin).

## 🚀 Technologies Used

### Frontend

- **Framework**: [React](https://react.dev/) (v19) with [Vite](https://vitejs.dev/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) (v4)
- **Routing**: [React Router](https://reactrouter.com/) (v7)
- **Form Handling**: [React Hook Form](https://react-hook-form.com/)
- **Validation**: [Yup](https://github.com/jquense/yup)
- **State Management**: Context API
- **Icons**: [Lucide React](https://lucide.dev/)
- **PDF Generation**: [jsPDF](https://github.com/parallax/jsPDF)
- **HTTP Client**: [Axios](https://axios-http.com/)

### Backend

- **Runtime**: [Node.js](https://nodejs.org/)
- **Framework**: [Express.js](https://expressjs.com/)
- **Database**: MySQL
- **ORM**: [Sequelize](https://sequelize.org/)
- **Authentication**: JWT (JSON Web Tokens), bcrypt
- **File Handling**: [Multer](https://github.com/expressjs/multer)
- **Email**: Nodemailer

## ✨ Key Features

- **Digital Onboarding**: Elimination of paper-based workflows.
- **Role-Based Dashboards**: Tailored views for Employees, HR Admins, and HR Super Admins.
- **Dynamic Forms**:
  - Employment Application
  - Basic Information
  - Pre-Joining (Application, Mediclaim, Gratuity, Information)
  - Post-Joining (NDA, Declaration, TDS, EPF)
- **Automated Workflow**: Automatically advances employee onboarding stage when required forms are verified.
- **Document Management**: Secure upload and verification flow for regulatory documents (PAN, Aadhaar, etc.).
- **Real-Time Tracking**: Visual progress bars and status indicators.
- **Responsive Design**: Optimized for desktop and mobile devices.
- **Print-Optimized**: A4-ready headers and layouts for official form printing.
- **Secure Authentication**: JWT-based session management and RBAC.
- **Logging**: Comprehensive request and error logging for auditing.

---

## 🛠️ Installation & Setup

To run the application locally, you will need to set up both the backend and frontend servers.

### Prerequisites

- Node.js (v18+ recommended)
- MySQL Server

### 1. Setup Backend

1.  **Navigate to Backend**:

    ```bash
    cd Backend
    ```

2.  **Install dependencies**:

    ```bash
    npm install
    ```

3.  **Database Setup**:
    - Create a MySQL database named `vakrangee_onboarding`.
    - Configure `.env` (copy from `.env.example`) with your DB credentials:
      ```env
      DB_HOST=localhost
      DB_USER=root
      DB_PASS=password
      DB_NAME=vakrangee_onboarding
      JWT_SECRET=your_jwt_secret
      ```

4.  **Initialize Database**:

    ```bash
    npm run db:setup
    ```

5.  **Run Server**:
    ```bash
    npm run dev
    ```
    > Server runs on `http://localhost:3001`.

### 2. Setup Frontend

1.  **Navigate to Frontend**:

    ```bash
    cd Frontend
    ```

2.  **Install dependencies**:

    ```bash
    npm install
    ```

3.  **Run Development Server**:
    ```bash
    npm run dev
    ```
    > App available at `http://localhost:5173`.

---

## 📂 Project Structure

The project is divided into two main parts:

### Frontend Structure (`/Frontend`)

```
Frontend/
├── src/
│   ├── Components/      # Reusable UI components (Forms, Auth, Layout)
│   ├── context/         # Global state (Auth, Alerts)
│   ├── hooks/           # Custom React Hooks (useAutoFill, etc.)
│   ├── pages/           # Page components (Employee, HRAdmin, Forms)
│   ├── utils/           # Validation schemas and helpers
│   └── App.jsx          # Main application component
└── ...
```

### Backend Structure (`/Backend`)

```
Backend/
├── config/           # Database configuration
├── controllers/      # Business logic (Auth, Employee, Forms)
├── middleware/       # Auth, Upload, Error handling
├── models/           # Sequelize models
├── routes/           # API Route definitions
├── uploads/          # Physical file storage
├── utils/            # Helper functions (Logger, Email)
└── server.js         # Entry point
```

---

## 🔗 API Overview

### Authentication

- `POST /api/auth/login`: User login.
- `POST /api/auth/register`: Admin-only registration.

### Employees

- `GET /api/employees`: List all employees (HR).
- `GET /api/employees/me`: Get current profile.
- `POST /api/employees/:id/advance-stage`: Manually advance onboarding stage.

### Forms

- Supports `POST` to save/submit and `POST /verify` for HR actions.
- Endpoints: `/application`, `/mediclaim`, `/nda`, `/declaration`, `/epf`, `/gratuity`.

### Documents

- `POST /api/documents/upload`: Upload files.
- `POST /api/documents/verify/:id`: Verify or reject documents.

---

## 🔄 Status Reference Guide

### Employee Onboarding Stages

| Stage                   | Description                                           |
| :---------------------- | :---------------------------------------------------- |
| **Login Pending**       | Employee invited but not yet logged in.               |
| **Profile Pending**     | Basic info needs to be filled.                        |
| **In Progress**         | Pre-joining forms pending submission or verification. |
| **Ready to Join**       | All pre-joining requirements met.                     |
| **Joining Formalities** | Post-joining forms (NDA, etc.) in progress.           |
| **Completed**           | Full onboarding complete.                             |

### Form Statuses

| Status        | Description                     |
| :------------ | :------------------------------ |
| **Draft**     | Saved but not submitted.        |
| **Submitted** | Awaiting HR review.             |
| **Approved**  | Accepted by HR (intermediate).  |
| **Verified**  | Final HR verification complete. |
| **Rejected**  | Returned for corrections.       |

---

## 📝 Validations

All forms use centralized validation schemas (`src/utils/validationSchemas.js`) ensuring data integrity for:

- **Personal Info**: Alphabetic names, valid email/phone.
- **Documents**: Regex patterns for PAN, Aadhaar, Passport.
- **Dates**: Logic for age, expiry dates, and joining dates.

---

## 🌍 Production Deployment

For detailed deployment instructions (PM2, Nginx, SSL), refer to the **[Production Setup Guide](./ProductionSetup.md)**.
