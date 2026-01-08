const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./User');

// --- Employee Master ---
const EmployeeMaster = sequelize.define('EmployeeMaster', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: true, // Nullable initially? Or strictly linked? Assuming linked.
    references: {
      model: User,
      key: 'id',
    }
  },
  role: {
    type: DataTypes.ENUM('HR_SUPER_ADMIN', 'HR_ADMIN', 'EMPLOYEE'),
    allowNull: false,
    defaultValue: 'EMPLOYEE'
  },
  onboarding_stage: {
    type: DataTypes.ENUM('BASIC_INFO', 'PRE_JOINING', 'PRE_JOINING_VERIFIED', 'POST_JOINING', 'ACTIVE'),
    defaultValue: 'BASIC_INFO'
  },
  company_email_id: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: true,
  },
  first_login_at: {
    type: DataTypes.DATE,
    allowNull: true
  },
  last_login_at: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  tableName: 'employee_master',
  timestamps: true // createdAt, updatedAt
});

  // --- Employee Record (Merged with Basic Info) ---
  const EmployeeRecord = sequelize.define('EmployeeRecord', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    employee_id: {
      type: DataTypes.INTEGER,
      references: {
        model: EmployeeMaster,
        key: 'id'
      }
    },
    // Work Details
    department_name: DataTypes.STRING,
    job_title: DataTypes.STRING,
    date_of_joining: DataTypes.DATEONLY,
    onboarding_hr_id: {
      type: DataTypes.INTEGER,
      references: {
        model: User, 
        key: 'id'
      }
    },
    work_location: DataTypes.STRING,
  
    // Personal Details (Merged from BasicInformation)
    firstname: DataTypes.STRING,
    lastname: DataTypes.STRING,
    personal_email_id: DataTypes.STRING,
    phone: DataTypes.STRING,
    date_of_birth: DataTypes.DATEONLY,
    address_line1: DataTypes.STRING,
    address_line2: DataTypes.STRING,
    landmark: DataTypes.STRING,
    pincode: DataTypes.STRING,
    city: DataTypes.STRING,
    district: DataTypes.STRING,
    state: DataTypes.STRING,
    country: DataTypes.STRING,
    tenth_percentage: DataTypes.FLOAT,
    twelfth_percentage: DataTypes.FLOAT,
    adhar_number: DataTypes.STRING,
    pan_number: DataTypes.STRING,
    gender: DataTypes.STRING,
    profile_photo: DataTypes.STRING
  }, {
    tableName: 'employee_records',
    timestamps: false
  });
  
  // --- Forms (Pre & Post) ---
  const FormStatusEnum = DataTypes.ENUM('PENDING', 'SUBMITTED', 'VERIFIED');
  
  const PreJoiningForm = sequelize.define('PreJoiningForm', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    employee_id: {
      type: DataTypes.INTEGER,
      references: {
        model: EmployeeMaster,
        key: 'id'
      }
    },
    form_name: DataTypes.STRING,
    form_status: {
      type: FormStatusEnum,
      defaultValue: 'PENDING'
    },
    submitted_at: DataTypes.DATE,
    verified_at: DataTypes.DATE,
    verified_by: { // HR User ID
      type: DataTypes.INTEGER,
      references: {
        model: User,
        key: 'id'
      }
    }
  }, {
    tableName: 'pre_joining_forms',
    timestamps: false
  });
  
  const PostJoiningForm = sequelize.define('PostJoiningForm', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    employee_id: {
      type: DataTypes.INTEGER,
      references: {
        model: EmployeeMaster,
        key: 'id'
      }
    },
    form_name: DataTypes.STRING,
    form_status: {
      type: FormStatusEnum,
      defaultValue: 'PENDING'
    },
    submitted_at: DataTypes.DATE,
    verified_at: DataTypes.DATE,
    verified_by: { // HR User ID
      type: DataTypes.INTEGER,
      references: {
        model: User,
        key: 'id'
      }
    }
  }, {
    tableName: 'post_joining_forms',
    timestamps: false
  });
  
  // --- Associations ---
  // User <-> EmployeeMaster
  User.hasOne(EmployeeMaster, { foreignKey: 'user_id' });
  EmployeeMaster.belongsTo(User, { foreignKey: 'user_id' });
  
  // EmployeeMaster <-> EmployeeRecord
  EmployeeMaster.hasOne(EmployeeRecord, { foreignKey: 'employee_id' });
  EmployeeRecord.belongsTo(EmployeeMaster, { foreignKey: 'employee_id' });
  
  // EmployeeMaster <-> PreJoiningForm (One-to-Many)
  EmployeeMaster.hasMany(PreJoiningForm, { foreignKey: 'employee_id' });
  PreJoiningForm.belongsTo(EmployeeMaster, { foreignKey: 'employee_id' });
  
  // EmployeeMaster <-> PostJoiningForm (One-to-Many)
  EmployeeMaster.hasMany(PostJoiningForm, { foreignKey: 'employee_id' });
  PostJoiningForm.belongsTo(EmployeeMaster, { foreignKey: 'employee_id' });
  
  module.exports = {
    User,
    EmployeeMaster,
    EmployeeRecord,
    PreJoiningForm,
    PostJoiningForm
  };
