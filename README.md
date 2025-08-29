# ✈️ Flight Booking Microservices Project

This project demonstrates a **microservices-based architecture** using Node.js, Express, and REST APIs.

## 📂 Services
- **Booking Service (PORT 2000):** Handles booking requests.
- **Flight Service (PORT 1000):** Manages flight data.
- **API Gateway (optional):** Routes requests to services.

## 🔗 How Services Talk
- Booking Service → calls Flight Service to fetch flight availability.
- Services communicate via REST APIs (using Axios).

## 🚀 Running Locally
1. Clone this repo
2. Install dependencies in each service
   ```bash
   cd flight-service && npm install
   cd booking-service && npm install

