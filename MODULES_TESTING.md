# Module Testing Guide

Complete guide to test each of the 6 modules in the DataViz application.

---

## Quick Start

### Prerequisites
```bash
# Terminal 1 - Frontend
npm install
npm run dev

# Terminal 2 - Backend
cd server
pip install -r requirements.txt
python main.py
```

Frontend will be at: `http://localhost:3000`  
Backend API will be at: `http://localhost:8000`

---

## Module 1: File Upload Module

**Test File:** `test_data_simple.csv`

```csv
Name,Age,Salary,Department
Alice,28,50000,Engineering
Bob,35,65000,Sales
Charlie,42,75000,Management
Diana,31,55000,Engineering
Eve,29,52000,HR
```

### Testing Steps:

1. **Drag & Drop Test**
   - Drag the CSV file to the upload area
   - Observe: Icon highlights, file processes
   - Expected: Upload bar appears, then transitions to dashboard

2. **File Selection Test**
   - Click "Select File" button
   - Choose the test CSV file
   - Expected: Same behavior as drag & drop

3. **Type Validation Test**
   - Try uploading a `.txt` file
   - Expected: Error message "Invalid file type. Please upload a CSV or Excel file."

4. **Size Validation Test**
   - Create a file larger than 100MB (if possible)
   - Expected: Error message "File size exceeds 100MB limit."

### Success Indicators:
```
✓ File accepted without errors
✓ No validation messages appear
✓ Progress indicator shows during upload
✓ Automatic redirect to dashboard
```

---

## Module 2: File Metadata Module

**Located in:** Dashboard Overview section

### Testing Steps:

1. **Metadata Display Test**
   - Upload test file
   - Go to "Overview" tab
   - Look for metadata card at top
   - Expected: Should show:
     - File name: `test_data_simple.csv`
     - Row count: 5
     - Column count: 4
     - File type icon: 📄

2. **File Size Test**
   - Metadata card should display file size
   - Expected: Shows in bytes or MB format

3. **Upload Timestamp Test**
   - Check if "Uploaded" field shows current date/time
   - Expected: Current date and time displayed

### Testing Code:
```javascript
// Open browser console and run:
const metadata = document.querySelector('[data-metadata]');
console.log('Metadata visible:', !!metadata);
```

### Success Indicators:
```
✓ All 4 metric cards display
✓ Row/column counts are accurate
✓ File size shown in readable format
✓ Timestamp matches current time
```

---

## Module 3: Data Parsing Module (Backend)

**Location:** `/server/main.py`

### Testing via API:

1. **Create test CSV file**
```bash
curl -X POST \
  -F "file=@test_data_simple.csv" \
  http://localhost:8000/api/upload
```

2. **Expected Response Structure:**
```json
{
  "columns": ["Name", "Age", "Salary", "Department"],
  "data": [
    {"Name": "Alice", "Age": 28, "Salary": 50000, "Department": "Engineering"},
    ...
  ],
  "analysis": {
    "Name": {"dtype": "object", "unique": 5, ...},
    "Age": {"dtype": "int64", "mean": 33.0, ...},
    ...
  },
  "data_quality": {...},
  "insights": [...]
}
```

3. **CSV Encoding Test**
```bash
# Test file with special characters
echo "Name,Description
Product A,Élève français
Product B,Café" > test_encoding.csv

curl -X POST -F "file=@test_encoding.csv" http://localhost:8000/api/upload
```
Expected: Special characters preserved

4. **Excel File Test**
```bash
# Upload .xlsx file
curl -X POST -F "file=@test_data_simple.xlsx" http://localhost:8000/api/upload
```
Expected: Same response structure as CSV

### Success Indicators:
```
✓ Returns 200 status code
✓ Response includes all 5 keys (columns, data, analysis, etc.)
✓ Column names match CSV headers
✓ Data type detection is accurate
✓ No encoding errors
```

---

## Module 4: Data Preview Module

**Located in:** Dashboard "Preview" tab

### Testing Steps:

1. **Row Count Test**
   - Upload test file (5 rows)
   - Go to "Preview" tab
   - Count displayed rows
   - Expected: Shows first 50 rows (5 in this case)

