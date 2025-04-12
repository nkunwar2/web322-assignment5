/********************************************************************************
*  WEB322 – Assignment 05
* 
*  I declare that this assignment is my own work in accordance with Seneca's
*  Academic Integrity Policy:
* 
*  https://www.senecacollege.ca/about/policies/academic-integrity-policy.html
* 
*  Name: Niranjan Kunwar Student ID: 146303235 Date: 2025-03-23
*
*  Published URL: 
*
********************************************************************************/

require('dotenv').config();
require('pg'); // explicitly require the "pg" module
const Sequelize = require('sequelize');

// Create the sequelize object
let sequelize = new Sequelize(
  process.env.DB_DATABASE,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    dialect: 'postgres',
    port: 5432,
    dialectOptions: {
      ssl: { rejectUnauthorized: false }
    },
    query: { raw: true }
  }
);

// Define the ProvinceOrTerritory model
const ProvinceOrTerritory = sequelize.define('ProvinceOrTerritory', {
  code: {
    type: Sequelize.STRING,
    primaryKey: true
  },
  name: Sequelize.STRING,
  type: Sequelize.STRING,
  region: Sequelize.STRING,
  capital: Sequelize.STRING
}, {
  createdAt: false,
  updatedAt: false
});

// Define the Site model
const Site = sequelize.define('Site', {
  siteId: {
    type: Sequelize.STRING,
    primaryKey: true
  },
  site: Sequelize.STRING,
  description: Sequelize.TEXT,
  date: Sequelize.INTEGER,
  dateType: Sequelize.STRING,
  image: Sequelize.STRING,
  location: Sequelize.STRING,
  latitude: Sequelize.FLOAT,
  longitude: Sequelize.FLOAT,
  designated: Sequelize.INTEGER,
  provinceOrTerritoryCode: Sequelize.STRING,
  worldHeritageSite: {
    type: Sequelize.BOOLEAN,
    defaultValue: false
  }
}, {
  createdAt: false,
  updatedAt: false
});

// Define the relationship between Site and ProvinceOrTerritory
Site.belongsTo(ProvinceOrTerritory, { foreignKey: 'provinceOrTerritoryCode' });

// Initialize function
function initialize() {
  return new Promise((resolve, reject) => {
    sequelize.sync()
      .then(() => {
        resolve();
      })
      .catch((err) => {
        reject("Unable to sync the database: " + err);
      });
  });
}

// Get all sites
function getAllSites() {
  return new Promise((resolve, reject) => {
    Site.findAll({ include: [ProvinceOrTerritory] })
      .then((sites) => {
        if (sites.length > 0) {
          resolve(sites);
        } else {
          reject("No sites available.");
        }
      })
      .catch((err) => {
        reject("Error retrieving sites: " + err);
      });
  });
}

// Get site by ID
function getSiteById(id) {
  return new Promise((resolve, reject) => {
    Site.findAll({ 
      include: [ProvinceOrTerritory],
      where: { siteId: id }
    })
      .then((sites) => {
        if (sites.length > 0) {
          resolve(sites[0]);
        } else {
          reject("Unable to find requested site");
        }
      })
      .catch((err) => {
        reject("Error retrieving site: " + err);
      });
  });
}

// Get sites by province or territory name
function getSitesByProvinceOrTerritoryName(provinceOrTerritory) {
  return new Promise((resolve, reject) => {
    Site.findAll({
      include: [ProvinceOrTerritory], 
      where: { 
        '$ProvinceOrTerritory.name$': {
          [Sequelize.Op.iLike]: `%${provinceOrTerritory}%`
        }
      }
    })
      .then((sites) => {
        if (sites.length > 0) {
          resolve(sites);
        } else {
          reject(`Unable to find sites in province or territory: ${provinceOrTerritory}`);
        }
      })
      .catch((err) => {
        reject("Error retrieving sites: " + err);
      });
  });
}

// Get sites by region
function getSitesByRegion(region) {
  return new Promise((resolve, reject) => {
    Site.findAll({
      include: [ProvinceOrTerritory], 
      where: { 
        '$ProvinceOrTerritory.region$': region
      }
    })
      .then((sites) => {
        if (sites.length > 0) {
          resolve(sites);
        } else {
          reject(`Unable to find sites in region: ${region}`);
        }
      })
      .catch((err) => {
        reject("Error retrieving sites: " + err);
      });
  });
}

// Add a new site
function addSite(siteData) {
  return new Promise((resolve, reject) => {
    Site.create(siteData)
      .then(() => {
        resolve();
      })
      .catch((err) => {
        reject(err.errors[0].message);
      });
  });
}

// Edit an existing site
function editSite(id, siteData) {
  return new Promise((resolve, reject) => {
    Site.update(siteData, {
      where: { siteId: id }
    })
      .then(() => {
        resolve();
      })
      .catch((err) => {
        reject(err.errors[0].message);
      });
  });
}

// Delete a site
function deleteSite(id) {
  return new Promise((resolve, reject) => {
    Site.destroy({
      where: { siteId: id }
    })
      .then(() => {
        resolve();
      })
      .catch((err) => {
        reject(err.errors[0].message);
      });
  });
}

// Get all provinces and territories
function getAllProvincesAndTerritories() {
  return new Promise((resolve, reject) => {
    ProvinceOrTerritory.findAll()
      .then((provincesAndTerritories) => {
        resolve(provincesAndTerritories);
      })
      .catch((err) => {
        reject("Error retrieving provinces and territories: " + err);
      });
  });
}

module.exports = {
  initialize,
  getAllSites,
  getSiteById,
  getSitesByProvinceOrTerritoryName,
  getSitesByRegion,
  addSite,
  editSite,
  deleteSite,
  getAllProvincesAndTerritories
};

// Bulk insert code has been removed after initial database setup
