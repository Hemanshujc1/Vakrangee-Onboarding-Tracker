# Vakrangee Onboarding Portal Created by Hemanshu Jagdish Choudhary

A comprehensive web application designed to streamline the onboarding process for new hires at Vakrangee. The portal provides distinct interfaces for Administrators (HR/Managers) and New Employees to manage tasks, documents, and progress efficiently.


## 🚀 Features

### Implemented Features

#### 👨‍💼 Admin Portal

- **Dashboard**: Real-time statistics on new hires (Total, Inactive, Onboarding, Completed).
- **Employee Management**:
  - Add new employees (defaults to 'Inactive' status).
  - View comprehensive employee profiles.
  - Edit employee details and delete records.
  - Track individual onboarding progress (ProgressBar).
- **Task Management**:
  - Create and manage Task Templates for standardized onboarding.
  - Assign tasks to employees (individually or via templates).
  - Verify submitted tasks.
  - Distinguish between "Resource" files (Admin uploaded) and "Submission" files (Employee uploaded).
  - "Back to Dashboard" navigation returns to the specific Employee Profile.

#### 👨‍💻 New Employee Portal

- **Dashboard**: Personalized view of pending and completed tasks.
- **Task Execution**:
  - View task details and admin-provided resources.
  - Submit work via file upload or URL.
  - Status updates automatically from "In Progress" -> "Submitted" -> "Completed" (after Admin verification).
- **Profile**: View and edit personal details and profile photo.
- **Lifecycle**:
  - **Inactive**: Initial state upon creation.
  - **Active**: Updates automatically upon first login.
  - **Completed**: Updates automatically when all assigned tasks are verified.

---

## 🛠️ Tech Stack

- **Frontend**: React.js, Tailwind CSS, Framer Motion, Lucide React (Icons).
- **Backend**: Node.js, Express.js.
- **Database**: MySQL.
- **Authentication**: JWT (JSON Web Tokens).

---

## 🔌 API Documentation

### Base URL: `/api`

### 1. Authentication (`/auth`)

| Method | Endpoint                | Description                                                                 | Access  |
| :----- | :---------------------- | :-------------------------------------------------------------------------- | :------ |
| `POST` | `/login`                | Authenticate user and get token. Updates status to 'Active' on first login. | Public  |
| `POST` | `/register`             | Register a new user (Self-registration).                                    | Public  |
| `POST` | `/register-admin`       | Register a new admin (Setup only).                                          | Public  |
| `POST` | `/logout`               | Clear logic/cookie.                                                         | Private |
| `GET`  | `/me`                   | Get current user details.                                                   | Private |
| `POST` | `/forgotpassword`       | Initiate password reset.                                                    | Public  |
| `PUT`  | `/resetpassword/:token` | Reset password with token.                                                  | Public  |

### 2. Employee Management (`/employees`)

| Method   | Endpoint | Description                    | Access  |
| :------- | :------- | :----------------------------- | :------ |
| `GET`    | `/`      | Get all employees.             | Admin   |
| `POST`   | `/`      | Create a new employee.         | Admin   |
| `GET`    | `/:id`   | Get specific employee details. | Private |
| `PUT`    | `/:id`   | Update employee details.       | Private |
| `DELETE` | `/:id`   | Delete an employee.            | Admin   |

### 3. Task Management (`/tasks`)

| Method   | Endpoint        | Description                                                    | Access  |
| :------- | :-------------- | :------------------------------------------------------------- | :------ |
| `POST`   | `/assign`       | Assign a new task to an employee.                              | Admin   |
| `GET`    | `/:id`          | Get task details (including attachments).                      | Private |
| `PUT`    | `/:id`          | Update task (status, submissions). Preserves attachment roles. | Private |
| `DELETE` | `/:id`          | Delete a task.                                                 | Admin   |
| `GET`    | `/employee/:id` | Get all tasks for a specific employee.                         | Private |

### 4. Task Templates (`/templates`)

| Method   | Endpoint         | Description                                       | Access |
| :------- | :--------------- | :------------------------------------------------ | :----- |
| `GET`    | `/`              | Get all templates.                                | Admin  |
| `POST`   | `/`              | Create a new template.                            | Admin  |
| `GET`    | `/:id`           | Get template details.                             | Admin  |
| `PUT`    | `/:id`           | Update template metadata.                         | Admin  |
| `DELETE` | `/:id`           | Delete a template.                                | Admin  |
| `GET`    | `/tasks/:taskId` | Get details of a specific task within a template. | Admin  |
| `PUT`    | `/tasks/:taskId` | Update a specific task within a template.         | Admin  |

### 5. File Uploads (`/upload`)

| Method | Endpoint | Description                        | Access  |
| :----- | :------- | :--------------------------------- | :------ |
| `POST` | `/`      | Upload a file (Returns file path). | Private |

---

## 🏃‍♂️ Installation & Setup

1.  **Clone the Repository**
2.  **Database Setup**
    - Import the provided SQL schema to your MySQL instance.
    - Configure `.env` in `Backend/` with DB credentials.
3.  **Backend Setup**
    ```bash
    cd Backend
    npm install
    npm start
    ```
4.  **Frontend Setup**
    ```bash
    cd Frontend
    npm install
    npm run dev
    ```
R




  <span className={`px-3 py-1 text-xs font-medium rounded-full 
                                ${getEmployeeStatus(employee) === 'Completed' ? 'bg-green-100 text-green-800' : 
                                  getEmployeeStatus(employee) === 'Not Joined' ? 'bg-gray-100 text-gray-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                 {getEmployeeStatus(employee)}
                                 <StatusBadge status={statusText} />
                            </span>