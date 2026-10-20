import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// ProtectedRoute ko page aur adminOnly value milti hai → useAuth() se logged-in user milta hai → login check hota hai → zaroorat ho toh admin role check hota hai → check pass ho toh page show hota hai, warna redirect. means agar admin true pass ho raha hai aur user jo hai wo admin nhi hai to tu redirect kar de
// children: woh page jo is component ke andar likha hoga.
// adminOnly: batata hai ke page sirf admin ke liye hai ya nahi. Agar value pass na karo, toh default false hai.

//agar admin access false hai by Default, tu khali yeh check kare ga user Logged in hai tabhie Access do aur agar admin hai tu page ka access mat do 

// Sab theek ho to children wapas kar do, yani page dikha do.

const ProtectedRoute = ({children , adminOnly = false}) => {
    const {user} = useAuth()

    if(!user){
        return <Navigate to={adminOnly ? "/admin/login" : "/login"} replace />;
    }

    if(adminOnly && user.role !== "admin"){
        return <Navigate to="/" replace/>
    }

    return children

};

export default ProtectedRoute