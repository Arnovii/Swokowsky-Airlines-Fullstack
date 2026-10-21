# ✈️ Swokowsky Airlines

**A full-stack airline reservation platform built as a university software engineering project.**

Swokowsky Airlines is a web application designed to simulate the core operations of an airline booking platform. It allows customers to explore available flights, discover promotions, manage their profiles, and access personalized features, while providing administrators with tools to manage flight information.

The project focuses on building a complete full-stack application, integrating a modern frontend, a structured backend API, and a relational database.

## ✨ Features

- **Authentication and Authorization** — Secure user registration and login using JWT-based authentication, password hashing, and role-based access control.
- **Flight Search** — Search for flights based on travel criteria and explore available options.
- **Flight Details** — View detailed flight information, including schedules, routes, and available promotions.
- **News and Promotions** — Discover scheduled flights and promotional offers through a dedicated interface.
- **User Profile Management** — View and update personal information and manage newsletter subscription preferences.
- **Administrative Dashboard** — Access flight listings and information through an administrator interface.
- **Password Recovery** — Support for account recovery through an email-based workflow.
- **Protected API Endpoints** — Restrict access to private resources according to authentication status and user roles.

## 🛠️ Tech Stack

| Technology | Purpose |
|---|---|
| React | User interface development |
| TypeScript | Type-safe frontend development |
| React Router | Client-side navigation and route protection |
| Tailwind CSS | Interface styling |
| NestJS | Backend application and REST API |
| Prisma ORM | Database access and data modeling |
| MySQL | Relational data storage |
| JWT | Authentication and session management |
| Docker | Development environment and service orchestration |
| Axios | HTTP communication between frontend and backend |

## 🏗️ Architecture

The application follows a frontend-backend architecture with a clear separation of responsibilities.

**Frontend**
- Renders the user interface and application pages.
- Manages navigation and authentication state.
- Communicates with the backend through HTTP requests.
- Displays information according to the authenticated user's role.

**Backend**
- Exposes REST API endpoints.
- Handles authentication and authorization.
- Validates requests and applies business rules.
- Processes application logic and database operations.

**Database**
- Stores users, flights, airports, aircraft, seats, tickets, payments, and promotions.
- Uses relational models to represent the main entities and their relationships.

## 👥 User Roles

The platform distinguishes between three user roles:

- **Customer:** Searches for flights, manages personal information, and accesses customer-facing features.
- **Administrator:** Accesses administrative functionality for managing flight information.
- **Root:** Has privileged access to administrative account management.

Access to protected resources is controlled by the backend according to the user's permissions.

## 🎯 Project Objectives

This project provided practical experience in:

- Designing and developing a full-stack web application.
- Building REST APIs with NestJS.
- Modeling relational databases with Prisma and MySQL.
- Implementing JWT authentication and role-based authorization.
- Integrating a React frontend with a backend API.
- Organizing application code into modular components.
- Managing development services with Docker.
- Collaborating on a software engineering project as a team.

## 👨‍💻 Contributors

Developed collaboratively as part of a university software engineering project.

- Arnovi Jimenez
- Juana Martinez
- Brayan Sanchez
- Felipe Vinasco

## 📄 License

This project was developed for educational purposes.