2. **Column Headers Test**
   - Headers should match CSV columns
   - Expected: Name, Age, Salary, Department

3. **Data Display Test**
   - All values should be displayed correctly
   - Expected: Alice (28, 50000, Engineering), etc.

4. **Null Value Handling Test**
```csv
Name,Age,Score
Alice,28,100
Bob,,null
Charlie,42,95
```
Expected: Null values shown as "null" in italics

5. **Horizontal Scroll Test**
   - Upload file with many columns (10+)
   - Scroll horizontally
   - Expected: Smooth scrolling, headers sticky

6. **Large Dataset Test**
   - Upload file with 1000+ rows
   - Expected: Shows "Showing first 50 of 1000 rows"

### Success Indicators:
```
✓ All 50 rows (or less) display
✓ Column headers are sticky
✓ Null values formatted correctly
✓ Horizontal scroll works
✓ Row count indicator accurate
```

---

## Module 5: Column Analysis Module

**Located in:** Dashboard "Overview" tab (Column Analysis section)

### Testing Steps:

1. **Data Type Detection Test**
   - Upload test file
   - Go to "Overview" tab
   - Check "Type" badge for each column
   - Expected: 
     - Name → Text
     - Age → Integer
     - Salary → Decimal/Integer
     - Department → Text

2. **Missing Value Detection Test**
```csv
Name,Age,Salary
Alice,28,50000
Bob,,65000
Charlie,42,
```
Expected: 
- Age column shows "Missing: 1"
- Salary column shows "Missing: 1"

3. **Unique Count Test**
   - Check "Unique" field
   - Expected: Accurate count of unique values

4. **Statistical Measures Test**
   - For numeric columns check:
     - Mean: Average of all values
     - Median: Middle value
     - Std Dev: Standard deviation
     - Min/Max: Minimum and maximum
   - Expected: All values calculated correctly

### Test Data for Statistics:
```csv
Scores
100
95
90
85
80
```
Expected Statistics:
- Mean: 90
- Median: 90
- Min: 80
- Max: 100
- Std Dev: ~7.07

### Success Indicators:
```
✓ All column cards display
✓ Data types detected correctly
✓ Missing counts accurate
✓ Unique counts correct
✓ Statistics calculated properly
✓ Icons match data types
```

---

## Module 6: Visualization Control Module

**Located in:** Dashboard "Controls" tab

### Testing Steps:

1. **Chart Type Selection Test**
   - Go to "Controls" tab
   - Click "Chart Type" dropdown
   - Expected: Shows Bar, Line, Scatter, Histogram options

2. **Column Selector Test**
   - "X-Axis Column" dropdown should show all columns
   - "Y-Axis Column" dropdown should show all columns
   - Expected: All column names listed

3. **Chart Compatibility Test**
   - **Scatter Plot with Text Column:**
     - Select: X=Name, Y=Age, Chart=Scatter
     - Expected: Warning "Both axes must be numeric"
     - Button disabled

   - **Scatter Plot with Numeric Columns:**
     - Select: X=Age, Y=Salary, Chart=Scatter
     - Expected: No warning, button enabled

   - **Line Chart with Numeric Y:**
     - Select: X=Name, Y=Age, Chart=Line
     - Expected: Compatible, generates chart

   - **Bar Chart with Any Columns:**
     - Select: Any X, Any Y, Chart=Bar
     - Expected: Always compatible

4. **Generate Visualization Test**
   - Select valid configuration: X=Age, Y=Salary, Chart=Bar
   - Click "Generate Visualization"
   - Expected: Redirects to "Charts" tab with visualization

5. **Recommendations Display Test**
   - When valid numeric columns available
   - Expected: Shows "Numeric columns detected for scatter plot"

### Test Scenarios:

**Scenario 1: Valid Scatter**
```
X-Axis: Age (numeric)
Y-Axis: Salary (numeric)
Chart Type: Scatter
Result: ✓ Compatible - Chart generated
```

**Scenario 2: Invalid Scatter**
```
X-Axis: Department (text)
Y-Axis: Age (numeric)
Chart Type: Scatter
Result: ✗ Incompatible - Warning shown
```

