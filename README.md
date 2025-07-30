# Crafts E-commerce Platform

This is a full-stack e-commerce D2C website built with Next.js, MySQL, and Prisma. This platform allows selling products across various categories with a comprehensive set of features for both customers and administrators.

## Features

### Customer-Facing Features:
- **Homepage:** Features products and promotional banners.
- **Product Listing:** Advanced filtering by category, price, and other attributes.
- **Product Details:** Image gallery, detailed descriptions, stock information, and an “Add to Cart” option.
- **Shopping Cart:** View and manage selected items and see the total price.
- **Checkout:** Secure payment flow with Razorpay integration.
- **Order Tracking:** Users can view and track their purchase history.
- **User Authentication:** Secure JWT-based authentication system.
- **Customer Profile:** Manage personal details, addresses, and view/cancel/return orders.

### Admin Dashboard:
- **Product Management:** Add, edit, and delete products.
- **Order Management:** View and manage all customer orders.
- **Category Management:** Create and manage product categories.
- **Coupon Management:** Create and manage discount coupons.

### Technical Features:
- **Framework:** Next.js with App Router structure.
- **Database:** MySQL with Prisma ORM.
- **Styling:** Tailwind CSS for a modern, responsive design.
- **Image Hosting:** Ready for Cloudinary integration.
- **SEO Optimized:** Fast load times and SEO-friendly URLs.
- **Authentication:** JWT-based authentication with middleware protection.
- **Deployment:** Ready for deployment with Docker and Vercel.

## Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm (or yarn/pnpm)
- Docker and Docker Compose (for local development)

### Installation
1. **Clone the repository:**
   ```bash
   git clone git@github.com:ayushbahuguna/crafts-ecommerce.git
   cd crafts-ecommerce
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   Create a `.env` file in the root of the project and add the following variables:
   ```env
   # Database
   DATABASE_URL="mysql://username:password@localhost:3306/ecommerce_d2c"

   # JWT
   JWT_SECRET="your-super-secret-jwt-key"
   JWT_EXPIRES_IN="7d"

   # Cloudinary (Optional)
   CLOUDINARY_CLOUD_NAME="your-cloudinary-cloud-name"
   CLOUDINARY_API_KEY="your-cloudinary-api-key"
   CLOUDINARY_API_SECRET="your-cloudinary-api-secret"

   # Razorpay
   RAZORPAY_KEY_ID="your-razorpay-key-id"
   RAZORPAY_KEY_SECRET="your-razorpay-key-secret"

   # NextAuth
   NEXTAUTH_SECRET="your-nextauth-secret"
   NEXTAUTH_URL="http://localhost:3000"
   ```

4. **Run the database:**
   Start the MySQL database using Docker Compose:
   ```bash
   docker-compose up -d mysql
   ```

5. **Apply database migrations:**
   Run Prisma migrations to set up the database schema:
   ```bash
   npx prisma db push
   ```

6. **Run the development server:**
   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Deployment

This project is configured for deployment on Vercel. You can also deploy it using Docker.

### Deploy on Vercel
1. **Fork the repository** and connect it to your Vercel account.
2. **Set up environment variables** in the Vercel project settings.
3. **Deploy!** Vercel will automatically build and deploy the application.

### Deploy with Docker
1. **Build the Docker image:**
   ```bash
   docker build -t crafts-ecommerce .
   ```

2. **Run the container:**
   ```bash
   docker run -p 3000:3000 -d crafts-ecommerce
   ```

## CI/CD Pipeline

This project includes a GitHub Actions workflow for CI/CD. The workflow will:
- Run linting and tests on every push to `main` and `develop`.
- Build the application.
- Deploy to a production environment when changes are pushed to `main`.
