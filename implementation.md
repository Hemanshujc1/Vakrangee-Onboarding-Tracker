# Implementation Plan: Schema Refactor + Feature Additions

## Overview

The `employee_records` and `employee_master` tables have been restructured from flat columns into JSON grouped columns. All backend controllers, frontend hooks, components, and API payloads that previously accessed individual flat columns must be updated to read/write from/to the new JSON groups. Additionally, three new features are being added: dual-address form with "same as permanent" checkbox, document validation improvements, and new fields (Employee ID, Band, Level, Work Location) in the Add Employee/Admin modals.

## Decisions Log (from User Review)

| # | Decision | Resolution |
|---|---|---|
| 1 | `onboarding_hr_id` inside `job_info` JSON causes `JSON_EXTRACT` complexity | **Moved back to top-level flat FK columns** (`onboarding_hr_id`, `onboarding_hr_assigned_at`) — model already updated, DB resynced |
| 2 | `work_location` display (was a string, now `{state, district, city}`) | **Confirmed** — add `formatWorkLocation()` helper |
| 3 | Communication address when `is_same_as_permanent = true` | **Store full copy** of permanent address data always |

---

## 1. Database Schema Analysis

### `employee_records` (New Schema)

| Column | Type | Replaces (Old Flat Columns) |
|---|---|---|
| `employee_id` | INTEGER FK | unchanged |
| `personal_info` | JSON | `firstname`, `middlename`, `lastname`, `date_of_birth`, `gender`, `adhar_number`, `pan_number`, `pan_verified`, `blood_group` |
| `contact_info` | JSON | `personal_email_id`, `phone`, `emergency_contact_number`, `emergency_contact_name`, `emergency_contact_relationship` |
| `address_info` | JSON (array of 2) | `address_line1`, `address_line2`, `landmark`, `post_office`, `pincode`, `city`, `district`, `state`, `country` → now split into **Permanent** + **Communication** (comm always stores full copy) |
| `academic_details` | JSON | `tenth_percentage`, `twelfth_percentage`, `degree_name`, `degree_percentage` |
| `job_info` | JSON | `department_name`, `department_id`, `job_title`, `designation_id`, `date_of_joining`, `band`, `level` |
| `onboarding_hr_id` | **INTEGER FK (flat)** | Kept as top-level column for efficient `WHERE`/`JOIN` queries |
| `onboarding_hr_assigned_at` | **DATE (flat)** | Kept as top-level column alongside `onboarding_hr_id` |
| `work_location` | JSON | `work_location` (string) → now `{ state, district, city }` |
| `profile_photo` | STRING | unchanged |
| `signature` | STRING | unchanged |

### `employee_master` (New Schema)

| Column | Type | Replaces (Old Flat Columns) |
|---|---|---|
| `id`, `employee_id`, `role`, `company_email_id` | unchanged | unchanged |
| `employee_status` | JSON | `onboarding_stage`, `account_status`, `first_login_at`, `last_login_at`, `is_first_login`, `is_deleted`, `deleted_at`, `deleted_by` |
| `basic_info` | JSON | `basic_info_status`, `basic_info_verified_at`, `basic_info_verified_by`, `basic_info_rejection_reason`, `final_verification_email_sent` |
| `disabled_forms` | TEXT | unchanged |

> [!IMPORTANT]
> Sequelize does NOT support dot-notation field access (e.g. `employee.onboarding_stage`) on JSON columns. All reads must use `employee.employee_status?.onboarding_stage` and all writes must update the full JSON object.

---

## 2. Impacted Files

### Backend
| File | Impact |
|---|---|
| `models/EmployeeMaster.js` | Already updated |
| `models/EmployeeRecord.js` | Already updated |
| `controllers/employeeController.js` | MAJOR — all flat column reads/writes |
| `controllers/profileController.js` | MAJOR — all flat column reads/writes |
| `controllers/authController.js` | MEDIUM — register/login flat column reads |
| `utils/formHandler.js` | MEDIUM — onboarding_hr_id, basic_info_status, email fields |

