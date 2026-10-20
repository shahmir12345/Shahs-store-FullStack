import { Routes, Route } from "react-router-dom";

import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute"

import Home from "./pages/Home"
import Products from "./pages/Products";
import ProductDetail from "./pages/ProductDetail";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import Signup from "./pages/Signup";
import Login from "./pages/Login";
import MyOrders from "./pages/MyOrders";
import Dashboard from "./pages/admin/Dashboard";
import ManageProducts from "./pages/admin/ManageProducts";
import ManageOrders from "./pages/admin/ManageOrders";
import GuestRoute from "./components/GuestRoute";
import Footer from "./components/Footer";
import AdminLogin from "./pages/admin/AdminLogin";

function App(){

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar/>
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home/>}/>
          <Route path="/products" element={<Products/>}/>
          <Route path="/products/:id" element={<ProductDetail/>}/>
          
          <Route 
            path="/login" 
            element={<GuestRoute> <Login/> </GuestRoute>}/>

          <Route 
            path="/signup" 
            element={<GuestRoute> <Signup/> </GuestRoute>}/>

          <Route 
            path="/cart"
            element= {<ProtectedRoute><Cart/></ProtectedRoute>}
          />
          <Route 
            path="/checkout"
            element= {<ProtectedRoute><Checkout/></ProtectedRoute>}
          />
          <Route 
            path="/my-orders"
            element= {<ProtectedRoute><MyOrders/></ProtectedRoute>}
          />
          <Route 
            path="/admin"
            element= {<ProtectedRoute adminOnly><Dashboard/></ProtectedRoute>}
          />
          <Route
            path="/admin/products"
            element= {<ProtectedRoute adminOnly><ManageProducts /></ProtectedRoute>}
          >
          </Route>
          <Route
            path="/admin/orders"
            element= {<ProtectedRoute adminOnly><ManageOrders /></ProtectedRoute>}
          >
          </Route>
          <Route
            path="/admin/login"
            element={<GuestRoute><AdminLogin /></GuestRoute>}
          />
        </Routes>
      </main>
      <Footer/>
    </div>
  )

}

export default App; 