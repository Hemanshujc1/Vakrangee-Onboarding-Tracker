const express = require('express');
const router = express.Router();
const formController = require('../controllers/formController');
const applicationController = require('../controllers/forms/applicationController');
const gratuityController = require('../controllers/forms/gratuityController');
const mediclaimController = require('../controllers/forms/mediclaimController');
const ndaController = require('../controllers/forms/ndaController');
const declarationController = require('../controllers/forms/declarationController');
const tdsController = require('../controllers/forms/tdsController');
const epfController = require('../controllers/forms/epfController');
const employeeInfoController = require('../controllers/forms/employeeInfoController');
const authMiddleware = require('../middleware/authMiddleware');
const { upload, processSignature } = require('../middleware/uploadMiddleware');

// Route: /api/forms/auto-fill/:employeeId
router.get('/auto-fill/:employeeId', authMiddleware, formController.getAutoFillData);

// Route: /api/forms/save-employee-info
router.post('/save-employee-info', 
    authMiddleware, 
    upload.single('signature'), 
    processSignature,
    employeeInfoController.saveEmployeeInfo
);

// Route: /api/forms/verify-employee-info/:employeeId
router.post('/verify-employee-info/:employeeId', authMiddleware, employeeInfoController.verifyEmployeeInfo);

// Route: /api/forms/access/toggle/:employeeId
router.post('/access/toggle/:employeeId', authMiddleware, formController.toggleFormAccess);

// Route: /api/forms/mediclaim (Save/Submit)


router.post('/mediclaim', 
    authMiddleware, 
    upload.single('signature'), 
    processSignature, 
    processSignature, 
    mediclaimController.saveMediclaim
);

// Route: /api/forms/mediclaim/verify/:employeeId
router.post('/mediclaim/verify/:employeeId', authMiddleware, mediclaimController.verifyMediclaim);

// Route: /api/forms/nda (Save/Submit)
router.post('/nda',
    authMiddleware,
    upload.single('signature'),
    processSignature,
    ndaController.saveNDA
);

// Route: /api/forms/declaration (Save/Submit)
router.post('/declaration',
    authMiddleware,
    upload.single('signature'),
    processSignature,
    declarationController.saveDeclaration
);

// Route: /api/forms/declaration/verify/:employeeId
router.post('/declaration/verify/:employeeId', authMiddleware, declarationController.verifyDeclaration);

// Route: /api/forms/nda/verify/:employeeId
router.post('/nda/verify/:employeeId', authMiddleware, ndaController.verifyNDA);

// Route: /api/forms/tds (Save/Submit)
router.post('/tds',
    authMiddleware,
    upload.single('signature'),
    processSignature,
    tdsController.saveTDS
);

// Route: /api/forms/tds/verify/:employeeId
router.post('/tds/verify/:employeeId', authMiddleware, tdsController.verifyTDS);

// Route: /api/forms/application (Save/Submit)
router.post('/application',
    authMiddleware,
    upload.single('signature'),
    processSignature,
    applicationController.saveApplication
);

// Route: /api/forms/application/verify/:employeeId
router.post('/application/verify/:employeeId', authMiddleware, applicationController.verifyApplication);

// Route: /api/forms/epf (Save/Submit)
router.post('/epf',
    authMiddleware,
    upload.single('signature'),
    processSignature,
    epfController.saveEPF
);

// Route: /api/forms/epf/verify/:employeeId
router.post('/epf/verify/:employeeId', authMiddleware, epfController.verifyEPF);

// Route: /api/forms/gratuity (Save/Submit)
router.post('/gratuity',
    authMiddleware,
    upload.fields([{ name: 'signature', maxCount: 1 }, { name: 'rubber_stamp', maxCount: 1 }]),
    processSignature,
    gratuityController.saveGratuity
);

// Route: /api/forms/gratuity/verify/:employeeId
router.post('/gratuity/verify/:employeeId', authMiddleware, gratuityController.verifyGratuity);

module.exports = router;