### Frontend
| File | Impact |
|---|---|
| `hooks/useEmployeeProfile.js` | MAJOR — fetchProfile maps flat record fields |
| `utils/basicInfoHelpers.js` | MEDIUM — isProfileComplete checks flat field names |
| `pages/Employee/BasicInfo/basicInfoSchema.js` | MEDIUM — add dual-address fields |
| `Components/Employee/BasicInfo/AddressInformationSection.jsx` | MAJOR — dual-address UI rewrite |
| `Components/Admin/AddEmployeeModal.jsx` | MEDIUM — add new fields |
| `Components/Admin/AddAdminModal.jsx` | LOW — add employee_id field |

---

## 3. Backend Changes Required

### 3.1 JSON Access Pattern (applies everywhere)

```js
// Reading from EmployeeMaster
const empStatus = employee.employee_status || {};
const stage = empStatus.onboarding_stage;
const basicInfo = employee.basic_info || {};
const biStatus = basicInfo.basic_info_status;

// Writing to EmployeeMaster
employee.employee_status = { ...empStatus, onboarding_stage: "PRE_JOINING" };
await employee.save();

// Reading from EmployeeRecord
const pi = record.personal_info || {};
const ci = record.contact_info || {};
const ji = record.job_info || {};
const perm = (record.address_info || [])[0] || {};

// Writing to EmployeeRecord
record.personal_info = { ...pi, firstname: "John" };
record.job_info = { ...ji, band: "A", level: "L3" };
await record.save();
```

### 3.2 `authController.js`

**`register()`**:
- Accept new fields: `band`, `level`, `work_location` (`{state, district, city}`), `employeeId` (custom ID string).
- `EmployeeMaster.create()` → use JSON defaults for `employee_status` and `basic_info`.
- `EmployeeRecord.create()` → map all fields into JSON groups. `onboarding_hr_id` and `onboarding_hr_assigned_at` remain top-level flat columns (not inside `job_info`):
```js
await EmployeeRecord.create({
  employee_id: newEmployee.id,
  onboarding_hr_id: onboarding_hr_id || null,          // flat FK column
  onboarding_hr_assigned_at: onboarding_hr_id ? new Date() : null, // flat column
  personal_info: { firstname: firstName, lastname: lastName },
  contact_info: { personal_email_id: isEmployee ? username : null, phone },
  job_info: {
    department_name: department, department_id,
    job_title: jobTitle, designation_id,
    date_of_joining: startDate,
    band: band || null, level: level || null
  },
  work_location: work_location || null  // { state, district, city }
}, { transaction: t });
```

**`login()`**:
- `employeeRecord.account_status` → `empStatus.account_status`
- `employeeRecord.is_deleted` → `empStatus.is_deleted`
- `employeeRecord.is_first_login` → `empStatus.is_first_login`
- Update login timestamps via `employee_status` JSON update.
- `employeeRecord.account_status = 'ACTIVE'` → update `employee_status` JSON.

**`changePasswordFirstLogin()`**:
- `employeeRecord.update({ is_first_login: false })` → update `employee_status` JSON.

### 3.3 `employeeController.js`

All 10 functions need updating. Key changes per function:

**`getAllEmployees()`**:
- Remove `attributes` array from EmployeeRecord include.
- `onboarding_stage` → `emp.employee_status?.onboarding_stage`
- `account_status` → `emp.employee_status?.account_status`
- `firstname` → `record.personal_info?.firstname`
- `onboarding_hr_id` → **still `record.onboarding_hr_id`** (flat column, no change)
- `work_location` → format as string using `formatWorkLocation(record.work_location)` helper.
- `is_deleted` → `emp.employee_status?.is_deleted`.

**`getMe()`**:
- `employee.onboarding_stage` → `employee.employee_status?.onboarding_stage`
- `employee.basic_info_status` → `employee.basic_info?.basic_info_status`
- `record.firstname/lastname` → `record.personal_info?.firstname/lastname`

**`getDashboardStats()`**:
- All `employee.basic_info_status` → `employee.basic_info?.basic_info_status`
- All `employee.onboarding_stage` → `employee.employee_status?.onboarding_stage`
- `employee.basic_info_rejection_reason` → `employee.basic_info?.basic_info_rejection_reason`