**Scenario 3: Valid Line**
```
X-Axis: Department (text)
Y-Axis: Salary (numeric)
Chart Type: Line
Result: ✓ Compatible - Chart generated
```

### Success Indicators:
```
✓ All 4 chart types appear in dropdown
✓ All columns appear in selectors
✓ Incompatible combinations show warnings
✓ Generate button enables/disables correctly
✓ Recommendations display for valid selections
✓ Clicking Generate navigates to Charts tab
```

---

## Integration Testing

### End-to-End Test Flow:

1. **Upload Phase** (Module 1)
```
Upload test_data_simple.csv
→ File validated
→ Sent to backend
```

2. **Parsing Phase** (Module 3)
```
Backend receives file
→ Parses CSV
→ Analyzes columns
→ Returns JSON response
```

3. **Display Phase** (Modules 2, 4, 5)
```
Dashboard loads
→ Metadata displays
→ Preview table shows data
→ Column summaries load
```

4. **Visualization Phase** (Module 6)
```
Go to Controls tab
→ Select Age (X), Salary (Y)
→ Select Bar chart
→ Click Generate
→ Chart displays in Charts tab
```

---

## Automated Testing

### Test Data Sets

**test_data_simple.csv:**
```csv
Name,Age,Salary,Department
Alice,28,50000,Engineering
Bob,35,65000,Sales
Charlie,42,75000,Management
Diana,31,55000,Engineering
Eve,29,52000,HR
```

**test_data_numeric.csv:**
```csv
ID,Value1,Value2,Value3
1,100,200,300
2,150,250,350
3,200,300,400
4,120,220,320
5,180,280,380
```

**test_data_mixed.csv:**
```csv
Date,Category,Amount,Status
2024-01-01,A,1000,Active
2024-01-02,B,2000,Inactive
2024-01-03,A,1500,Active
2024-01-04,C,3000,Active
```

---

## Performance Testing

### Large File Test
```
File: 50MB CSV with 100K rows
Expected: Loads in < 5 seconds
Module 1: Upload completes with progress
Module 3: Backend parses efficiently
Module 4: Preview shows first 50 rows quickly
Module 5: Column analysis available
Module 6: Visualization generates smoothly
```

---

## Troubleshooting

| Issue | Module | Solution |
|-------|--------|----------|
| File not uploading | 1 | Check file format (CSV/XLSX) and size |
| Metadata not displaying | 2 | Ensure backend returns data |
| Preview shows no data | 4 | Check if parsing succeeded |
| Statistics missing | 5 | Verify numeric columns detected |
| Chart incompatibility | 6 | Ensure column types match chart type |

---

## Test Checklist

```
Module 1 - File Upload:
  □ Drag & drop works
  □ File selection works
  □ File validation works
  □ Progress indicator shows

Module 2 - File Metadata:
  □ File name displays
  □ Row count correct
  □ Column count correct
  □ File size shows
  □ Upload timestamp shows

Module 3 - Data Parsing:
  □ CSV parsed correctly
  □ Excel parsed correctly
  □ Encoding handled
  □ JSON response complete

Module 4 - Data Preview:
  □ First 50 rows display
  □ Headers sticky
  □ Null values formatted
  □ Scroll works
  □ Row count indicator shows

Module 5 - Column Analysis:
  □ Data types detected
  □ Missing counts shown
  □ Unique counts shown
  □ Statistics calculated
  □ Icons display

Module 6 - Visualization Control:
  □ Chart types show
  □ Column selectors work
  □ Compatibility validation works
  □ Generate button works
  □ Recommendations show
```

---

## Questions for Testing

1. Can you upload a CSV file without errors?
2. Does metadata show immediately after upload?
3. Are all 5 rows visible in the preview table?
4. Do column summaries show correct data types?
5. Can you generate a bar chart with Age vs Salary?
6. Does the scatter plot validation prevent invalid combinations?
7. Can you switch between all chart types?
8. Do error messages appear for invalid file types?
9. Does the app handle large files (100MB+)?
10. Are statistics calculations accurate?
