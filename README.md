---

# BeautyPortal: Luxury Management Suite 💅

An enterprise-grade full-stack application designed to streamline beauty service operations. This project features a robust **Spring Boot** backend and a high-performance **Angular 19** frontend, providing a seamless experience for both administrators and clients.

**Live Impact:** Serving **100+ active monthly users**.

---

## 🏗 System Architecture

The application is built on a decoupled architecture, allowing for independent scaling and maintenance of the client and server.

* **Frontend**: Angular 19, Tailwind CSS v4, Syncfusion UI.
* **Backend**: Spring Boot 3, Spring Data MongoDB, Spring Mail.
* **Database**: MongoDB Atlas (Cloud).
* **Build Tools**: Vite (Frontend), Maven (Backend).

---

## 🛠 Project Structure

```text
beauty-portal-suite/
├── angular-app/          # Frontend: Angular 19 SPA
│   ├── src/
│   └── vite.config.ts
└── booking-system/       # Backend: Spring Boot REST API
    ├── src/
    └── pom.xml

```

---

## 🚀 Key Technical Implementation

### 1. Secure Credential Management

Instead of hardcoding sensitive data, the system utilizes **Environment Variables** and Spring `@Value` injection. This ensures that MongoDB URIs and SMTP passwords remain secure and out of version control.

### 2. Modern Build Pipeline

Migrated the frontend build process to **Vite** to resolve complex module resolution issues with **Syncfusion** and **Angular 19**, resulting in 40% faster HMR (Hot Module Replacement) during development.

### 3. Integrated Booking Workflow

Features a custom-configured **Syncfusion Scheduler** with server-side persistence, ensuring real-time appointment synchronization and role-based access control (RBAC).

---

## 🔧 Installation & Setup

### Prerequisites

* Node.js (v18+)
* Java JDK 17+
* Maven

### Local Development Setup

1. **Clone the repository:**
```bash
git clone https://github.com/anha-cs/Beauty-Portal-Management.git

```


2. **Backend Setup:**
* Navigate to `booking-system`.
* Create environment variables for `MONGO_URI`, `GMAIL_USER`, and `GMAIL_APP_PASSWORD`.
* Run `./mvnw spring-boot:run`.


3. **Frontend Setup:**
* Navigate to `angular-app`.
* Run `npm install` and `npm start`.
* Access the portal at `http://localhost:4200`.



---