**`getEmployeeById()`**:
- Remove `attributes` array, fetch full record.
- All flat field reads → JSON group reads.
- Address: return `permanent_address` (address_info[0]) and `communication_address` (address_info[1]).
- `onboarding_hr_id` is a **flat top-level column** — existing `EmployeeRecord.count({ where: { onboarding_hr_id: user.id } })` queries work as-is. ✅ No JSON_EXTRACT needed.
- All `basic_info_*` reads from `employee.basic_info`.
- All `first_login_at`, `last_login_at`, `account_status`, `onboarding_stage` from `employee.employee_status`.

**`updateEmployeeDetails()`**:
- Accept `band`, `level`, `work_location` (object) in req.body.
- `record.work_location = location` → `record.work_location = { state, district, city }`.
- `onboarding_hr_id`, `onboarding_hr_assigned_at` remain flat column updates (no change).
- All other record field updates → merge into JSON groups.
- All master field updates → merge into `employee_status`/`basic_info` JSON.

**`submitBasicInfo()`**:
- `mandatoryFields` array → check fields inside JSON groups:
```js
const pi = record.personal_info || {};
const ci = record.contact_info || {};
const perm = (record.address_info || [])[0] || {};
// check pi.firstname, pi.adhar_number, ci.personal_email_id, perm.address_line1, etc.
```
- `employee.basic_info_status` reads/writes → `employee.basic_info`.
- `employee.final_verification_email_sent` → `employee.basic_info`.

**`verifyBasicInfo()`**:
- `employee.basic_info_status`, `employee.basic_info_verified_by`, `employee.basic_info_verified_at`, `employee.basic_info_rejection_reason` → all in `employee.basic_info`.

**`advanceOnboardingStage()`**:
- `employee.onboarding_stage` → `employee.employee_status`.
- `employee.basic_info_rejection_reason` → `employee.basic_info`.

**`finalVerifyEmployee()`**:
- `employee.basic_info_status`, `employee.basic_info_rejection_reason` → `employee.basic_info`.
- `record.personal_email_id` → `record.contact_info?.personal_email_id`.
- `record.firstname/lastname` → `record.personal_info?.firstname/lastname`.
- `employee.final_verification_email_sent` → `employee.basic_info`.

**`deleteEmployee()`**:
- `employee.account_status`, `employee.is_deleted`, `employee.deleted_at`, `employee.deleted_by` → all update `employee.employee_status` JSON:
```js
employee.employee_status = {
  ...employee.employee_status,
  account_status: "Inactive",
  is_deleted: true,
  deleted_at: new Date(),
  deleted_by: requestingAdminId,
};
await employee.save();
```

### 3.4 `profileController.js`

**`getProfile()`**:
- `employeeMaster.basic_info_status` → `employeeMaster.basic_info?.basic_info_status`
- `employeeMaster.basic_info_rejection_reason` → `employeeMaster.basic_info?.basic_info_rejection_reason`
- `employeeMaster.basic_info_verified_by` → `employeeMaster.basic_info?.basic_info_verified_by`
- Return the `record` object as-is (frontend hook will be updated to handle JSON groups).

**`updateProfile()`**:
- Destructure `perm_*` and `comm_*` address fields from `req.body`.
- Map to JSON groups when saving:
  - `record.personal_info = { firstname, middlename, lastname, date_of_birth, gender, adhar_number, pan_number, pan_verified, blood_group }`
  - `record.contact_info = { personal_email_id, phone, emergency_contact_number, emergency_contact_name, emergency_contact_relationship }`
  - `record.address_info` — always store 2 entries:
```js
const permAddr = { address_type: "Permanent", address_line1: perm_address_line1, ..., is_same_as_permanent: false };
const commAddr = comm_same_as_permanent
  ? { ...permAddr, address_type: "Communication Address", is_same_as_permanent: true }  // full copy
  : { address_type: "Communication Address", address_line1: comm_address_line1, ..., is_same_as_permanent: false };
record.address_info = [permAddr, commAddr];
```
  - `record.academic_details = { tenth_percentage, twelfth_percentage, degree_name, degree_percentage }`
  - `record.job_info = { ...record.job_info, department_name, job_title }` (preserve HR-assigned fields like band, level)
  - `record.work_location = work_location` (received as JSON)
  - `onboarding_hr_id` and `onboarding_hr_assigned_at` stay as flat column updates (not inside job_info)
