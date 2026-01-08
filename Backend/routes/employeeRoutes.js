const express = require('express');
const router = express.Router();
const employeeController = require('../controllers/employeeController');
const protect = require('../middleware/authMiddleware'); 

router.get('/', employeeController.getAllEmployees); // Public for now/internal
router.get('/my-hr', protect, employeeController.getMyHR);
router.get('/:id', protect, employeeController.getEmployeeById);
router.put('/:id', protect, employeeController.updateEmployeeDetails);

module.exports = router;
