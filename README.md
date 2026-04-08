# Complaint Tracker

A web application that helps residents report and track maintenance issues in residential apartments and housing communities.

---

## Description

Complaint Tracker is a full-stack web application designed for **residents living in apartments or residential communities who frequently face maintenance issues** such as water leaks, electrical problems, sanitation issues, or other facility-related complaints.

Instead of relying on informal communication with landlords or maintenance staff, this platform provides a **structured system where residents can submit complaints, track their status, and ensure issues are resolved efficiently**.

The application is built using **React for the frontend**, **Node.js with Express for the backend**, and **MongoDB for database management**, creating a scalable platform for residential complaint management.

---

## Value Perspective

### For Residents

* Report maintenance issues easily through a centralized system
* Track the **status of issue resolution in real time**
* View other issues reported within the same apartment community
* Understand **how quickly owners respond to problems**
* Increased transparency and accountability in apartment maintenance

---

### For Apartment Owners

* Identify problems within the apartment quickly
* Resolve maintenance issues efficiently
* Maintain a **clean and well-managed apartment environment**
* Improve responsiveness to residents' complaints
* Attract more residents by maintaining a well-managed property

---

## Features

* Residents can submit maintenance complaints easily
* Complaint status tracking system
* Centralized platform for maintenance issue reporting
* Admin dashboard for complaint management
* REST API powered by Express.js
* MongoDB database for storing complaints
* Responsive React user interface

---

## Tech Stack

### Frontend

* React
* Axios
* CSS

### Backend

* Node.js
* Express.js

### Database

* MongoDB

---

## Project Structure

```
complaint-tracker/
│
├── backend/
│   ├── server.js
│   ├── routes/
│   ├── controllers/
│   ├── models/
│   │
│   └── config/
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   └── App.js
│
├── README.md
└── package.json
```

---

# Future Enhancements

### 📧 Email Notifications

Automatic email alerts for:

* New complaint submissions
* Complaint status updates
* Issue resolution notifications

---

### ⏱️ Owner Response Time Tracking

The platform will track **how quickly apartment owners respond to reported issues**.

Benefits include:

* Transparency for residents
* Encouraging faster issue resolution
* Improving apartment management efficiency

---

### 👥 Role-Based Access System (NEW)

To improve scalability and management, the system can be enhanced with multiple roles:

#### 🔹 Super Admin

* Manages all admins
* Full system access
* Controls overall platform operations

#### 🔹 Admin / Manager

* Handles complaints
* Updates complaint status
* Assigns tasks to maintenance staff

#### 🔹 Maintenance Staff

* Assigned specific complaints
* Works on issues
* Marks tasks as **completed**

#### 🔹 Resident

* Submits complaints
* Tracks complaint progress

---

## Contributing

Contributions are welcome.

Steps to contribute:

1. Fork the repository
2. Create a new feature branch

```bash
git checkout -b feature/new-feature
```

3. Commit your changes

```bash
git commit -m "Add new feature"
```

4. Push your branch

```bash
git push origin feature/new-feature
```

5. Open a Pull Request

---

## License

This project is licensed under the MIT License.

---