- Lock check: `employeeMaster.basic_info?.basic_info_status`.

### 3.5 `utils/formHandler.js`

- `sendHRSubmissionNotification()`: `record.onboarding_hr_id` → **still `record.onboarding_hr_id`** (flat column, no change ✅); name → `record.personal_info?.firstname/lastname`; email → `record.contact_info?.personal_email_id`.
- `sendVerificationNotification()`: name → `record.personal_info?.firstname/lastname`; email → `record.contact_info?.personal_email_id`.
- `checkAndUpdateBasicInfoStage()`: `employee.basic_info_status` → `employee.basic_info?.basic_info_status`; `employee.onboarding_stage` → `employee.employee_status?.onboarding_stage`.
- `checkAndUpdateOnboardingStage()`: `employee.onboarding_stage` → `employee.employee_status?.onboarding_stage`; update via `employee.employee_status = { ...empStatus, onboarding_stage: '...' }`.

### 3.6 Add `formatWorkLocation()` to backend responses

```js
const formatWorkLocation = (wl) =>
  wl ? [wl.city, wl.district, wl.state].filter(Boolean).join(', ') : null;
```

---

## 4. Frontend Changes Required

### 4.1 `hooks/useEmployeeProfile.js`

Update `fetchProfile()` → map JSON groups to form fields using `perm_` / `comm_` prefixes for address:

```js
const pi = record.personal_info || {};
const ci = record.contact_info || {};
const perm = (record.address_info || [])[0] || {};
const comm = (record.address_info || [])[1] || {};
const acad = record.academic_details || {};
const job = record.job_info || {};

reset({
  firstname: pi.firstname || "",
  // ... all personal fields from pi
  personal_email_id: ci.personal_email_id || "",
  // ... contact fields
  perm_address_line1: perm.address_line1 || "",
  perm_address_line2: perm.address_line2 || "",
  perm_landmark: perm.landmark || "",
  perm_post_office: perm.post_office || "",
  perm_pincode: perm.pincode || "",
  perm_city: perm.city || "",
  perm_district: perm.district || "",
  perm_state: perm.state || "",
  perm_country: perm.country || "India",
  comm_same_as_permanent: comm.is_same_as_permanent || false,
  comm_address_line1: comm.address_line1 || "",
  // ... all comm fields
  tenth_percentage: acad.tenth_percentage || "",
  // ... academic fields
  job_title: job.job_title || "",
  // ... job fields (read-only)
});
```

Update `onSubmit()` → ensure `perm_*` and `comm_*` fields are sent in payload; backend maps them.

### 4.2 `pages/Employee/BasicInfo/basicInfoSchema.js`

- Remove old flat address fields: `address_line1`, `city`, `district`, `state`, `pincode`, `post_office`, `country`.
- Add `perm_*` required fields and `comm_*` conditionally required fields.
- Update `defaultBasicInfoValues` with new `perm_*` / `comm_*` keys.
- Update `fieldToSectionMap` to map new field names to `"address"` section.

### 4.3 `Components/Employee/BasicInfo/AddressInformationSection.jsx` (Full Rewrite)

- Two sub-sections: **Permanent Address** and **Communication Address**.
- Permanent Address: Full state/district/city cascade + all address fields (required).
- **"Same as Permanent Address" checkbox logic**:
- When checked → auto-copy all `perm_*` values into `comm_*` fields via `setValue`, disable comm inputs.
- When unchecked → re-enable comm inputs, allow independent editing.
- **Always send both addresses to backend** — when checked, the full copy of permanent address is sent as communication address data (backend stores full copy, `is_same_as_permanent: true`).
- Separate state management for each address's location cascade.

### 4.4 `utils/basicInfoHelpers.js`

- `getSectionStatus("address")` → check `perm_*` prefixed fields.
- `isProfileComplete()` → check `perm_*` prefixed required address fields.
- Add `formatWorkLocation(wl)` helper.

### 4.5 `Components/Admin/AddEmployeeModal.jsx`

