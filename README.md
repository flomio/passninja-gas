<p align="center">
    <img width="400px" src=https://user-images.githubusercontent.com/1587270/74537466-25c19e00-4f08-11ea-8cc9-111b6bbf86cc.png>
</p>
<h1 align="center">passninja-guestlist-gas</h1>
<h4 align="center">A repository for the PassNinja Google Apps Script demo to demonstrate PassNinja API functionality.</h4>

# Contents

- [Contents](#contents)
- [INSTALLATION](#installation)
- [CONTRIBUTING](#contributing)
  - [REQUIRED SETUP](#required-setup)
- [FUNCTIONALITY](#functionality)
  - [To Verify Sheet and Form creation](#to-verify-sheet-and-form-creation)
  - [To Verify Form Submission](#to-verify-form-submission)
  - [To Verify POST and GET requests](#to-verify-post-and-get-requests)
  - [To Verify Activating Pass Creation from the spreadsheet](#to-verify-activating-pass-creation-from-the-spreadsheet)
  - [To Verify Rebuilding from Config in an existing built spreadsheet](#to-verify-rebuilding-from-config-in-an-existing-built-spreadsheet)
- [Documentation](#documentation)
  - [API Endpoints](#api-endpoints)
  - [Functions](#functions)
  - [Utilities](#utilities)
      - [Generated with jsdoc2md](#generated-with-jsdoc2md)

# INSTALLATION
1.  Ask PassNinja to share this personal Google Apps Script (GAS) Project with you
1.  Open the GAS Project and open the `core.gs` file then run the `createSpreadsheet` function from `Menu->Run->Run function->createSpreadsheet`
1.  If this is your first time running it: it will ask for permission to run via a Google OAUTH popup which is required for functionality.
1.  Check your https://docs.google.com/spreadsheets/ drive and it should have created a new Spreadsheet called `"PassNinja Demo Spreadsheet - <ISO DATE>"`.  After the script is finished it will also email you and pop up with the link upon completion.
1.  Verify it worked when the `PassNinja` menu appears above after the entire sheet is finished loading!

[`^ Back to Top`](#contents)

# CONTRIBUTING
## REQUIRED SETUP
Requires Chrome.
1. Request access to the flomio/passninja-guestlist-gas Github repository from your passninja contact.
2. If you don't have it already, install the Google Apps Scripts [GitHub Assistant](https://chrome.google.com/webstore/detail/google-apps-script-github/lfjcgcmkmjjlieihflfhjopckgpelofo?hl=en) in chrome.
3. Navigate to [Google App Scripts](https://script.google.com/home/shared)
7. Now click the  **+ New Project** button on the top left of your screen. 
5. Once the script editor opens click **Ctrl+S** or **Cmd+S** to save and name your project.
6. Then right click on the file called `Code.gs` and rename it (a collision occurs on GitHub pull without renaming the file). 
7. Log in to GitHub clicking the **login SCM** button and entering your GitHub Credentials.  You may have to generate a GitHub token by following these instructions:
	1. On any GitHub page, click your profile icon and then click Settings.
	2. On the sidebar, click Personal access tokens.
	3. Click Generate new token.
	4. Add a token description and click Generate token.
	5. Copy the token to a secure location or password management app. For security reasons, after you leave the page, you can no longer see the token again.
	6. Enter the token into the github login window back at the Scripts page.
8. Now that you are logged in, click the dropdown button that says **Repository** and select `flomio/passninja-guestlist-gas` from the list (if its not there, ask your passninja rep to double check that was shared, and ensure that you have accepted the invitiation that comes to you in an email from GitHub).
9. **IMPORTANT** - on the gear icon next to your repository and branch settings sclick and check the "Manage manifest file"
![alt text](https://user-images.githubusercontent.com/1587270/77801817-f8602800-704f-11ea-9238-9f37b22a5c16.png "Settings icon")
![alt text](https://user-images.githubusercontent.com/1587270/77801857-0dd55200-7050-11ea-83f3-3e1bc56cfc05.png "Manifest Checkbox")
10. Now click the down arrow to the right of the **Repository** and **Branch** buttons to bring the code into your editor.
11. [INSTALLATION](#installation)

[`^ Back to Top`](#contents)

# FUNCTIONALITY
## To Verify Sheet and Form creation
1.  `Menu->PassNinja->Create Default Sheet(s)->Create Config Sheet`  This will build the Config sheet where you have to enter passType and at least one field to generate the rest of the sheets.  I used `gas.coupondemo` and fields `fullName`, `phoneNumber`, `email`, `discount` and toggled `fullName` and `discount` to Included in Pass? = "Y". 
1.  `Menu->PassNinja->Create Default Sheet(s)->Create/Update Sheets From Config` This will build the Sheets: `Form Responses #`, `Events`, `Contacts` and the connected Form (`Menu -> Form -> Edit Form` can help you verify that the form is correct and matches the fields you entered in the `Config` sheet.)

[`^ Back to Top`](#contents)

## To Verify Form Submission
1.  Check with `Menu -> Form -> Go to Live Form`
1.  Enter all the required field information (I made sure all "In Pass?: Y" fields are set as required)
1.  When it is submitted it will appear on the `Form Responses` sheet and also a new contact will be added to the `Contacts` sheet.  
1.  This contact will ALSO have an automatically generated pass, so if you sit tight a couple seconds it will appear.

[`^ Back to Top`](#contents)

## To Verify POST and GET requests
1.  Once you deploy the Script in the `Script Editor` using `Publish -> Deploy as Web App` and create a new version you should copy the resulting url.
1.  You can enter this Google Sheets API URL as the cognito user callback url (more information once I talk with @blairexico about this) and it should post the event stream for that pass type to the Events sheet.  See similar instructions here: https://github.com/flomio/passninja-api/pull/238
1.  Now you can feel free to manually do POST or GET requests at that url.  A GET request, if you add `?serialNumber=<YOUR SERIAL HERE>` will return the matching sheet entry that has that serial number in the Contacts sheet `serialNumber` column. The GET request I've been using looks like:
``` bash
curl --location --request GET 'https://script.google.com/macros/s/AKfycby9as7cTqifeqxU8o5_Hl4Rdy4t7vLLjVw_ZCYvqMsqI3Df8l3I/exec?serialNumber=random'
```
4.  The POST request that I've been sending resembles this:
``` bash
curl --location --request POST 'https://script.google.com/macros/s/AKfycby9as7cTqifeqxU8o5_Hl4Rdy4t7vLLjVw_ZCYvqMsqI3Df8l3I/exec' \
--header 'Content-Type: application/json' \
--data-raw '{
    "callback": "https://script.google.com/macros/s/asdf/dev",
    "date": "2020-02-08T15:15:13.341Z",
    "event": {
      "passJson":
        "{\"formatVersion\":1,\"description\":\"Pass Entry for Employee Number 232\",\"passTypeIdentifier\":\"pass.com.passninja.passentry.demo\",\"organizationName\":\"PassEntry\",\"teamIdentifier\":\"Q338UYGFZ8\",\"serialNumber\":\"810ce8e0-1f11-4e29-a35e-cdf326fb90c2\",\"backgroundColor\":\"rgb(41, 50, 58)\",\"labelColor\":\"rgb(255, 132, 119)\",\"foregroundColor\":\"rgb(255, 255, 255)\",\"logoText\":\"PassEntry\",\"generic\":{\"headerFields\":[{\"key\":\"passId\",\"label\":\"PASS ID\",\"value\":\"232\"}],\"primaryFields\":[{\"key\":\"staffName\",\"label\":\"NAME\",\"value\":\"Nico Cary\"}],\"secondaryFields\":[{\"key\":\"jobRole\",\"label\":\"JOB ROLE\",\"value\":\"Chief Innovation Officer\"},{\"key\":\"passExpiry\",\"label\":\"PASS EXPIRY\",\"value\":\"23 December 2020\"}]},\"nfc\":{\"message\":\"810ce8e0-1f11-4e29-a35e-cdf326fb90c2\",\"encryptionPublicKey\":\"MDkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDIgADTkFu6xr9i4GKk1+Jn+UxayuuC+SQLfXA0sE5J5iQx3o=\"},\"webServiceURL\":\"https://api.passninja.com/thumbnail\",\"authenticationToken\":\"8e98126bb7e60666\"}",
      "passType": "passentry.demo",
      "serialNumber": "810ce8e0-1f11-4e29-a35e-cdf326fb90c2",
      "type": "APPLE_CREATE"
    },
    "id": "#niko@passentry.com#passentry.demo#810ce8e0-1f11-4e29-a35e-cdf326fb90c2"
}'
```
[`^ Back to Top`](#contents)

## To Verify Activating Pass Creation from the spreadsheet
1.  In the Contacts sheet, feel free to click anywhere in a row for a specific contact that has all the required fields filled out.
1.  Go to `Menu -> PassNinja -> Create A Pass` and the script should run.
1.  You will see the resulting pass + pass information output into the  contact's fields.

[`^ Back to Top`](#contents)

## To Verify Rebuilding from Config in an existing built spreadsheet
1.  You can add a field to the Config sheet or remove one (just press delete while highlighting the four columns in the row).
1.  Go to `Menu -> PassNinja -> Build/Update from Config` and it should run.
1.  The `Events` sheet will remain untouched
1.  The `Contacts` sheet headers will change but the data below will remain untouched (so the user can feel free to reorder them to fit the new headers and also not lose existing passes.)
1.  The `Form Responses` sheet will now be renamed to `Form Responses {DATE/TIME}` to indicate it is archived and a new `Form Responses` sheet will be created.
1.  The linked Form itself will be updated to the new fields specified in the `Config` sheet.

[`^ Back to Top`](#contents)

# Documentation

## [API Endpoints](docs/API.md)

## [Functions](docs/FUNCTIONS.md)

## [Utilities](docs/UTILS.md)

#### Generated with [jsdoc2md](https://github.com/jsdoc2md/jsdoc-to-markdown/wiki/Create-a-README-template)

[`^ Back to Top`](#contents)
