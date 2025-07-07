# HR System Management Frontend

A modern, responsive, and feature-rich Human Resources Management System (HRMS) frontend built with **React** and **Vite**. This project is part of a MERN stack solution, providing a seamless interface for HR operations such as employee management, attendance, payroll, holidays, departments, and an integrated AI-powered HR chatbot.

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Key Pages & Modules](#key-pages--modules)
- [Design & UX](#design--ux)
- [API Integration](#api-integration)
- [Authentication](#authentication)
- [How to Run](#how-to-run)
- [Contributing](#contributing)

---

## Features

- **Dashboard**: Visual overview of HR stats (employees, departments, attendance, etc.) and recent activity.
- **Employee Management**: Add, edit, view, soft-delete, and restore employees. Advanced search and filtering.
- **Department Management**: Create, edit, delete, and view departments in a modern card-based UI.
- **Attendance Tracking**: Add, edit, view, and filter attendance records by employee or date.
- **Payroll Management**: View, filter, and inspect detailed payroll records with modern UI.
- **Holiday Management**: Add, update, delete, and view holidays with a creative, RTL-friendly design.
- **AI HR Chatbot**: Modern, always-accessible chatbot for HR queries, integrated with backend AI and local employee search.
- **Authentication**: Secure login, token-based session management, and protected routes.
- **Responsive Design**: Fully responsive, RTL-friendly, and accessible on all devices.
- **Reusable Components**: Modular, maintainable code with shared UI components (buttons, error displays, layouts).

---

## Tech Stack

- **Frontend**: React 18, Vite, React Router DOM, Bootstrap 5, Lucide React Icons, React Bootstrap, React Paginate, React Select, Lodash, Axios
- **Styling**: CSS Modules, custom CSS, Bootstrap, modern gradients, and card-based layouts
- **API**: Axios instance with interceptors for authentication and error handling
- **AI Integration**: Backend-powered chatbot with local employee search fallback
- **State Management**: React hooks and local state

---

## Project Structure

```
src/
  assets/           # Static assets (images, icons)
  components/       # Reusable UI components (Sidebar, Header, Button, ErrorDisplay)
  layouts/          # MainLayout for consistent app shell
  pages/            # Main feature pages (Dashboard, Employees, Department, Payroll, Holiday, Attendance, HRChatbot, Login)
  Router/           # App routing and protected route logic
  services/         # API service modules (auth, employee, attendance, chatbot, axios instance)
  utils/            # Utility functions (error handling, constants)
  main.jsx          # App entry point
  App.jsx           # App wrapper
```

---

## Key Pages & Modules

### Dashboard

- Visual stats: total employees, present today, on leave, departments
- Recent employees list with quick actions (view, edit, delete)
- Modern, card-based, responsive design

### Employees

- Add, edit, view, soft-delete, and restore employees
- Advanced search (by name, date), pagination, and filtering
- Detailed employee profiles
- Modular forms with validation and error handling

### Departments

- Add, edit, delete, and view departments
- Modern, blue-accented, card-based UI with modals
- Responsive and accessible

### Attendance

- Add, edit, view, and filter attendance records
- Search by employee name, filter by date range
- Modal-based forms and details view

### Payroll

- View and filter payroll records by employee or date
- Detailed modal view for salary breakdown
- Responsive, modern table design

### Holidays

- Add, update, delete, and view holidays
- Modern, RTL-friendly, and responsive design
- Toast-style error popups and robust form validation

### HR Chatbot

- Floating, always-accessible AI assistant
- Modern, beautiful, and comfortable UI (blue/teal accents, pill buttons)
- Handles all HR queries via backend, except for local employee search
- Suggested questions, typing animation, and error fallback

### Authentication

- Secure login with token storage and protected routes
- Auto-redirect on unauthorized access
- Logout functionality

---

## Design & UX

- **Modern, Card-Based UI**: Consistent use of cards, gradients, and shadows for a professional look.
- **RTL & Accessibility**: RTL-friendly layouts and accessible forms.
- **Responsive**: Mobile-first, fully responsive design.
- **User Feedback**: Toast popups, loading spinners, and clear error messages.
- **Quick Actions**: Floating chatbot, sidebar navigation, and modals for CRUD operations.

---

## API Integration

- **axiosInstance.js**: Centralized Axios instance with base URL, token injection, and error handling.
- **Service Modules**: Each feature (employees, attendance, payroll, chatbot, etc.) has a dedicated service for API calls.
- **Error Handling**: Robust error handling with user-friendly messages and auto-logout on 401.

---

## Authentication

- **Login**: Email/password authentication, token storage in localStorage.
- **Protected Routes**: Only authenticated users can access main app features.
- **Logout**: Clears session and redirects to login.

---

## How to Run

1. **Install dependencies**:
   ```bash
   npm install
   ```
2. **Start the development server**:
   ```bash
   npm run dev
   ```
3. **Build for production**:
   ```bash
   npm run build
   ```
4. **Preview production build**:
   ```bash
   npm run preview
   ```

> **Note:** The frontend expects a running backend API at `http://localhost:3000/api`. Update the base URL in `src/services/axiosInstance.js` if needed.

---

## Contributing

Contributions are welcome! Please open issues or submit pull requests for improvements, bug fixes, or new features.

---

**Enjoy a modern, efficient, and beautiful HR management experience!**

---
