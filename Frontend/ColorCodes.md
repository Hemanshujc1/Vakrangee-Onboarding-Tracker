# Download Candidate Documents & Forms Feature

## Objective

Add a new **"Download Documents"** button in the Employee Detail page  that allows administrators to download multiple candidate documents and forms at once in a structured ZIP file.

## UI Requirements

### Download Button

* Add a button: **Download Documents**
* Clicking the button should open a modal/dialog.

### Document Selection Modal

The modal should display all uploaded/generated files for the selected candidate grouped by category:

#### Documents

* Aadhar Card
* PAN Card
* Passport
* Driving License
* Educational Certificates
* Experience Certificates
* Any other uploaded documents

#### Pre-Joining Forms

* Application Form
* Declaration Form
* Background Verification Form
* Other Pre-Joining Forms

#### Post-Joining Forms

* Employee Information Form
* Joining Form
* NDA
* Other Post-Joining Forms

### Selection Features

* Checkbox beside every file.
* "Select All" checkbox at the top.
* Individual category selection.
* Display file name and upload date.
* Show total selected files count.

## Download Functionality

When the admin clicks **Download Selected**:

1. Collect all selected files.
2. Generate a ZIP archive.
3. Preserve folder structure inside the ZIP.

### ZIP Structure

employee_name.zip

employee_name/

├── Documents/

│   ├── employee_name_Aadhar_Card.pdf

│   ├── employee_name_PAN_Card.pdf

│   └── employee_name_Passport.pdf

│

├── Pre Joining Forms/

│   ├── employee_name_Application_Form.pdf

│   ├── employee_name_Declaration_Form.pdf

│   └── employee_name_Background_Verification_Form.pdf

│

└── Post Joining Forms/

```
├── employee_name_Joining_Form.pdf

├── employee_name_Employee_Information_Form.pdf

└── employee_name_NDA.pdf
```

## Backend Requirements

* Create API endpoint:

  * POST /employees/:employeeId/download-documents

### Request Payload

{
"selectedFiles": [
{
"id": 1,
"category": "documents"
},
{
"id": 5,
"category": "preJoiningForms"
}
]
}

### Backend Process

* Validate selected file IDs.
* Fetch file paths from database/storage.
* Generate ZIP using folder structure above.
* Stream ZIP file to client.
* Automatically clean temporary ZIP files after download.

## Additional Requirements

* Handle missing files gracefully.
* Skip unavailable files and include download report.
* Show loading state while ZIP is being generated.
* Display success/error notifications.
* Support downloading large numbers of files efficiently using streams.
* Maintain original file extensions (.pdf, .jpg, .png, .docx, etc.).

## Expected Outcome

Admins can select any combination of employee documents, pre-joining forms, and post-joining forms, then download them as a single ZIP file with a clean and organized folder structure.
