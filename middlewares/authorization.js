exports.checkAdminAccess = (req, res, next) => {
  console.log("----------------------------------------2");
  const role = req.userData.role;
  if (role == 3 || role == 4) {
    next();
  } else {
    res.status(403).json({
      message: "You don't have access",
    });
  }
};


exports.checkSuperAdminAccess = (req, res, next) => {
  console.log("----------------------------------------3");
  const role = req.userData.role;
  if (role == 4) {
    next();
  } else {
    res.status(403).json({
      message: "You don't have access",
    });
  }
};
