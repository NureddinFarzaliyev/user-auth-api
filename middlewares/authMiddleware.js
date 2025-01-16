import jwt from 'jsonwebtoken';

export const requireAuth = (req, res, next) => {
    const token = req.cookies.jwt;

    if(token){
        jwt.verify(token, process.env.JWT_SECRET, (err, decodedToken) => {
            if(err){
                console.log(err.message)
                res.status(401).json({unathorized: "Unauthorized"})
            }else {
                console.log(decodedToken)
                next();
            }
        })
    }else {
        res.status(401).json({unathorized: "Unauthorized"})
    }
}


export const checkUser = (req, res, next) => {
    const token = req.cookies.jwt;

    if(token){
        jwt.verify(token, process.env.JWT_SECRET, (err, decodedToken) => {
            if(err){
                console.log(err.message)
                req.userId = null;
                next()
            }else {
                // console.log(decodedToken)
                req.userId = decodedToken.id;
                next(); 
            }
        })
    }else {
        req.userId = null;
        next();
    }
}