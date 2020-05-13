<p align="center">
    <img width="400px" src=https://user-images.githubusercontent.com/1587270/74537466-25c19e00-4f08-11ea-8cc9-111b6bbf86cc.png>
</p>
<h1 align="center">passninja-guestlist-gas</h1>
<h4 align="center">A repository for the PassNinja Google Apps Script demo to demonstrate PassNinja API functionality.</h4>

<div align="center">
    <a href="https://github.com/flomio/passninja-guestlist-gas/actions">
        <img src="https://github.com/flomio/passninja-guestlist-gas/workflows/DOCS/badge.svg" alt="docs CI build status"/>
    </a>
    <a href="https://github.com/flomio/passninja-guestlist-gas">
        <img alt="Status" src="https://img.shields.io/badge/status-active-success.svg" />
    </a>
    <a href="https://github.com/flomio/passninja-guestlist-gas/issues">
        <img alt="Issues" src="https://img.shields.io/github/issues/flomio/passninja-guestlist-gas.svg" />
    </a>
</div>

# Contents

- [Contents](#contents)
- [INSTALLATION](#installation)
- [Documentation](#documentation)
  - [API Endpoints](#api-endpoints)
  - [Functions](#functions)
  - [Utilities](#utilities)
  - [Generated with jsdoc2md](#generated-with-jsdoc2md)
- [CONTRIBUTING](#contributing)
  - [REQUIRED SETUP](#required-setup)
- [FUNCTIONALITY](#functionality)
  - [To Verify Sheet and Form creation](#to-verify-sheet-and-form-creation)
  - [To Verify Form Submission](#to-verify-form-submission)
  - [To Verify POST and GET requests](#to-verify-post-and-get-requests)
  - [To Verify Activating Pass Creation from the spreadsheet](#to-verify-activating-pass-creation-from-the-spreadsheet)
  - [To Verify Rebuilding from Config in an existing built spreadsheet](#to-verify-rebuilding-from-config-in-an-existing-built-spreadsheet)

# INSTALLATION

1.  Ask PassNinja to share this personal Google Apps Script (GAS) Project with you
1.  Open the GAS Project and open the `core.gs` file then run the `createSpreadsheet` function from `Menu->Run->Run function->createSpreadsheet`
1.  If this is your first time Starting it: it will ask for permission to run via a Google OAUTH popup which is required for functionality.
1.  The error that pops up is not actually an error but the link to your created spreadsheet! If you want to, copy paste from that error popup after clicking `Details` in the error. Otherwise: check your https://docs.google.com/spreadsheets/ drive and it should have created a new Spreadsheet called `"PassNinja Demo Spreadsheet - <ISO DATE>"`. After the script is finished it will also email you and pop up with the link upon completion.
1.  Verify it worked when the `PassNinja` menu appears above after the entire sheet is finished loading!

[`^ Back to Top`](#contents)

# Documentation

## [API Endpoints](docs/API.md)

## [Core Sheet Functions](docs/CORE.md)

## [Sheet AutoBuild Functions](docs/BUILD.md)

## [Functions](docs/FUNCTIONS.md)

## [Utilities](docs/UTILS.md)

#### Generated with [jsdoc2md](https://github.com/jsdoc2md/jsdoc-to-markdown/wiki/Create-a-README-template)

[`^ Back to Top`](#contents)

# [CONTRIBUTING](CONTRIBUTING.md)