New fields:
- **Employee ID**: text input, optional (goes to `employee_id` field).
- **Band**: text input, optional.
- **Level**: text input, optional.
- **Work Location**: cascading `SearchableSelect` for State → District → City (same pattern as `AddressInformationSection`).

Updated `formData` initial state:
```js
employeeId: "",
band: "",
level: "",
work_location_state: "",
work_location_district: "",
work_location_city: "",
```

Updated `onAdd()` payload:
```js
work_location: { state: formData.work_location_state, district: formData.work_location_district, city: formData.work_location_city },
band: formData.band,
level: formData.level,
employee_id_custom: formData.employeeId,
```

### 4.6 `Components/Admin/AddAdminModal.jsx`

Add **Employee ID** text input only. Include in submit payload.

### 4.7 Document Validation UI

- `ProfileIdentitySection.jsx`: Add `*` to PAN Card and Aadhar Card upload labels.
- `AcademicDetailsSection.jsx`: Add `*` to 10th Marksheet, 12th Marksheet, Degree Certificate labels.
- `FinancialHRDocumentsSection.jsx`: Add `*` to Cancelled Cheque label.
- `SignatureSection.jsx`: Add `*` to Signature label.
- Ensure upload buttons are visually prominent when doc is pending.

---

## 5. API Payload Changes

| Endpoint | Old | New |
|---|---|---|
| `POST /api/auth/register` | `location: string` | `work_location: {state, district, city}`, `band`, `level`, `employeeId` |
| `GET /api/profile` response | Flat `record.*` | JSON group `record.personal_info`, `record.contact_info`, etc. |
| `PUT /api/profile` | Flat body fields | Add `perm_*`, `comm_*`, `comm_same_as_permanent` fields |
| `GET /api/employees/:id` response | Flat address, flat status | `permanent_address`, `communication_address`, status from `employee_status.*` |
| `PUT /api/employees/:id` | `location: string` | `work_location: {state, district, city}`, `band`, `level` |

---

## 6. Data Migration Considerations

> [!NOTE]
> Tables were dropped and recreated fresh. No existing data to migrate. However, update `scripts/create_super_admin.js` to use the new JSON schema format for `employee_status` and `basic_info`.

---

## 7. Step-by-Step Implementation Order

### Phase 1 — Backend 
1. `authController.js` — `register()`, `login()`, `changePasswordFirstLogin()`
2. `employeeController.js` — all 10 functions
3. `profileController.js` — `getProfile()`, `updateProfile()`
4. `utils/formHandler.js` — all 4 functions
5. `scripts/create_super_admin.js` — update JSON schema usage

### Phase 2 — Frontend Core 
6. `hooks/useEmployeeProfile.js` — `fetchProfile()` + `onSubmit()`
7. `pages/Employee/BasicInfo/basicInfoSchema.js` — dual-address schema
8. `utils/basicInfoHelpers.js` — update helpers + add `formatWorkLocation`

### Phase 3 — Dual Address Feature 
9. `Components/Employee/BasicInfo/AddressInformationSection.jsx` — full rewrite

### Phase 4 — Modal Enhancements 
10. `Components/Admin/AddEmployeeModal.jsx` — new fields + location cascade
11. `Components/Admin/AddAdminModal.jsx` — employee_id field

### Phase 5 — Document Validation UI 
12. Audit and update all document section components

### Phase 6 — Testing 
13. Run DB sync, test all flows end-to-end

---

## 8. Resolved Decisions

> [!NOTE]
> **`onboarding_hr_id` querying** — RESOLVED: `onboarding_hr_id` and `onboarding_hr_assigned_at` are **top-level flat FK columns** in `employee_records`. No `JSON_EXTRACT` needed. All existing `WHERE { onboarding_hr_id: id }` queries work as-is. Model updated and DB resynced.

> [!NOTE]
> **`work_location` display** — RESOLVED: Add `formatWorkLocation(wl)` helper to `employeeUtils.js`: `return wl ? [wl.city, wl.district, wl.state].filter(Boolean).join(', ') : null`. Use in all display locations.

> [!NOTE]
> **Communication address storage** — RESOLVED: Always store a **full copy** of the permanent address fields into the communication address entry when `is_same_as_permanent = true`. This ensures the data is always complete and consistent regardless of the flag value.
