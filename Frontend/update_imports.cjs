const fs = require('fs');
const path = require('path');

const files = [
  "src/pages/Login.jsx",
  "src/pages/Employee/BasicInfo/basicInfoSchema.js",
  "src/pages/Auth/ResetPassword.jsx",
  "src/utils/formDependencies.js",
  "src/Components/Profile/EditProfileForm.jsx",
  "src/Components/Admin/AddAdminModal.jsx",
  "src/Components/Admin/AddEmployeeModal.jsx"
];

files.forEach(file => {
  const fullPath = path.join(__dirname, file);
  if (fs.existsSync(fullPath)) {
    let content = fs.readFileSync(fullPath, 'utf8');
    // Replace "/validationSchemas" with "/validations"
    content = content.replace(/\/validationSchemas(['"])/g, '/validations$1');
    fs.writeFileSync(fullPath, content, 'utf8');
    console.log(`Updated ${file}`);
  } else {
    console.log(`Not found: ${file}`);
  }
});
