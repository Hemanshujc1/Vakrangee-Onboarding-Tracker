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

## 🔗 API Endpoints

### 🔐 Authentication (`/api/auth`)

| Method | Endpoint           | Description            |
| :----- | :----------------- | :--------------------- |
| `POST` | `/register`        | Register a new user    |
| `POST` | `/login`           | User login             |
| `POST` | `/forgot-password` | Request password reset |
| `POST` | `/verify-otp`      | Verify OTP             |
| `POST` | `/reset-password`  | Reset password         |

### 👤 Profile (`/api/profile`)

| Method | Endpoint | Description                            |
| :----- | :------- | :------------------------------------- |
| `GET`  | `/`      | Get current user profile               |
| `PUT`  | `/`      | Update profile (includes photo upload) |

### 👥 Employees (`/api/employees`)

| Method   | Endpoint                 | Description                            |
| :------- | :----------------------- | :------------------------------------- |
| `GET`    | `/`                      | Get all employees (Admin)              |
| `GET`    | `/me`                    | Get current logged-in employee details |
| `GET`    | `/my-hr`                 | Get assigned HR details                |
| `GET`    | `/dashboard-stats`       | Get stats for employee dashboard       |
| `GET`    | `/:id`                   | Get specific employee by ID            |
| `PUT`    | `/:id`                   | Update employee details                |
| `POST`   | `/submit-basic-info`     | Submit basic info for verification     |
| `POST`   | `/:id/verify-basic-info` | Verify/Reject basic info (HR)          |
| `PUT`    | `/:id/form-access`       | Toggle form access                     |
| `POST`   | `/:id/advance-stage`     | Advance onboarding stage               |
| `DELETE` | `/:id`                   | Soft delete employee                   |

### 📄 Forms (`/api/forms`)

All form routes support `POST` to save/submit and specific verify endpoints for HR.

| Method | Endpoint                            | Description                        |
| :----- | :---------------------------------- | :--------------------------------- |
| `GET`  | `/auto-fill/:employeeId`            | Fetch data to auto-fill forms      |
| `POST` | `/access/toggle/:employeeId`        | Toggle specific form access        |
| `POST` | `/save-employee-info`               | Save "Employee Information" form   |
| `POST` | `/verify-employee-info/:employeeId` | Verify "Employee Information" form |
| `POST` | `/application`                      | Save "Employment Application"      |
| `POST` | `/application/verify/:employeeId`   | Verify "Employment Application"    |
| `POST` | `/mediclaim`                        | Save "Mediclaim" form              |
| `POST` | `/mediclaim/verify/:employeeId`     | Verify "Mediclaim" form            |
| `POST` | `/nda`                              | Save "NDA" form                    |
| `POST` | `/nda/verify/:employeeId`           | Verify "NDA" form                  |
| `POST` | `/declaration`                      | Save "Declaration" form            |
| `POST` | `/declaration/verify/:employeeId`   | Verify "Declaration" form          |
| `POST` | `/tds`                              | Save "TDS" form                    |
| `POST` | `/tds/verify/:employeeId`           | Verify "TDS" form                  |
| `POST` | `/epf`                              | Save "EPF" form                    |
| `POST` | `/epf/verify/:employeeId`           | Verify "EPF" form                  |
| `POST` | `/gratuity`                         | Save "Gratuity" form               |
| `POST` | `/gratuity/verify/:employeeId`      | Verify "Gratuity" form             |

### 📂 Documents (`/api/documents`)

| Method   | Endpoint            | Description                                 |
| :------- | :------------------ | :------------------------------------------ |
| `GET`    | `/`                 | Get documents for current user              |
| `POST`   | `/upload`           | Upload a new document                       |
| `DELETE` | `/:id`              | Delete a document                           |
| `GET`    | `/list/:employeeId` | List documents for a specific employee (HR) |
| `POST`   | `/verify/:id`       | Verify/Reject a document                    |

### 📧 Email (`/api/email`)

| Method | Endpoint              | Description                        |
| :----- | :-------------------- | :--------------------------------- |
| `POST` | `/send-admin-welcome` | Send welcome email to new Admin    |
| `POST` | `/send-welcome`       | Send welcome email to new Employee |

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
| **Not Joined**          | Employee didn't join the company.                     |

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
