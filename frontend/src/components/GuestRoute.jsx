import React from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const GuestRoute = ({children}) => {
    const {user} = useAuth()

    if(user){
        return <Navigate to={user.role === "admin" ? "/admin" : "/"} replace />;
    }
    
    return children
}

export default GuestRoute