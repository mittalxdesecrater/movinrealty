/** MOVIN Realty website enquiry capture.
 * 1. Create/open the designated Google Sheet and paste its ID below.
 * 2. Deploy this project as a Web App: Execute as Me; access Anyone.
 * 3. Copy the /exec URL into GOOGLE_SHEETS_WEB_APP_URL in script.js.
 * 4. After every code change, create a new deployment version.
 */
const SHEET_ID = 'PASTE_GOOGLE_SHEET_ID_HERE';
const TAB_NAME = 'Website Leads';
const HEADERS = [
  'Lead Reference','Submitted At','Name','Phone','Email','Service',
  'Destination','Requirement','Budget','Consent','Message','Page',
  'Assigned To','Follow-up Date','Lead Status','Remarks','Conversion Status'
];

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    if (!SHEET_ID || SHEET_ID === 'PASTE_GOOGLE_SHEET_ID_HERE') {
      throw new Error('Configure SHEET_ID before accepting enquiries.');
    }
    const payload = JSON.parse((e && e.postData && e.postData.contents) || '{}');
    const spreadsheet = SpreadsheetApp.openById(SHEET_ID);
    let sheet = spreadsheet.getSheetByName(TAB_NAME);
    if (!sheet) sheet = spreadsheet.insertSheet(TAB_NAME);
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(HEADERS);
      sheet.setFrozenRows(1);
      sheet.getRange(1, 1, 1, HEADERS.length).setFontWeight('bold');
    }
    const leadRef = 'MOV-' + Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyyMMdd-HHmmss') + '-' + Math.floor(100 + Math.random() * 900);
    sheet.appendRow([
      leadRef,
      new Date(),
      clean_(payload.name, 150),
      clean_(payload.phone, 50),
      clean_(payload.email, 200),
      clean_(payload.service, 100),
      clean_(payload.destination, 100),
      clean_(payload.requirement, 500),
      clean_(payload.budget, 100),
      payload.consent === 'Yes' ? 'Yes' : 'No',
      clean_(payload.message, 3000),
      clean_(payload.page, 500),
      '',
      '',
      'New',
      '',
      'Pending'
    ]);
    return json_({ ok: true, leadReference: leadRef });
  } catch (error) {
    return json_({ ok: false, error: String(error.message || error) });
  } finally {
    lock.releaseLock();
  }
}

function doGet() {
  return ContentService.createTextOutput('MOVIN Realty lead endpoint is active.');
}

function clean_(value, maxLength) {
  const text = String(value || '').slice(0, maxLength);
  // Prevent user-entered values from being interpreted as spreadsheet formulas.
  return /^[=+@\\-]/.test(text) ? "'" + text : text;
}

function json_(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}