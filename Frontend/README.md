# Vakrangee Onboarding Portal - Frontend

This is the frontend for the **Vakrangee Onboarding Portal**, a comprehensive web application designed to streamline the employee onboarding process. It features role-based access for Employees, HR Admins, and Super Admins, enabling seamless form submissions, document verification, and progress tracking.

## 🚀 Technologies Used

- **Framework**: [React](https://react.dev/) (v19) with [Vite](https://vitejs.dev/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) (v4)
- **Routing**: [React Router](https://reactrouter.com/) (v7)
- **Form Handling**: [React Hook Form](https://react-hook-form.com/)
- **Validation**: [Yup](https://github.com/jquense/yup)
- **State Management**: Context API
- **Icons**: [Lucide React](https://lucide.dev/)
- **PDF Generation**: [jsPDF](https://github.com/parallax/jsPDF)
- **HTTP Client**: [Axios](https://axios-http.com/)

## ✨ Key Features

- **Role-Based Access Control (RBAC)**: Secure dashboards for Employees, HR Admins, and HR Super Admins.
- **Dynamic Onboarding Forms**:
  - Employment Application
  - Basic Information (Personal, Contact, Education, etc.)
  - Pre-Joining Forms: Application, Mediclaim, Gratuity, Information
  - Post-Joining Forms: NDA, Declaration, TDS, EPF
- **Form Validation**: Robust client-side validation using schemas.
- **Document Management**: Upload and view employee documents (PAN, Aadhaar, Passport, etc.).
- **Progress Tracking**: Visual progress bars and stage indicators for onboarding status.
- **Responsive Design**: Optimized for desktop and mobile devices.

## 🛠️ Installation & Setup

1.  **Clone the repository**:

    ```bash
    git clone <repository-url>
    cd Frontend
    ```

2.  **Install dependencies**:

    ```bash
    npm install
    ```

3.  **Configure Environment**:
    - Create a `.env` file in the root directory (if not present).
    - Add necessary environment variables (e.g., API base URL).

4.  **Run Development Server**:

    ```bash
    npm run dev
    ```

    The app will be available at `http://localhost:5173`.

5.  **Build for Production**:

    ```bash
    npm run build
    ```

    _For detailed deployment instructions (serving static files with Nginx), see **[ProductionSetup.md](../ProductionSetup.md)**._

## 📂 Project Structure

```
Frontend/
├── public/              # Static assets
├── src/
│   ├── assets/          # Images and global styles
│   ├── Components/      # Reusable UI components
│   │   ├── Auth/        # Login/Register forms
│   │   ├── Forms/       # Shared form inputs and layouts
│   │   ├── Layout/      # Sidebar, Header, Protected Routes
│   │   └── ...
│   ├── context/         # React Context (Auth, Alerts)
│   ├── hooks/           # Custom React Hooks
│   ├── pages/           # Page components
│   │   ├── Auth/        # Authentication pages
│   │   ├── Employee/    # Employee dashboard and views
│   │   ├── Forms/       # Onboarding form pages
│   │   ├── HRAdmin/     # HR Admin dashboard
│   │   └── HRSuperAdmin/# Super Admin dashboard
│   ├── utils/           # Helper functions and validation schemas
│   ├── App.jsx          # Main application component
│   └── main.jsx         # Entry point
├── index.html           # HTML template
└── package.json         # Project dependencies
```

## 📝 Validations

All forms use centralized validation schemas located in `src/utils/validationSchemas.js`. This ensures consistency across the application for fields like:

- **Names**: Custom regex for alphabetic characters.
- **Documents**: Pattern matching for PAN, Aadhaar, Passport, etc.
- **Dates**: Past/Future date validations for DOB, expiry dates, etc.

---
