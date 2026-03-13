
# Employee Resubmission Flow After Rejection

## Current Behavior

On the **Basic Info Page** (`/employee/basic-info`):

* When **Basic Details are verified**, the form becomes **disabled** (not editable).
* When **Documents are verified**, the form is also **disabled**.
* However, employees still have the option to **upload documents again**.

Currently, the **Submit for Verification** button works only when:

* The employee **uploads all required documents**
* The employee **fills all basic details**

This works correctly **for the first submission**.

---

# Required Behavior

When HR **rejects documents**, the employee should be able to **resubmit documents for verification again**, but with the following rules:

### 1️⃣ Basic Details Should Remain Locked

If **basic details were already verified**, the employee **should not be able to edit them again**.

Meaning:

* Fields like name, PAN, DOB, Aadhaar, etc. should remain **disabled**.
* The employee **cannot modify verified basic details**.

Example:

```text
First Name: Hemanshu   (disabled)
Last Name: Choudhary   (disabled)
PAN Number: COEPC9277B (disabled)
```

---

# 2️⃣ Documents Can Be Reuploaded

If HR **rejects any document**, the employee should be able to:

* **Upload the rejected document again**
* Replace the old document.

Example:

Rejected Document:

```
PAN Card
Status: Rejected
Reason: Image not clear
```

Employee action:

```
Upload New PAN Card
```

---

# 3️⃣ Submit for Verification Button Should Appear Again

After the employee **reuploads the rejected documents**, the system should allow them to **submit again for verification**.

Meaning:

The **Submit for Verification button should appear again**, just like the **first submission flow**.

Button:

```
Submit for Verification
```

---

# 4️⃣ Enable Condition for Submit Button

The **Submit for Verification button should be enabled only when:**

* All required documents are uploaded
* Rejected documents are replaced
* Basic details are already present

Important rule:

Basic details **do not need to be edited again**.

---

# 5️⃣ Form Behavior Summary

| Section                 | Editable | When                |
| ----------------------- | -------- | ------------------- |
| Basic Details           | ❌ No     | If already verified |
| Documents               | ✅ Yes    | If rejected         |
| Submit for Verification | ✅ Yes    | After reupload      |

---

# 6️⃣ Employee Journey (Example)

### Step 1 — First Submission

Employee:

* Fills basic details
* Uploads documents
* Clicks **Submit for Verification**

HR reviews.

---

### Step 2 — HR Rejects Document

Example:

```
PAN Card → Rejected
Reason: Image not clear
```

---

### Step 3 — Employee Opens Basic Info Page

Now the page should behave like this:

Basic Details

```
All fields disabled
```

Documents

```
PAN Card → Reupload allowed
```

---

### Step 4 — Employee Reuploads Document

Employee uploads new PAN card.

---

### Step 5 — Submit Again

The **Submit for Verification button becomes active again**.

Employee clicks:

```
Submit for Verification
```

HR reviews again.

---

# 7️⃣ Final UI Behavior

### Basic Details Section

```
All fields disabled
Status: Verified
```

---

### Documents Section

```
PAN Card
Status: Rejected
Reason: Image not clear

[ Upload New Document ]
```

---

### Bottom Button

```
Submit for Verification
```

Enabled after required documents are uploaded.

---

# Final Goal

This system ensures:

✅ Basic details remain locked after verification
✅ Rejected documents can be reuploaded
✅ Employee can submit again for verification
✅ The **Submit for Verification flow works both for first submission and resubmission**
✅ HR receives the updated documents for review again

