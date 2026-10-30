/** Movin Realty lead capture — deploy as a Google Apps Script Web App.
 * Create a Google Sheet, copy its ID into SHEET_ID, then Deploy > New deployment > Web app.
 * Execute as: Me. Access: Anyone. Copy the deployment URL into GOOGLE_SHEETS_WEB_APP_URL in script.js.
 * Do not put private credentials in the website source.
 */
const SHEET_ID = 'PASTE_GOOGLE_SHEET_ID_HERE';
const TAB_NAME = 'Website Leads';
function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const payload = JSON.parse((e && e.postData && e.postData.contents) || '{}');
    const sheet = SpreadsheetApp.openById(SHEET_ID);
    let tab = sheet.getSheetByName(TAB_NAME);
    if (!tab) tab = sheet.insertSheet(TAB_NAME);
    if (tab.getLastRow() === 0) {
      tab.appendRow(['Submitted At','Name','Phone','Email','Service','Destination','Message','Page']);
      tab.setFrozenRows(1);
    }
    tab.appendRow([
      new Date(),
      String(payload.name || '').slice(0,150),
      String(payload.phone || '').slice(0,50),
      String(payload.email || '').slice(0,200),
      String(payload.service || '').slice(0,100),
      String(payload.destination || '').slice(0,100),
      String(payload.message || '').slice(0,3000),
      String(payload.page || '').slice(0,500)
    ]);
    return ContentService.createTextOutput(JSON.stringify({ok:true})).setMimeType(ContentService.MimeType.JSON);
  } finally {
    lock.releaseLock();
  }
}
function doGet() {
  return ContentService.createTextOutput('Movin Realty lead endpoint is active.');
}
