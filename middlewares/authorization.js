

exports.checkAdminAccess = (req, res, next) => {
    const role = req.userData.role;
    console.log(role);
    if (role == 3 || role == 4) {
      next();
    } else {
      res.status(403).json({
        message: "You don't have access"
      });
    }
  };