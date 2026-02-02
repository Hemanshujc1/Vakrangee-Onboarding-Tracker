# Vakrangee Onboarding Portal - Backend

This is the backend API for the **Vakrangee Onboarding Portal**. It provides a robust RESTful API to manage employee data, authentication, form submissions, and document storage. It uses Node.js, Express, and MySQL (via Sequelize).

## 🚀 Technologies Used

- **Runtime**: [Node.js](https://nodejs.org/)
- **Framework**: [Express.js](https://expressjs.com/)
- **Database**: MySQL
- **ORM**: [Sequelize](https://sequelize.org/)
- **Authentication**: JWT (JSON Web Tokens), bcrypt
- **File Handling**: [Multer](https://github.com/expressjs/multer)
- **Email**: Nodemailer

## 🛠️ Installation & Setup

1.  **Clone the repository**:

    ```bash
    git clone <repository-url>
    cd Backend
    ```

2.  **Install dependencies**:

    ```bash
    npm install
    ```

3.  **Database Setup**:
    - Ensure MySQL is running.
    - Create a database named `vakrangee_onboarding` (or as configured).
    - Update `config/database.js` or `.env` with your DB credentials.

4.  **Environment Variables**:
    - Copy `.env.example` to `.env`.
    - Configure `DB_HOST`, `DB_USER`, `DB_PASS`, `JWT_SECRET`, etc.

5.  **Initialize Database**:
    Run the setup script to create the database and sync tables:

    ```bash
    npm run db:setup
    ```

6.  **Run the Server**:
    - **Development**:
      ```bash
      npm run dev
      ```
    - **Production**:
      ```bash
      npm start
      ```
      The server typically runs on port `3001`.

## 📂 Project Structure

```
Backend/
├── config/           # Database configuration
├── controllers/      # Route logic (Auth, Employee, Forms)
│   └── forms/        # Form-specific controllers
├── middleware/       # Auth, Upload, Error handling
├── models/           # Sequelize models (User, Employee, Forms)
├── routes/           # API Route definitions
├── uploads/          # Directory for stored files/signatures
├── utils/            # Helper functions
└── server.js         # Entry point
```

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
