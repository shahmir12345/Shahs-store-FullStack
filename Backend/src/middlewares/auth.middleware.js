const jwt = require('jsonwebtoken')
const userModel = require('../models/user.model')
const adminModel = require('../models/admin.model')

exports.protect = async (req, res, next) => {
    try {
        const header = req.headers.authorization

        if(!header || !header.startsWith('Bearer ')){
            res.status(401).json({message: 'Unauthorized, No Token'})
        }

        //Split(' ') -> ["Bearer", "ABC123"][1] -> "ABC123"
        const token = header.split(' ')[1]
        const decoded = jwt.verify(token, process.env.JWT_SECRET)

        // console.log("TOKEN:", token)
        // console.log("DECODED:", decoded)    

        const user = await userModel.findById(decoded.id).select('-password')
        if(!user){
            res.status(401).json({message: 'User not found'})
        }

        // JWT mein iat (token kab bana) hota hai. Password badalne se pehle ke saare purane tokens ab reject ho jate hain, to agar kisi ne account hijack kiya tha to uska token bhi kaam nahi karega. Message “Not authorized” se shuru hota hai, to frontend ka axios interceptor khud logout karke login page par bhej dega. Seconds mein compare isliye kiya ke reset ke fauran baad naya login token ghalti se reject na ho.
        // Token creation < Password change : Toh token purana hai aur reject hona chahiye., getTime() milliseconds deta hai, jabke JWT iat seconds mein hota hai. Isliye milliseconds ko seconds mein convert kar rahe hain.
        if(
          user.passwordChangedAt &&
          decoded.iat < Math.floor(user.passwordChangedAt.getTime() / 1000)
        ) {
          return res.status(401).json({ message: "Not authorized, password changed. Please log in again." });
        }

        /** 
         * Matlab backend ne database se user nikala aur request ke andar us user ko attach kar diya.
         * Ab agla middleware req.user ko access kar sakta hai. Admin wala middleware bhi req.user ko access karega aur check karega ki user admin hai ya nahi. 
        */
        req.user = user
        next()

    }catch (error) {
        res.status(401).json({message: 'Unauthorized, Token Failed'})
    }
}

/**
 * router.delete("/delete-user/:id", protect, adminOnly, deleteUser);
 * agar admin hai to deleteUser chalega, nahi to adminOnly middleware 403 wapas karega.
 */

exports.protectAdmin = async (req, res, next) => {
    try {
      const header = req.headers.authorization;
  
      if (!header || !header.startsWith("Bearer ")) {
        return res.status(401).json({ message: "Not authorized, no token" });
      }
  
      const decoded = jwt.verify(header.split(" ")[1], process.env.JWT_SECRET);
  
      if (decoded.role !== "admin") {
        return res.status(403).json({ message: "Admin access only" });
      }
  
      const admin = await adminModel.findById(decoded.id).select("-password");
      if (!admin) {
        return res.status(401).json({ message: "Admin not found" });
      }
  
      req.admin = admin;    
      next();
    } catch (error) {
      res.status(401).json({ message: "Not authorized, token failed" });
    }
  };