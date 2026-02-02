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

_Vakrangee Internal Project_
