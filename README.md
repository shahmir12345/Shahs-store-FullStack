# MyStore – MERN E-commerce Project

MyStore is an e-commerce web application I built using the MERN stack. Users can create an account, browse products, add items to their cart, and place orders. It also has a separate admin panel where the admin can manage products and orders.

I built this project to practice full-stack development, including connecting a React frontend with a Node.js and Express backend, working with MongoDB, and handling authentication.

## What the project can do

### Customer side
- Register and log in using email and password
- Browse products, search by name, and filter by category
- Sort products and filter by price or stock availability
- View product details and browse product images
- Add products to the cart and change quantities
- Place orders with a shipping address using Cash on Delivery
- View previous orders and check their status
- Use the website on mobile, tablet, and desktop screens

### Admin panel
- Log in through a separate admin login page
- View store statistics, recent orders, and products with low stock
- Add, edit, and delete products
- Upload up to 5 product images and select the main image
- View customer orders and update their status
- Restore product stock automatically when an order is cancelled

## Technologies used

- **Frontend:** React, Vite, React Router, Tailwind CSS v4
- **API requests:** Axios
- **Icons:** Lucide React
- **State management:** React Context API
- **Backend:** Node.js and Express
- **Database:** MongoDB and Mongoose
- **Authentication:** JWT and bcryptjs
- **Image uploads:** Multer with local storage

## A few things I worked on

- Keeping customer and admin authentication separate
- Protecting routes so users can only access the features allowed for their account
- Hashing passwords before saving them to the database
- Calculating order prices on the backend instead of trusting prices sent by the frontend
- Saving product names and prices with each order so the order details remain consistent
- Checking product IDs before using them in database queries
- Restricting image uploads to JPG, PNG, and WEBP files, with a maximum size of 3 MB per image

## Project structure

```text
ecommerce/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middlewares/
│   │   ├── models/
│   │   ├── routes/
│   │   └── app.js
│   ├── server.js
│   ├── seedAdmin.js
│   └── .env.example
│
└── frontend/
    ├── src/
    │   ├── api/
    │   ├── context/
    │   ├── components/
    │   ├── pages/
    │   │   └── admin/
    │   ├── App.jsx
    │   └── main.jsx
    └── .env.example
```

## Running the project locally

### Requirements

- Node.js 18 or newer
- MongoDB running locally or a MongoDB Atlas connection

### 1. Clone the repository

```bash
git clone https://github.com/YOUR_USERNAME/ecommerce.git
cd ecommerce
```

### 2. Set up the backend

```bash
cd backend
npm install
```

Create a `.env` file in the backend folder using `.env.example` as a reference.

Add your own configuration:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/ecommerce
JWT_SECRET=your_long_random_secret

ADMIN_NAME=Your Admin Name
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=your_strong_password
```

Make sure MongoDB is running and the environment variables are set. Then create the admin account:

```bash
node seedAdmin.js
```

Start the backend:

```bash
npm run dev
```

### 3. Set up the frontend

Open another terminal:

```bash
cd frontend
npm install
```

Create a `.env` file in the frontend folder:

```env
VITE_API_URL=http://localhost:5000
```

Start the frontend:

```bash
npm run dev
```

Open `http://localhost:5173` in your browser. The admin login page is available at `http://localhost:5173/admin/login`.

## API routes

| Feature | Method | Endpoint | Access |
|---|---|---|---|
| Register | POST | `/users/register` | Public |
| User login | POST | `/users/login` | Public |
| User profile | GET | `/users/profile` | Customer |
| Admin login | POST | `/admin/login` | Public |
| Get products | GET | `/products` | Public |
| Get one product | GET | `/products/:id` | Public |
| Add product | POST | `/products` | Admin |
| Update product | PUT | `/products/:id` | Admin |
| Delete product | DELETE | `/products/:id` | Admin |
| Get cart | GET | `/cart` | Customer |
| Add to cart | POST | `/cart` | Customer |
| Update cart item | PUT | `/cart/:productId` | Customer |
| Remove cart item | DELETE | `/cart/:productId` | Customer |
| Place order | POST | `/orders` | Customer |
| My orders | GET | `/orders/my` | Customer |
| Get order details | GET | `/orders/:id` | Order owner |
| Get all orders | GET | `/orders` | Admin |
| Update order status | PUT | `/orders/:id/status` | Admin |
| Upload images | POST | `/upload` | Admin |

Product listing supports query parameters such as `search` and `category`.

## Database models

The project uses these MongoDB models:

- **User:** name, email, password, and role
- **Admin:** name, email, and password
- **Product:** name, description, price, category, stock, and image URLs
- **Cart:** user reference and cart items with product references and quantities
- **Order:** user reference, purchased items, total price, shipping address, payment method, and order status

## Things I plan to add next

- [ ] Move image uploads to Cloudinary
- [ ] Add product reviews and ratings
- [ ] Add a wishlist
- [ ] Integrate online payments
- [ ] Use database transactions for order placement
- [ ] Add email notifications
- [ ] Deploy the frontend and backend

## License

This project was built for learning and portfolio purposes.