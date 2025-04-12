/********************************************************************************
*  WEB322 – Assignment 05
* 
*  I declare that this assignment is my own work in accordance with Seneca's
*  Academic Integrity Policy:
* 
*  https://www.senecacollege.ca/about/policies/academic-integrity-policy.html
* 
*  Name: Niranjan Kunwar Student ID: 146303235 Date: 2025-04-12
*
*  Published URL: https://web322-assignment5-niranjan.vercel.app
*
********************************************************************************/

const express = require('express');
const path = require('path');
const dataService = require('./modules/data-service.js');

const app = express();
const HTTP_PORT = process.env.PORT || 3000;

// Set up EJS as the view engine
app.set('view engine', 'ejs');

// Middleware for parsing URL-encoded form data
app.use(express.urlencoded({ extended: true }));

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Routes

// Home page
app.get('/', (req, res) => {
    res.render('home', { page: '/' });
});

// About page
app.get('/about', (req, res) => {
    res.render('about', { page: '/about' });
});

// Sites route with query parameter support
app.get('/sites', async (req, res) => {
    try {
        let sites;
        if (req.query.region) {
            sites = await dataService.getSitesByRegion(req.query.region);
        } else if (req.query.provinceOrTerritory) {
            sites = await dataService.getSitesByProvinceOrTerritoryName(req.query.provinceOrTerritory);
        } else {
            sites = await dataService.getAllSites();
        }
        res.render('sites', { sites: sites, page: '/sites' });
    } catch (error) {
        res.status(404).render('404', { message: error, page: '' });
    }
});

// Site by ID route
app.get('/sites/:id', async (req, res) => {
    try {
        const site = await dataService.getSiteById(req.params.id);
        res.render('site', { site: site, page: '/sites' });
    } catch (error) {
        res.status(404).render('404', { message: error, page: '' });
    }
});

// Add Site - GET route
app.get('/addSite', async (req, res) => {
    try {
        const provincesAndTerritories = await dataService.getAllProvincesAndTerritories();
        res.render('addSite', { provincesAndTerritories: provincesAndTerritories, page: '/addSite' });
    } catch (error) {
        res.status(404).render('404', { message: error, page: '' });
    }
});

// Add Site - POST route
app.post('/addSite', async (req, res) => {
    try {
        await dataService.addSite(req.body);
        res.redirect('/sites');
    } catch (error) {
        res.render('500', { message: `I'm sorry, but we have encountered the following error: ${error}` });
    }
});

// Edit Site - GET route
app.get('/editSite/:id', async (req, res) => {
    try {
        const site = await dataService.getSiteById(req.params.id);
        const provincesAndTerritories = await dataService.getAllProvincesAndTerritories();
        res.render('editSite', { site: site, provincesAndTerritories: provincesAndTerritories, page: '' });
    } catch (error) {
        res.status(404).render('404', { message: error, page: '' });
    }
});

// Edit Site - POST route
app.post('/editSite', async (req, res) => {
    try {
        await dataService.editSite(req.body.siteId, req.body);
        res.redirect('/sites');
    } catch (error) {
        res.render('500', { message: `I'm sorry, but we have encountered the following error: ${error}` });
    }
});

// Delete Site route
app.get('/deleteSite/:id', async (req, res) => {
    try {
        await dataService.deleteSite(req.params.id);
        res.redirect('/sites');
    } catch (error) {
        res.render('500', { message: `I'm sorry, but we have encountered the following error: ${error}` });
    }
});

// 404 route - must be at the end
app.use((req, res) => {
    res.status(404).render('404', { message: 'Page Not Found', page: '' });
});

// Initialize the data service and start the server
dataService.initialize().then(() => {
    app.listen(HTTP_PORT, () => {
        console.log(`Server listening on port ${HTTP_PORT}`);
    });
}).catch(error => {
    console.error(`Failed to start server: ${error}`);
});
