# API Requirements — Pending Lists

**Input for all APIs:** `tscMasterId` (fetched from logged-in user)

---

## EXISTING APIs (Currently Used)

### Get Logged-in User's TSC Master ID
```
GET /master-data/v1/userMaster/get/{userMasterId}
```
Response field used: `tscMasterId`

---

### Update DFL's — "i" Icon List (Already Working)
```
GET /chowkimanagement/getFarmerDetailsFromSaleDisposalOfDFlsByTsc/{tscMasterId}
```
Currently returns: `fruitsId`, `raceName`, `lotNumberCrc`, `nameAndAddressOfTheFarm`, `ratePer100Dfls`, `numbersOfDfls`

---

### Search by Fruits ID (Used in Crop Inspection & Fitness Certificate)
**Step 1:**
```
POST /dbt/farmer-details/getInspectionFarmerDetailsByFruitsId
Body: { "fruitsId": "" }
```
**Step 2:**
```
GET /chowkimanagement/getInspectioninfoForFarmerFromSaleDisposalOfDFlsForNewApp/{fruitsId}
```
Returns: `raceName`, `lotNumberCrc`, `numbersOfDfls`, `ratePer100Dfls`, `saleAndDisposalId`

---

### Crop Inspection — Submit (InspectionDetails.tsx)
**Fetch inspection type dropdown:**
```
GET /chowkimanagement/cropInspection/getInspectionTypeForCropFromSaleAndDisposalOfDfl/{saleAndDisposalId}
```
**Submit:**
```
POST /chowkimanagement/cropInspection/add-crop-inspection-info
Body: { saleAndDisposalId, farmerId, fruitsId, cropInspectionTypeId, mountId, cropStatusId, date, note, latitude, longitude, locationCapturedAt }
```
**Upload Photo:**
```
POST /chowkimanagement/cropInspection/upload-crop-inspection
Body: multipartFile + cropInspectionId
```

---

### Fitness Certificate — Fetch Crop Inspection Details & Submit
**Fetch crop inspection data for FC:**
```
GET /chowkimanagement/cropInspection/getInspectionDetailsForSaleAndDisposalDFL/{saleAndDisposalId}
```
Returns: `note`, `cropDate`, `cropStatusName`, `mountName`, `reasonName`

**Submit FC:**
```
POST /chowkimanagement/cropInspection/add-fitness-info
Body: { farmerId, fruitsId, saleAndDisposalId, expectedCocoon, lotTestDetails, diseaseStatusId, noOfChandies, spunFromDate, spunToDate, transactionDate, fitnessCertificatePath }
```

---

## NEW APIs Required

### 1. Pending Crop Inspection List
```
GET /chowkimanagement/getPendingCropInspectionByTsc/{tscMasterId}
```
Records where crop inspection is **not yet done**.

**Fields required in response:**
- `fruitsId`
- `farmerName`
- `nameAndAddressOfTheFarm`
- `raceName`
- `lotNumberCrc`
- `numbersOfDfls`
- `ratePer100Dfls`
- `hatchingDate`
- `dispatchDate`
- `grainageName`
- `saleAndDisposalId`

---

### 2. Pending Fitness Certificate List
```
GET /chowkimanagement/getPendingFitnessCertificateByTsc/{tscMasterId}
```
Records where crop inspection is **done** but fitness certificate is **not yet issued**.

**Fields required in response:**
- `fruitsId`
- `farmerName`
- `nameAndAddressOfTheFarm`
- `raceName`
- `lotNumberCrc`
- `numbersOfDfls`
- `ratePer100Dfls`
- `cropInspectionDate`
- `cropStatusName`
- `mountName`
- `inspectionNote`
- `saleAndDisposalId`

---

### 3. Update DFL's — Add Extra Fields to Existing API
**Existing API:**
```
GET /chowkimanagement/getFarmerDetailsFromSaleDisposalOfDFlsByTsc/{tscMasterId}
```
Please add these **3 extra fields** to the existing response:
- `hatchingDate`
- `dispatchDate`
- `grainageName`
