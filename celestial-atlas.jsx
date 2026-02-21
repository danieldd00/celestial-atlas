"use client";

import { useState, useEffect, useRef, useCallback, useMemo, useReducer } from "react";

// ─── DATA LAYER ───────────────────────────────────────────────────────────────

const CELESTIAL_TYPES = ["planet", "star", "exoplanet", "moon", "dwarf planet"];

const DISCOVERY_METHODS = ["Direct observation", "Radial velocity", "Transit photometry", "Gravitational microlensing", "Imaging", "Astrometry", "Ancient observation"];

const CELESTIAL_DATA = [
  {
    id: "mercury",
    name: "Mercury",
    type: "planet",
    designation: "Sol I",
    distanceFromSun: 0.39,
    distanceUnit: "AU",
    mass: 0.055,
    massUnit: "M⊕",
    radius: 2439.7,
    radiusUnit: "km",
    gravity: 3.7,
    orbitalPeriod: 88,
    rotationPeriod: 1407.6,
    temperature: { min: -180, max: 430, avg: 167 },
    discoveryDate: "Ancient",
    discoveryMethod: "Ancient observation",
    atmosphere: ["Oxygen", "Sodium", "Hydrogen", "Helium"],
    composition: ["Iron core", "Silicate mantle"],
    rings: false,
    moons: 0,
    color: "#8c8c8c",
    accentColor: "#b5a07a",
    summary: "The smallest planet in the Solar System and closest to the Sun. Its surface is heavily cratered and resembles Earth's Moon.",
    facts: ["A year on Mercury is just 88 Earth days", "Mercury has no atmosphere to retain heat", "Its iron core makes up 75% of its radius"],
    missions: [
      { name: "Mariner 10", year: 1974, type: "Flyby", status: "Complete", detail: "First spacecraft to visit Mercury, mapping 45% of the surface across three flybys." },
      { name: "MESSENGER", year: 2011, type: "Orbiter", status: "Complete", detail: "Orbited Mercury for four years, confirming water ice in permanently shadowed craters." },
      { name: "BepiColombo", year: 2025, type: "Orbiter", status: "En Route", detail: "Joint ESA/JAXA mission currently in transit, expected to begin orbital science operations." },
    ],
  },
  {
    id: "venus",
    name: "Venus",
    type: "planet",
    designation: "Sol II",
    distanceFromSun: 0.72,
    distanceUnit: "AU",
    mass: 0.815,
    massUnit: "M⊕",
    radius: 6051.8,
    radiusUnit: "km",
    gravity: 8.87,
    orbitalPeriod: 225,
    rotationPeriod: 5832.5,
    temperature: { min: 462, max: 462, avg: 462 },
    discoveryDate: "Ancient",
    discoveryMethod: "Ancient observation",
    atmosphere: ["Carbon dioxide", "Nitrogen", "Sulfuric acid clouds"],
    composition: ["Iron core", "Rocky mantle", "Basaltic crust"],
    rings: false,
    moons: 0,
    color: "#e8cda0",
    accentColor: "#d4a843",
    summary: "Often called Earth's twin due to similar size, Venus has a runaway greenhouse effect creating the hottest surface in the Solar System.",
    facts: ["Venus rotates backward compared to most planets", "A day on Venus is longer than its year", "Surface pressure is 90 times that of Earth"],
    missions: [
      { name: "Venera 7", year: 1970, type: "Lander", status: "Complete", detail: "First spacecraft to successfully land on another planet and transmit data from the surface." },
      { name: "Magellan", year: 1990, type: "Orbiter", status: "Complete", detail: "Mapped 98% of the Venusian surface using synthetic aperture radar." },
      { name: "VERITAS", year: 2031, type: "Orbiter", status: "Planned", detail: "NASA Discovery mission to map Venus in high resolution and study its geology." },
    ],
  },
  {
    id: "earth",
    name: "Earth",
    type: "planet",
    designation: "Sol III",
    distanceFromSun: 1.0,
    distanceUnit: "AU",
    mass: 1.0,
    massUnit: "M⊕",
    radius: 6371,
    radiusUnit: "km",
    gravity: 9.81,
    orbitalPeriod: 365.25,
    rotationPeriod: 24,
    temperature: { min: -89, max: 57, avg: 15 },
    discoveryDate: "N/A",
    discoveryMethod: "Direct observation",
    atmosphere: ["Nitrogen", "Oxygen", "Argon", "Carbon dioxide"],
    composition: ["Iron-nickel core", "Silicate mantle", "Crust"],
    rings: false,
    moons: 1,
    color: "#4a90d9",
    accentColor: "#2d6eb5",
    summary: "The only known planet to harbor life. Earth's liquid water, magnetic field, and atmosphere create conditions uniquely suited for biology.",
    facts: ["Earth's rotation is gradually slowing", "The planet's magnetic field shields it from solar wind", "70% of the surface is covered by water"],
    missions: [
      { name: "Apollo 17", year: 1972, type: "Crewed", status: "Complete", detail: "Last crewed lunar mission; captured the iconic 'Blue Marble' photograph of Earth." },
      { name: "Terra (EOS)", year: 1999, type: "Orbiter", status: "Active", detail: "Flagship Earth observing satellite studying climate, weather, and environmental change." },
      { name: "PACE", year: 2024, type: "Orbiter", status: "Active", detail: "Studying ocean color and atmospheric aerosols to understand climate interactions." },
    ],
  },
  {
    id: "mars",
    name: "Mars",
    type: "planet",
    designation: "Sol IV",
    distanceFromSun: 1.52,
    distanceUnit: "AU",
    mass: 0.107,
    massUnit: "M⊕",
    radius: 3389.5,
    radiusUnit: "km",
    gravity: 3.72,
    orbitalPeriod: 687,
    rotationPeriod: 24.6,
    temperature: { min: -140, max: 20, avg: -63 },
    discoveryDate: "Ancient",
    discoveryMethod: "Ancient observation",
    atmosphere: ["Carbon dioxide", "Nitrogen", "Argon"],
    composition: ["Iron oxide surface", "Basaltic rock", "Iron core"],
    rings: false,
    moons: 2,
    color: "#c1440e",
    accentColor: "#e05d2c",
    summary: "The Red Planet is the most explored body in the Solar System beyond Earth, with evidence of ancient water and ongoing robotic exploration.",
    facts: ["Olympus Mons is the tallest volcano in the Solar System", "Mars has seasons similar to Earth", "Its thin atmosphere is 95% carbon dioxide"],
    missions: [
      { name: "Viking 1", year: 1976, type: "Lander", status: "Complete", detail: "First successful Mars lander, operated for over six years on the surface." },
      { name: "Curiosity", year: 2012, type: "Rover", status: "Active", detail: "Car-sized rover exploring Gale Crater, studying habitability and geology." },
      { name: "Perseverance", year: 2021, type: "Rover", status: "Active", detail: "Collecting samples for future return to Earth and testing oxygen production." },
    ],
  },
  {
    id: "jupiter",
    name: "Jupiter",
    type: "planet",
    designation: "Sol V",
    distanceFromSun: 5.2,
    distanceUnit: "AU",
    mass: 317.8,
    massUnit: "M⊕",
    radius: 69911,
    radiusUnit: "km",
    gravity: 24.79,
    orbitalPeriod: 4333,
    rotationPeriod: 9.9,
    temperature: { min: -145, max: -108, avg: -110 },
    discoveryDate: "Ancient",
    discoveryMethod: "Ancient observation",
    atmosphere: ["Hydrogen", "Helium", "Methane", "Ammonia"],
    composition: ["Hydrogen/helium atmosphere", "Metallic hydrogen", "Dense core"],
    rings: true,
    moons: 95,
    color: "#c8a55a",
    accentColor: "#d4b86a",
    summary: "The largest planet in the Solar System, a gas giant with a mass greater than all other planets combined. Its Great Red Spot is a storm larger than Earth.",
    facts: ["Jupiter has the shortest day of any planet at 9.9 hours", "The Great Red Spot has raged for at least 350 years", "Jupiter's magnetic field is 20,000 times stronger than Earth's"],
    missions: [
      { name: "Pioneer 10", year: 1973, type: "Flyby", status: "Complete", detail: "First spacecraft to traverse the asteroid belt and make direct observations of Jupiter." },
      { name: "Galileo", year: 1995, type: "Orbiter", status: "Complete", detail: "First spacecraft to orbit Jupiter, deploying an atmospheric probe." },
      { name: "Juno", year: 2016, type: "Orbiter", status: "Active", detail: "Polar orbit studying Jupiter's composition, gravity field, and magnetosphere." },
    ],
  },
  {
    id: "saturn",
    name: "Saturn",
    type: "planet",
    designation: "Sol VI",
    distanceFromSun: 9.54,
    distanceUnit: "AU",
    mass: 95.16,
    massUnit: "M⊕",
    radius: 58232,
    radiusUnit: "km",
    gravity: 10.44,
    orbitalPeriod: 10759,
    rotationPeriod: 10.7,
    temperature: { min: -178, max: -139, avg: -140 },
    discoveryDate: "Ancient",
    discoveryMethod: "Ancient observation",
    atmosphere: ["Hydrogen", "Helium", "Methane"],
    composition: ["Hydrogen/helium atmosphere", "Metallic hydrogen", "Rocky core"],
    rings: true,
    moons: 146,
    color: "#e8d5a3",
    accentColor: "#c9b87c",
    summary: "Famous for its spectacular ring system, Saturn is a gas giant with a density low enough to float on water.",
    facts: ["Saturn's rings are mostly water ice particles", "Wind speeds can reach 1,800 km/h", "Saturn could fit 764 Earths inside it"],
    missions: [
      { name: "Voyager 1", year: 1980, type: "Flyby", status: "Complete", detail: "Provided first detailed images of Saturn's rings and discovered several new moons." },
      { name: "Cassini-Huygens", year: 2004, type: "Orbiter", status: "Complete", detail: "Orbited Saturn for 13 years; Huygens probe landed on Titan." },
      { name: "Dragonfly", year: 2034, type: "Rotorcraft", status: "Planned", detail: "Nuclear-powered rotorcraft to explore Titan's surface and prebiotic chemistry." },
    ],
  },
  {
    id: "uranus",
    name: "Uranus",
    type: "planet",
    designation: "Sol VII",
    distanceFromSun: 19.2,
    distanceUnit: "AU",
    mass: 14.54,
    massUnit: "M⊕",
    radius: 25362,
    radiusUnit: "km",
    gravity: 8.69,
    orbitalPeriod: 30687,
    rotationPeriod: 17.2,
    temperature: { min: -224, max: -205, avg: -220 },
    discoveryDate: "1781",
    discoveryMethod: "Direct observation",
    atmosphere: ["Hydrogen", "Helium", "Methane"],
    composition: ["Icy mantle", "Hydrogen/helium atmosphere", "Rocky core"],
    rings: true,
    moons: 28,
    color: "#72b5c7",
    accentColor: "#5a9db5",
    summary: "An ice giant tilted on its side, Uranus orbits the Sun with an extreme axial tilt of 98 degrees, causing extreme seasonal variation.",
    facts: ["Uranus rotates on its side at 98° tilt", "It was the first planet discovered with a telescope", "Its blue-green color comes from methane ice clouds"],
    missions: [
      { name: "Voyager 2", year: 1986, type: "Flyby", status: "Complete", detail: "Only spacecraft to visit Uranus, discovering 10 new moons and 2 new rings." },
      { name: "Uranus Orbiter & Probe", year: 2032, type: "Orbiter", status: "Proposed", detail: "Highest-priority flagship mission recommended by the 2023 Planetary Science Decadal Survey." },
    ],
  },
  {
    id: "neptune",
    name: "Neptune",
    type: "planet",
    designation: "Sol VIII",
    distanceFromSun: 30.07,
    distanceUnit: "AU",
    mass: 17.15,
    massUnit: "M⊕",
    radius: 24622,
    radiusUnit: "km",
    gravity: 11.15,
    orbitalPeriod: 60190,
    rotationPeriod: 16.1,
    temperature: { min: -218, max: -200, avg: -214 },
    discoveryDate: "1846",
    discoveryMethod: "Astrometry",
    atmosphere: ["Hydrogen", "Helium", "Methane"],
    composition: ["Icy mantle", "Hydrogen/helium atmosphere", "Rocky core"],
    rings: true,
    moons: 16,
    color: "#3a5fcd",
    accentColor: "#4a7ae0",
    summary: "The most distant planet in the Solar System, Neptune was the first planet located through mathematical prediction rather than direct observation.",
    facts: ["Neptune has the strongest sustained winds—up to 2,100 km/h", "One Neptune year equals 165 Earth years", "It was predicted mathematically before being observed"],
    missions: [{ name: "Voyager 2", year: 1989, type: "Flyby", status: "Complete", detail: "Only spacecraft to visit Neptune, revealing the Great Dark Spot and active geysers on Triton." }],
  },
  {
    id: "proxima-b",
    name: "Proxima Centauri b",
    type: "exoplanet",
    designation: "Proxima Cen b",
    distanceFromSun: 4.24,
    distanceUnit: "ly",
    mass: 1.17,
    massUnit: "M⊕",
    radius: 7160,
    radiusUnit: "km",
    gravity: 10.9,
    orbitalPeriod: 11.2,
    rotationPeriod: null,
    temperature: { min: -39, max: -39, avg: -39 },
    discoveryDate: "2016",
    discoveryMethod: "Radial velocity",
    atmosphere: ["Unknown"],
    composition: ["Rocky (estimated)"],
    rings: false,
    moons: null,
    color: "#7a4e3a",
    accentColor: "#a0674d",
    summary: "The closest known exoplanet to Earth, orbiting within the habitable zone of Proxima Centauri, the nearest star to the Sun.",
    facts: ["Located just 4.24 light-years from Earth", "Orbits in the habitable zone of its red dwarf star", "A year lasts only 11.2 Earth days"],
    missions: [{ name: "Breakthrough Starshot", year: 2036, type: "Flyby", status: "Proposed", detail: "Proposed fleet of light-sail nanocraft accelerated by ground-based lasers to reach Proxima at 20% light speed." }],
  },
  {
    id: "trappist-1e",
    name: "TRAPPIST-1e",
    type: "exoplanet",
    designation: "TRAPPIST-1 e",
    distanceFromSun: 39.6,
    distanceUnit: "ly",
    mass: 0.692,
    massUnit: "M⊕",
    radius: 5797,
    radiusUnit: "km",
    gravity: 9.15,
    orbitalPeriod: 6.1,
    rotationPeriod: null,
    temperature: { min: -48, max: -22, avg: -27 },
    discoveryDate: "2017",
    discoveryMethod: "Transit photometry",
    atmosphere: ["Under investigation"],
    composition: ["Rocky, possibly iron-rich core"],
    rings: false,
    moons: null,
    color: "#4a6b8a",
    accentColor: "#5d85a8",
    summary: "One of seven Earth-sized planets in the TRAPPIST-1 system, considered the most promising candidate for habitability in the system.",
    facts: ["Part of a system with 7 rocky planets", "Located in the habitable zone", "JWST is actively studying its atmosphere"],
    missions: [{ name: "JWST Observations", year: 2023, type: "Telescope", status: "Active", detail: "James Webb Space Telescope conducting transmission spectroscopy to characterize the atmosphere." }],
  },
  {
    id: "kepler-442b",
    name: "Kepler-442b",
    type: "exoplanet",
    designation: "KOI-4742.01",
    distanceFromSun: 1206,
    distanceUnit: "ly",
    mass: 2.36,
    massUnit: "M⊕",
    radius: 8610,
    radiusUnit: "km",
    gravity: 12.4,
    orbitalPeriod: 112.3,
    rotationPeriod: null,
    temperature: { min: -40, max: 0, avg: -2.7 },
    discoveryDate: "2015",
    discoveryMethod: "Transit photometry",
    atmosphere: ["Unknown"],
    composition: ["Possibly rocky-water world"],
    rings: false,
    moons: null,
    color: "#3a7d5f",
    accentColor: "#4d9e78",
    summary: "A super-Earth exoplanet with one of the highest Earth Similarity Index scores ever recorded, orbiting in its star's habitable zone.",
    facts: ["Earth Similarity Index of 0.84", "Over 1,200 light-years from Earth", "Receives about 70% of the light Earth gets from the Sun"],
    missions: [{ name: "Kepler Space Telescope", year: 2015, type: "Telescope", status: "Complete", detail: "Discovered via the Kepler mission's transit method observations." }],
  },
  {
    id: "titan",
    name: "Titan",
    type: "moon",
    designation: "Saturn VI",
    distanceFromSun: 9.54,
    distanceUnit: "AU",
    mass: 0.0225,
    massUnit: "M⊕",
    radius: 2574.7,
    radiusUnit: "km",
    gravity: 1.35,
    orbitalPeriod: 15.9,
    rotationPeriod: 15.9,
    temperature: { min: -179, max: -179, avg: -179 },
    discoveryDate: "1655",
    discoveryMethod: "Direct observation",
    atmosphere: ["Nitrogen", "Methane", "Ethane"],
    composition: ["Water ice", "Rocky interior", "Subsurface ocean"],
    rings: false,
    moons: 0,
    color: "#c2a64e",
    accentColor: "#d4b85e",
    summary: "Saturn's largest moon and the only moon in the Solar System with a dense atmosphere. It features liquid methane lakes and rivers on its surface.",
    facts: ["Only moon with a substantial atmosphere", "Has liquid methane seas on its surface", "Larger than the planet Mercury"],
    missions: [
      { name: "Huygens Probe", year: 2005, type: "Lander", status: "Complete", detail: "First landing in the outer Solar System; descended through Titan's atmosphere for 2.5 hours." },
      { name: "Dragonfly", year: 2034, type: "Rotorcraft", status: "Planned", detail: "Will fly through Titan's thick atmosphere studying prebiotic chemistry at multiple sites." },
    ],
  },
  {
    id: "europa",
    name: "Europa",
    type: "moon",
    designation: "Jupiter II",
    distanceFromSun: 5.2,
    distanceUnit: "AU",
    mass: 0.008,
    massUnit: "M⊕",
    radius: 1560.8,
    radiusUnit: "km",
    gravity: 1.31,
    orbitalPeriod: 3.55,
    rotationPeriod: 3.55,
    temperature: { min: -220, max: -160, avg: -171 },
    discoveryDate: "1610",
    discoveryMethod: "Direct observation",
    atmosphere: ["Oxygen (trace)"],
    composition: ["Ice shell", "Subsurface ocean", "Silicate mantle"],
    rings: false,
    moons: 0,
    color: "#c4bfae",
    accentColor: "#9e9885",
    summary: "One of Jupiter's Galilean moons, Europa is believed to harbor a global saltwater ocean beneath its icy crust, making it a prime target in the search for extraterrestrial life.",
    facts: ["May have more liquid water than all of Earth's oceans", "Its ice shell is estimated to be 15–25 km thick", "Plumes of water vapor have been detected erupting from the surface"],
    missions: [
      { name: "Galileo", year: 1995, type: "Orbiter", status: "Complete", detail: "Provided the strongest evidence for a subsurface ocean through magnetic field measurements." },
      { name: "Europa Clipper", year: 2024, type: "Orbiter", status: "Active", detail: "Conducting detailed reconnaissance of Europa's ice shell and ocean through 49 planned flybys." },
    ],
  },
  {
    id: "enceladus",
    name: "Enceladus",
    type: "moon",
    designation: "Saturn II",
    distanceFromSun: 9.54,
    distanceUnit: "AU",
    mass: 0.000018,
    massUnit: "M⊕",
    radius: 252.1,
    radiusUnit: "km",
    gravity: 0.113,
    orbitalPeriod: 1.37,
    rotationPeriod: 1.37,
    temperature: { min: -240, max: -128, avg: -201 },
    discoveryDate: "1789",
    discoveryMethod: "Direct observation",
    atmosphere: ["Water vapor", "Nitrogen", "Carbon dioxide"],
    composition: ["Ice shell", "Subsurface ocean", "Silicate core"],
    rings: false,
    moons: 0,
    color: "#e8e8e8",
    accentColor: "#b0d0e0",
    summary: "A small but remarkable moon of Saturn with active geysers shooting water vapor and ice particles into space from its south polar region.",
    facts: ["Geysers feed material into Saturn's E ring", "Hydrothermal vents may exist on its ocean floor", "Organic molecules have been detected in its plumes"],
    missions: [
      { name: "Cassini", year: 2005, type: "Orbiter", status: "Complete", detail: "Discovered water plumes and flew through them, detecting complex organic molecules." },
      { name: "Enceladus Orbilander", year: 2038, type: "Orbiter/Lander", status: "Proposed", detail: "Concept mission to orbit then land, directly sampling plume material for biosignatures." },
    ],
  },
  {
    id: "sirius",
    name: "Sirius A",
    type: "star",
    designation: "α Canis Majoris",
    distanceFromSun: 8.6,
    distanceUnit: "ly",
    mass: 2.06,
    massUnit: "M☉",
    radius: 1189000,
    radiusUnit: "km",
    gravity: null,
    orbitalPeriod: null,
    rotationPeriod: null,
    temperature: { min: 9940, max: 9940, avg: 9940 },
    discoveryDate: "Ancient",
    discoveryMethod: "Ancient observation",
    atmosphere: ["Hydrogen", "Helium"],
    composition: ["Hydrogen fusion core", "Helium"],
    rings: false,
    moons: null,
    color: "#cfe0ff",
    accentColor: "#aac8ff",
    summary: "The brightest star in Earth's night sky, Sirius is a binary system consisting of a main-sequence star and a faint white dwarf companion.",
    facts: ["25.4 times more luminous than the Sun", "Its companion Sirius B is a white dwarf", "Known as the 'Dog Star' in Canis Major"],
    missions: [{ name: "Hipparcos", year: 1989, type: "Telescope", status: "Complete", detail: "ESA astrometry satellite that precisely measured Sirius's distance and proper motion." }],
  },
  {
    id: "betelgeuse",
    name: "Betelgeuse",
    type: "star",
    designation: "α Orionis",
    distanceFromSun: 650,
    distanceUnit: "ly",
    mass: 16.5,
    massUnit: "M☉",
    radius: 617100000,
    radiusUnit: "km",
    gravity: null,
    orbitalPeriod: null,
    rotationPeriod: null,
    temperature: { min: 3600, max: 3600, avg: 3600 },
    discoveryDate: "Ancient",
    discoveryMethod: "Ancient observation",
    atmosphere: ["Hydrogen", "Helium", "Molecular shells"],
    composition: ["Helium-fusing core", "Hydrogen envelope"],
    rings: false,
    moons: null,
    color: "#ff6040",
    accentColor: "#e04830",
    summary: "A red supergiant in Orion nearing the end of its life. Expected to explode as a supernova within the next 100,000 years.",
    facts: ["If placed at the Sun's position, it would engulf Jupiter's orbit", "Its brightness varies on an irregular cycle", "The 'Great Dimming' of 2019–2020 was caused by a dust cloud"],
    missions: [
      { name: "ALMA Observations", year: 2017, type: "Telescope", status: "Complete", detail: "Atacama Large Millimeter Array resolved the star's photosphere directly for the first time." },
      { name: "JWST Monitoring", year: 2024, type: "Telescope", status: "Active", detail: "Infrared observations studying mass-loss events and surface convection cells." },
    ],
  },
  {
    id: "pluto",
    name: "Pluto",
    type: "dwarf planet",
    designation: "134340 Pluto",
    distanceFromSun: 39.5,
    distanceUnit: "AU",
    mass: 0.0022,
    massUnit: "M⊕",
    radius: 1188.3,
    radiusUnit: "km",
    gravity: 0.62,
    orbitalPeriod: 90560,
    rotationPeriod: 153.3,
    temperature: { min: -240, max: -218, avg: -229 },
    discoveryDate: "1930",
    discoveryMethod: "Direct observation",
    atmosphere: ["Nitrogen", "Methane", "Carbon monoxide"],
    composition: ["Ice and rock", "Nitrogen ice plains", "Water ice mountains"],
    rings: false,
    moons: 5,
    color: "#c4a882",
    accentColor: "#a88e6a",
    summary: "Once classified as the ninth planet, Pluto is now recognized as the most famous dwarf planet, featuring a heart-shaped nitrogen glacier called Tombaugh Regio.",
    facts: ["Pluto's heart-shaped glacier is larger than Texas", "It has a thin atmosphere that freezes and falls as snow", "Pluto and its moon Charon are tidally locked to each other"],
    missions: [{ name: "New Horizons", year: 2015, type: "Flyby", status: "Complete", detail: "First spacecraft to visit Pluto, revealing a geologically active world with mountains of water ice." }],
  },
  {
    id: "ceres",
    name: "Ceres",
    type: "dwarf planet",
    designation: "1 Ceres",
    distanceFromSun: 2.77,
    distanceUnit: "AU",
    mass: 0.00016,
    massUnit: "M⊕",
    radius: 473,
    radiusUnit: "km",
    gravity: 0.28,
    orbitalPeriod: 1682,
    rotationPeriod: 9.07,
    temperature: { min: -106, max: -34, avg: -73 },
    discoveryDate: "1801",
    discoveryMethod: "Direct observation",
    atmosphere: ["Water vapor (transient)"],
    composition: ["Clay minerals", "Water ice", "Carbonates"],
    rings: false,
    moons: 0,
    color: "#8a8a7a",
    accentColor: "#a0a090",
    summary: "The largest object in the asteroid belt and the only dwarf planet in the inner Solar System. Ceres features mysterious bright spots of sodium carbonate.",
    facts: ["Contains about a third of the asteroid belt's total mass", "Bright spots in Occator crater are salt deposits", "May have a subsurface layer of briny water"],
    missions: [{ name: "Dawn", year: 2015, type: "Orbiter", status: "Complete", detail: "First mission to orbit a dwarf planet, studying Ceres's surface composition and internal structure." }],
  },
  {
    id: "io",
    name: "Io",
    type: "moon",
    designation: "Jupiter I",
    distanceFromSun: 5.2,
    distanceUnit: "AU",
    mass: 0.015,
    massUnit: "M⊕",
    radius: 1821.6,
    radiusUnit: "km",
    gravity: 1.8,
    orbitalPeriod: 1.77,
    rotationPeriod: 1.77,
    temperature: { min: -183, max: -143, avg: -163 },
    discoveryDate: "1610",
    discoveryMethod: "Direct observation",
    atmosphere: ["Sulfur dioxide"],
    composition: ["Silicate rock", "Iron core", "Sulfur surface"],
    rings: false,
    moons: 0,
    color: "#d4c040",
    accentColor: "#e0d050",
    summary: "The most volcanically active body in the Solar System, with over 400 active volcanoes powered by intense tidal heating from Jupiter.",
    facts: ["Over 400 active volcanoes on its surface", "Tidal forces from Jupiter generate immense internal heat", "Its surface is constantly reshaped by volcanic activity"],
    missions: [
      { name: "Galileo", year: 1995, type: "Orbiter", status: "Complete", detail: "Made multiple close flybys, observing active volcanic eruptions and lava flows." },
      { name: "Juno Extended", year: 2024, type: "Orbiter", status: "Active", detail: "Close flybys providing highest-resolution images of Io's volcanic surface." },
    ],
  },
  {
    id: "kepler-22b",
    name: "Kepler-22b",
    type: "exoplanet",
    designation: "KOI-87.01",
    distanceFromSun: 635,
    distanceUnit: "ly",
    mass: 9.1,
    massUnit: "M⊕",
    radius: 15290,
    radiusUnit: "km",
    gravity: 12.5,
    orbitalPeriod: 290,
    rotationPeriod: null,
    temperature: { min: -11, max: -11, avg: -11 },
    discoveryDate: "2011",
    discoveryMethod: "Transit photometry",
    atmosphere: ["Unknown"],
    composition: ["Possibly ocean world or mini-Neptune"],
    rings: false,
    moons: null,
    color: "#5a8ab0",
    accentColor: "#6d9fc7",
    summary: "The first confirmed exoplanet in the habitable zone of a Sun-like star. Its size suggests it may be a water world or possess a thick atmosphere.",
    facts: ["First habitable zone planet found by Kepler around a Sun-like star", "About 2.4 times Earth's radius", "Orbital period is 290 days, similar to Earth's year"],
    missions: [{ name: "Kepler Space Telescope", year: 2011, type: "Telescope", status: "Complete", detail: "Confirmed as the first transiting planet in the habitable zone of a Sun-like star." }],
  },
];

// ─── HELPERS ──────────────────────────────────────────────────────────────────

function formatNumber(n) {
  if (n === null || n === undefined) return "—";
  if (n >= 1e9) return (n / 1e9).toFixed(1) + "B";
  if (n >= 1e6) return (n / 1e6).toFixed(1) + "M";
  if (n >= 1e3) return n.toLocaleString();
  return String(n);
}

function getTypeIcon(type) {
  const icons = {
    planet: "◉",
    star: "✦",
    exoplanet: "⊕",
    moon: "☽",
    "dwarf planet": "◎",
  };
  return icons[type] || "○";
}

function getTypeColor(type) {
  const colors = {
    planet: "var(--accent)",
    star: "#f0c040",
    exoplanet: "#60b0e0",
    moon: "#a0a0b8",
    "dwarf planet": "#c0a080",
  };
  return colors[type] || "var(--accent)";
}

// ─── SVG LINEWORK COMPONENTS ──────────────────────────────────────────────────

function CornerBrackets({ className = "", size = 12, stroke = "var(--line)" }) {
  return (
    <>
      <svg className={`absolute top-0 left-0 ${className}`} width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <path d={`M0 ${size} L0 0 L${size} 0`} fill="none" stroke={stroke} strokeWidth="1" />
      </svg>
      <svg className={`absolute top-0 right-0 ${className}`} width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <path d={`M0 0 L${size} 0 L${size} ${size}`} fill="none" stroke={stroke} strokeWidth="1" />
      </svg>
      <svg className={`absolute bottom-0 left-0 ${className}`} width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <path d={`M0 0 L0 ${size} L${size} ${size}`} fill="none" stroke={stroke} strokeWidth="1" />
      </svg>
      <svg className={`absolute bottom-0 right-0 ${className}`} width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <path d={`M${size} 0 L${size} ${size} L0 ${size}`} fill="none" stroke={stroke} strokeWidth="1" />
      </svg>
    </>
  );
}

function SchematicFrame({ children, className = "", label = "", labelRight = "" }) {
  return (
    <div className={`relative ${className}`} style={{ padding: "1px" }}>
      <CornerBrackets size={10} />
      {label && (
        <span
          className="absolute text-xs font-mono tracking-widest uppercase"
          style={{
            top: "-8px",
            left: "18px",
            color: "var(--text-tertiary)",
            fontSize: "9px",
            letterSpacing: "0.15em",
            background: "var(--bg-primary)",
            padding: "0 6px",
          }}
        >
          {label}
        </span>
      )}
      {labelRight && (
        <span
          className="absolute text-xs font-mono"
          style={{
            top: "-8px",
            right: "18px",
            color: "var(--text-tertiary)",
            fontSize: "9px",
            background: "var(--bg-primary)",
            padding: "0 6px",
          }}
        >
          {labelRight}
        </span>
      )}
      <div style={{ padding: "12px 14px" }}>{children}</div>
    </div>
  );
}

function DashedSeparator({ className = "" }) {
  return (
    <div
      className={className}
      style={{
        height: "1px",
        background: `repeating-linear-gradient(90deg, var(--line) 0px, var(--line) 4px, transparent 4px, transparent 10px)`,
        opacity: 0.5,
      }}
    />
  );
}

function MeasurementLine({ label, value, className = "" }) {
  return (
    <div className={`flex items-center gap-2 ${className}`} style={{ fontSize: "11px", color: "var(--text-secondary)" }}>
      <span className="font-mono uppercase tracking-wider" style={{ fontSize: "9px", color: "var(--text-tertiary)", minWidth: "60px" }}>
        {label}
      </span>
      <div style={{ flex: 1, height: "1px", background: "var(--line)", opacity: 0.3 }} />
      <span className="font-mono" style={{ color: "var(--text-primary)" }}>
        {value}
      </span>
    </div>
  );
}

function GridOverlay() {
  return (
    <div
      className="pointer-events-none fixed inset-0"
      style={{
        opacity: 0.03,
        backgroundImage: `
          linear-gradient(var(--text-primary) 1px, transparent 1px),
          linear-gradient(90deg, var(--text-primary) 1px, transparent 1px)
        `,
        backgroundSize: "60px 60px",
        zIndex: 0,
      }}
    />
  );
}

// ─── STARFIELD BACKGROUND ─────────────────────────────────────────────────────

function Starfield() {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const w = (canvas.width = window.innerWidth);
    const h = (canvas.height = window.innerHeight);
    ctx.clearRect(0, 0, w, h);
    for (let i = 0; i < 200; i++) {
      const x = Math.random() * w;
      const y = Math.random() * h;
      const r = Math.random() * 1.2;
      const a = Math.random() * 0.4 + 0.05;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255,255,255,${a})`;
      ctx.fill();
    }
  }, []);
  return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none" style={{ zIndex: 0 }} />;
}

// ─── PLANET CANVAS RENDERER ───────────────────────────────────────────────────

function PlanetViewer({ color, accentColor, name, hasRings = false }) {
  const canvasRef = useRef(null);
  const animRef = useRef(null);
  const dragRef = useRef({ dragging: false, lastX: 0, lastY: 0, rotX: 0.3, rotY: 0, velX: 0, velY: 0.003 });
  const reducedMotion = useRef(false);

  useEffect(() => {
    reducedMotion.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const dpr = window.devicePixelRatio || 1;
    const size = 400;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    canvas.style.width = size + "px";
    canvas.style.height = size + "px";
    ctx.scale(dpr, dpr);

    const cx = size / 2;
    const cy = size / 2;
    const baseRadius = 110;

    function hexToRgb(hex) {
      const r = parseInt(hex.slice(1, 3), 16);
      const g = parseInt(hex.slice(3, 5), 16);
      const b = parseInt(hex.slice(5, 7), 16);
      return { r, g, b };
    }

    const baseColor = hexToRgb(color || "#888888");
    const accent = hexToRgb(accentColor || color || "#aaaaaa");

    function draw() {
      const d = dragRef.current;
      if (!d.dragging) {
        d.rotY += reducedMotion.current ? 0 : d.velY;
        d.velX *= 0.98;
        d.rotX += d.velX;
      }

      ctx.clearRect(0, 0, size, size);

      // Atmosphere glow
      const glowGrad = ctx.createRadialGradient(cx, cy, baseRadius * 0.9, cx, cy, baseRadius * 1.6);
      glowGrad.addColorStop(0, `rgba(${accent.r},${accent.g},${accent.b},0.08)`);
      glowGrad.addColorStop(0.5, `rgba(${accent.r},${accent.g},${accent.b},0.03)`);
      glowGrad.addColorStop(1, "transparent");
      ctx.fillStyle = glowGrad;
      ctx.fillRect(0, 0, size, size);

      // Rings (behind planet)
      if (hasRings) {
        ctx.save();
        ctx.translate(cx, cy);
        ctx.scale(1, 0.3 + Math.abs(Math.sin(d.rotX)) * 0.15);
        ctx.beginPath();
        ctx.ellipse(0, 0, baseRadius * 1.8, baseRadius * 1.8, 0, Math.PI, Math.PI * 2);
        ctx.strokeStyle = `rgba(${accent.r},${accent.g},${accent.b},0.15)`;
        ctx.lineWidth = 12;
        ctx.stroke();
        ctx.beginPath();
        ctx.ellipse(0, 0, baseRadius * 1.55, baseRadius * 1.55, 0, Math.PI, Math.PI * 2);
        ctx.strokeStyle = `rgba(${accent.r},${accent.g},${accent.b},0.1)`;
        ctx.lineWidth = 6;
        ctx.stroke();
        ctx.restore();
      }

      // Planet sphere with lighting
      const lightX = -0.5;
      const lightY = -0.3;
      const planetGrad = ctx.createRadialGradient(cx + lightX * baseRadius * 0.5, cy + lightY * baseRadius * 0.5, baseRadius * 0.05, cx, cy, baseRadius);

      const br = baseColor.r;
      const bg = baseColor.g;
      const bb = baseColor.b;
      planetGrad.addColorStop(0, `rgb(${Math.min(255, br + 60)},${Math.min(255, bg + 60)},${Math.min(255, bb + 60)})`);
      planetGrad.addColorStop(0.4, `rgb(${br},${bg},${bb})`);
      planetGrad.addColorStop(0.75, `rgb(${Math.max(0, br - 40)},${Math.max(0, bg - 40)},${Math.max(0, bb - 40)})`);
      planetGrad.addColorStop(1, `rgb(${Math.max(0, br - 80)},${Math.max(0, bg - 80)},${Math.max(0, bb - 80)})`);

      ctx.beginPath();
      ctx.arc(cx, cy, baseRadius, 0, Math.PI * 2);
      ctx.fillStyle = planetGrad;
      ctx.fill();

      // Surface detail bands
      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, baseRadius, 0, Math.PI * 2);
      ctx.clip();

      for (let i = 0; i < 6; i++) {
        const bandY = cy + Math.sin(d.rotY * 2 + i * 1.1) * baseRadius * 0.7;
        const bandH = 3 + Math.sin(i * 2.3) * 3;
        ctx.fillStyle = `rgba(${i % 2 ? accent.r : br},${i % 2 ? accent.g : bg},${i % 2 ? accent.b : bb},0.08)`;
        ctx.fillRect(cx - baseRadius, bandY, baseRadius * 2, bandH);
      }
      ctx.restore();

      // Terminator shadow
      const termGrad = ctx.createLinearGradient(cx - baseRadius, cy, cx + baseRadius, cy);
      termGrad.addColorStop(0, "transparent");
      termGrad.addColorStop(0.55, "transparent");
      termGrad.addColorStop(0.8, "rgba(0,0,0,0.3)");
      termGrad.addColorStop(1, "rgba(0,0,0,0.6)");
      ctx.beginPath();
      ctx.arc(cx, cy, baseRadius, 0, Math.PI * 2);
      ctx.fillStyle = termGrad;
      ctx.fill();

      // Specular highlight
      const specGrad = ctx.createRadialGradient(cx + lightX * baseRadius * 0.4, cy + lightY * baseRadius * 0.4, 0, cx + lightX * baseRadius * 0.4, cy + lightY * baseRadius * 0.4, baseRadius * 0.6);
      specGrad.addColorStop(0, "rgba(255,255,255,0.12)");
      specGrad.addColorStop(0.3, "rgba(255,255,255,0.04)");
      specGrad.addColorStop(1, "transparent");
      ctx.beginPath();
      ctx.arc(cx, cy, baseRadius, 0, Math.PI * 2);
      ctx.fillStyle = specGrad;
      ctx.fill();

      // Rings (in front)
      if (hasRings) {
        ctx.save();
        ctx.translate(cx, cy);
        ctx.scale(1, 0.3 + Math.abs(Math.sin(d.rotX)) * 0.15);
        ctx.beginPath();
        ctx.ellipse(0, 0, baseRadius * 1.8, baseRadius * 1.8, 0, 0, Math.PI);
        ctx.strokeStyle = `rgba(${accent.r},${accent.g},${accent.b},0.2)`;
        ctx.lineWidth = 12;
        ctx.stroke();
        ctx.beginPath();
        ctx.ellipse(0, 0, baseRadius * 1.55, baseRadius * 1.55, 0, 0, Math.PI);
        ctx.strokeStyle = `rgba(${accent.r},${accent.g},${accent.b},0.12)`;
        ctx.lineWidth = 6;
        ctx.stroke();
        ctx.restore();
      }

      // Technical overlay crosshair
      ctx.strokeStyle = `rgba(${accent.r},${accent.g},${accent.b},0.12)`;
      ctx.lineWidth = 0.5;
      ctx.setLineDash([4, 6]);
      ctx.beginPath();
      ctx.moveTo(cx, cy - baseRadius - 30);
      ctx.lineTo(cx, cy + baseRadius + 30);
      ctx.moveTo(cx - baseRadius - 30, cy);
      ctx.lineTo(cx + baseRadius + 30, cy);
      ctx.stroke();
      ctx.setLineDash([]);

      // Small radius measurement arc
      ctx.beginPath();
      ctx.arc(cx, cy, baseRadius + 20, -0.3, 0.3);
      ctx.strokeStyle = `rgba(${accent.r},${accent.g},${accent.b},0.15)`;
      ctx.lineWidth = 0.5;
      ctx.stroke();

      animRef.current = requestAnimationFrame(draw);
    }

    draw();
    return () => cancelAnimationFrame(animRef.current);
  }, [color, accentColor, hasRings]);

  const onPointerDown = (e) => {
    dragRef.current.dragging = true;
    dragRef.current.lastX = e.clientX;
    dragRef.current.lastY = e.clientY;
  };
  const onPointerMove = (e) => {
    if (!dragRef.current.dragging) return;
    const dx = e.clientX - dragRef.current.lastX;
    const dy = e.clientY - dragRef.current.lastY;
    dragRef.current.rotY += dx * 0.005;
    dragRef.current.rotX += dy * 0.005;
    dragRef.current.velX = dy * 0.001;
    dragRef.current.lastX = e.clientX;
    dragRef.current.lastY = e.clientY;
  };
  const onPointerUp = () => {
    dragRef.current.dragging = false;
  };

  return (
    <div className="flex flex-col items-center justify-center" style={{ minHeight: "400px" }}>
      <canvas ref={canvasRef} onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={onPointerUp} onPointerLeave={onPointerUp} style={{ cursor: "grab", touchAction: "none" }} aria-label={`Interactive 3D visualization of ${name}`} />
      <p className="font-mono mt-2" style={{ fontSize: "9px", color: "var(--text-tertiary)", letterSpacing: "0.1em" }}>
        DRAG TO ROTATE · INTERACTIVE VIEW
      </p>
    </div>
  );
}

// ─── UI PRIMITIVE COMPONENTS ──────────────────────────────────────────────────

function Badge({ children, color }) {
  return (
    <span
      className="inline-flex items-center font-mono uppercase"
      style={{
        fontSize: "9px",
        letterSpacing: "0.12em",
        padding: "2px 8px",
        border: `1px solid ${color || "var(--line)"}`,
        color: color || "var(--text-secondary)",
        borderRadius: "1px",
      }}
    >
      {children}
    </span>
  );
}

function StatBlock({ label, value, unit }) {
  return (
    <div className="flex flex-col" style={{ minWidth: "80px" }}>
      <span className="font-mono uppercase" style={{ fontSize: "8px", letterSpacing: "0.15em", color: "var(--text-tertiary)" }}>
        {label}
      </span>
      <span className="font-mono" style={{ fontSize: "18px", color: "var(--text-primary)", fontWeight: 500, lineHeight: 1.2 }}>
        {value}
      </span>
      {unit && (
        <span className="font-mono" style={{ fontSize: "9px", color: "var(--text-secondary)" }}>
          {unit}
        </span>
      )}
    </div>
  );
}

function TabButton({ active, children, onClick }) {
  return (
    <button
      onClick={onClick}
      className="font-mono uppercase tracking-wider transition-all duration-200"
      style={{
        fontSize: "10px",
        letterSpacing: "0.15em",
        padding: "8px 16px",
        background: active ? "var(--bg-elevated)" : "transparent",
        color: active ? "var(--accent)" : "var(--text-tertiary)",
        border: "none",
        borderBottom: active ? "1px solid var(--accent)" : "1px solid transparent",
        cursor: "pointer",
      }}
    >
      {children}
    </button>
  );
}

function SearchInput({ value, onChange, onClear }) {
  const ref = useRef(null);
  useEffect(() => {
    const handler = (e) => {
      if (e.key === "/" && document.activeElement?.tagName !== "INPUT") {
        e.preventDefault();
        ref.current?.focus();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  return (
    <div className="relative flex items-center" style={{ maxWidth: "360px", width: "100%" }}>
      <span className="absolute left-3" style={{ color: "var(--text-tertiary)", fontSize: "14px" }}>
        ⌕
      </span>
      <input
        ref={ref}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search celestial objects..."
        className="w-full font-mono"
        style={{
          background: "var(--bg-elevated)",
          border: "1px solid var(--line)",
          color: "var(--text-primary)",
          padding: "10px 36px 10px 32px",
          fontSize: "12px",
          outline: "none",
          borderRadius: "2px",
        }}
        aria-label="Search celestial objects"
      />
      {value && (
        <button onClick={onClear} className="absolute right-2" style={{ color: "var(--text-tertiary)", background: "none", border: "none", cursor: "pointer", fontSize: "14px" }} aria-label="Clear search">
          ✕
        </button>
      )}
      <span className="absolute right-8 font-mono" style={{ fontSize: "9px", color: "var(--text-tertiary)", border: "1px solid var(--line)", padding: "1px 4px", borderRadius: "2px" }}>
        /
      </span>
    </div>
  );
}

function FilterChip({ label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className="font-mono uppercase transition-all duration-150"
      style={{
        fontSize: "9px",
        letterSpacing: "0.12em",
        padding: "4px 10px",
        background: active ? "var(--accent)" : "transparent",
        color: active ? "var(--bg-primary)" : "var(--text-tertiary)",
        border: `1px solid ${active ? "var(--accent)" : "var(--line)"}`,
        cursor: "pointer",
        borderRadius: "1px",
      }}
    >
      {label}
    </button>
  );
}

// ─── MISSION TIMELINE ─────────────────────────────────────────────────────────

function MissionTimeline({ missions, accentColor }) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 300);
    return () => clearTimeout(t);
  }, [missions]);

  const statusColors = {
    Complete: "var(--text-tertiary)",
    Active: "#40c060",
    "En Route": "var(--accent)",
    Planned: "#6090d0",
    Proposed: "#a080c0",
  };

  return (
    <div className="flex flex-col gap-0" role="list" aria-label="Mission timeline">
      {missions.map((m, i) => (
        <div
          key={m.name}
          className="flex gap-4"
          role="listitem"
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? "translateX(0)" : "translateX(-20px)",
            transition: `all 0.5s cubic-bezier(0.16,1,0.3,1) ${i * 120}ms`,
          }}
        >
          <div className="flex flex-col items-center" style={{ width: "32px" }}>
            <span className="font-mono" style={{ fontSize: "10px", color: "var(--text-tertiary)", whiteSpace: "nowrap" }}>
              {m.year}
            </span>
            <div style={{ width: "1px", flex: 1, background: "var(--line)", opacity: 0.3, margin: "4px 0" }} />
            <div
              style={{
                width: "7px",
                height: "7px",
                borderRadius: "50%",
                border: `1.5px solid ${statusColors[m.status] || "var(--line)"}`,
                background: m.status === "Active" ? statusColors[m.status] : "transparent",
              }}
            />
            {i < missions.length - 1 && <div style={{ width: "1px", flex: 1, background: "var(--line)", opacity: 0.3, margin: "4px 0" }} />}
          </div>
          <div style={{ padding: "0 0 20px 0", flex: 1 }}>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-mono" style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-primary)" }}>
                {m.name}
              </span>
              <Badge color={statusColors[m.status]}>{m.status}</Badge>
              <Badge>{m.type}</Badge>
            </div>
            <p style={{ fontSize: "12px", color: "var(--text-secondary)", margin: "6px 0 0", lineHeight: 1.5 }}>{m.detail}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── CELESTIAL CARD ───────────────────────────────────────────────────────────

function CelestialCard({ item, onClick, isWatchlisted, onToggleWatchlist, viewMode }) {
  const [hovered, setHovered] = useState(false);

  if (viewMode === "table") {
    return (
      <button
        onClick={onClick}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className="w-full text-left transition-all duration-200"
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 100px 100px 100px 80px",
          alignItems: "center",
          padding: "10px 16px",
          background: hovered ? "var(--bg-elevated)" : "transparent",
          borderBottom: "1px solid var(--line)",
          cursor: "pointer",
          border: "none",
          gap: "12px",
        }}
        aria-label={`View details for ${item.name}`}
      >
        <div className="flex items-center gap-3">
          <span style={{ color: getTypeColor(item.type), fontSize: "14px" }}>{getTypeIcon(item.type)}</span>
          <div>
            <span style={{ fontSize: "13px", fontWeight: 500, color: "var(--text-primary)" }}>{item.name}</span>
            <span className="font-mono ml-2" style={{ fontSize: "9px", color: "var(--text-tertiary)" }}>
              {item.designation}
            </span>
          </div>
        </div>
        <span className="font-mono" style={{ fontSize: "11px", color: "var(--text-secondary)" }}>
          {item.type}
        </span>
        <span className="font-mono" style={{ fontSize: "11px", color: "var(--text-secondary)" }}>
          {item.distanceFromSun} {item.distanceUnit}
        </span>
        <span className="font-mono" style={{ fontSize: "11px", color: "var(--text-secondary)" }}>
          {formatNumber(item.radius)} km
        </span>
        <span className="font-mono" style={{ fontSize: "10px", color: "var(--text-tertiary)" }}>
          {item.discoveryDate}
        </span>
      </button>
    );
  }

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="text-left relative transition-all duration-300"
      style={{
        background: hovered ? "var(--bg-elevated)" : "var(--bg-secondary)",
        border: `1px solid ${hovered ? "var(--accent)" : "var(--line)"}`,
        padding: 0,
        cursor: "pointer",
        overflow: "hidden",
        borderRadius: "2px",
      }}
      aria-label={`View details for ${item.name}`}
    >
      <CornerBrackets size={8} stroke={hovered ? "var(--accent)" : "var(--line)"} />

      {/* Mini planet preview */}
      <div className="flex items-center justify-center" style={{ height: "120px", position: "relative", overflow: "hidden" }}>
        <div
          style={{
            width: "60px",
            height: "60px",
            borderRadius: "50%",
            background: `radial-gradient(circle at 35% 35%, ${item.color}cc, ${item.color}40)`,
            boxShadow: hovered ? `0 0 30px ${item.color}30, 0 0 60px ${item.color}10` : "none",
            transition: "box-shadow 0.4s",
          }}
        />
        {/* Crosshair overlay */}
        <svg className="absolute inset-0 w-full h-full" style={{ opacity: hovered ? 0.2 : 0.06, transition: "opacity 0.3s" }}>
          <line x1="50%" y1="0" x2="50%" y2="100%" stroke="var(--text-primary)" strokeWidth="0.5" strokeDasharray="3 5" />
          <line x1="0" y1="50%" x2="100%" y2="50%" stroke="var(--text-primary)" strokeWidth="0.5" strokeDasharray="3 5" />
        </svg>
      </div>

      <div style={{ padding: "12px 14px 16px" }}>
        <div className="flex items-start justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <span style={{ color: getTypeColor(item.type), fontSize: "12px" }}>{getTypeIcon(item.type)}</span>
              <h3 style={{ fontSize: "15px", fontWeight: 600, color: "var(--text-primary)", margin: 0, lineHeight: 1.2 }}>{item.name}</h3>
            </div>
            <p className="font-mono" style={{ fontSize: "9px", color: "var(--text-tertiary)", margin: "2px 0 0", letterSpacing: "0.08em" }}>
              {item.designation}
            </p>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleWatchlist(item.id);
            }}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              fontSize: "14px",
              color: isWatchlisted ? "var(--accent)" : "var(--text-tertiary)",
              padding: "2px",
              lineHeight: 1,
            }}
            aria-label={isWatchlisted ? `Remove ${item.name} from watchlist` : `Add ${item.name} to watchlist`}
          >
            {isWatchlisted ? "★" : "☆"}
          </button>
        </div>

        <DashedSeparator className="my-3" />

        <div className="flex gap-4 flex-wrap">
          <div>
            <span className="font-mono uppercase block" style={{ fontSize: "8px", color: "var(--text-tertiary)", letterSpacing: "0.12em" }}>
              Dist
            </span>
            <span className="font-mono" style={{ fontSize: "12px", color: "var(--text-primary)" }}>
              {item.distanceFromSun} <span style={{ fontSize: "9px", color: "var(--text-secondary)" }}>{item.distanceUnit}</span>
            </span>
          </div>
          <div>
            <span className="font-mono uppercase block" style={{ fontSize: "8px", color: "var(--text-tertiary)", letterSpacing: "0.12em" }}>
              Mass
            </span>
            <span className="font-mono" style={{ fontSize: "12px", color: "var(--text-primary)" }}>
              {item.mass} <span style={{ fontSize: "9px", color: "var(--text-secondary)" }}>{item.massUnit}</span>
            </span>
          </div>
          <div>
            <span className="font-mono uppercase block" style={{ fontSize: "8px", color: "var(--text-tertiary)", letterSpacing: "0.12em" }}>
              Temp
            </span>
            <span className="font-mono" style={{ fontSize: "12px", color: "var(--text-primary)" }}>
              {item.temperature.avg}°C
            </span>
          </div>
        </div>
      </div>
    </button>
  );
}

// ─── DETAIL VIEW ──────────────────────────────────────────────────────────────

function DetailView({ item, onClose, onPrev, onNext, isWatchlisted, onToggleWatchlist }) {
  const [activeTab, setActiveTab] = useState("overview");
  const [entered, setEntered] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setEntered(true), 50);
    return () => clearTimeout(t);
  }, [item.id]);

  useEffect(() => {
    setEntered(false);
    const t = setTimeout(() => setEntered(true), 50);
    return () => clearTimeout(t);
  }, [item.id]);

  useEffect(() => {
    const handler = (e) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") onPrev();
      if (e.key === "ArrowRight") onNext();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose, onPrev, onNext]);

  const tabs = ["overview", "missions", "physical", "gallery"];

  return (
    <div
      className="fixed inset-0 flex flex-col"
      style={{
        background: "var(--bg-primary)",
        zIndex: 100,
        opacity: entered ? 1 : 0,
        transition: "opacity 0.4s cubic-bezier(0.16,1,0.3,1)",
      }}
      role="dialog"
      aria-label={`Details for ${item.name}`}
    >
      {/* Top Bar */}
      <header
        className="flex items-center justify-between"
        style={{
          padding: "12px 24px",
          borderBottom: "1px solid var(--line)",
          transform: entered ? "translateY(0)" : "translateY(-10px)",
          opacity: entered ? 1 : 0,
          transition: "all 0.5s cubic-bezier(0.16,1,0.3,1) 0.1s",
        }}
      >
        <div className="flex items-center gap-4">
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "1px solid var(--line)",
              color: "var(--text-secondary)",
              cursor: "pointer",
              padding: "6px 12px",
              fontSize: "11px",
              fontFamily: "monospace",
              borderRadius: "2px",
            }}
            aria-label="Close detail view"
          >
            ← BACK
          </button>
          <div className="flex items-center gap-2">
            <span style={{ color: getTypeColor(item.type), fontSize: "16px" }}>{getTypeIcon(item.type)}</span>
            <h1 style={{ fontSize: "20px", fontWeight: 600, color: "var(--text-primary)", margin: 0 }}>{item.name}</h1>
            <span className="font-mono" style={{ fontSize: "11px", color: "var(--text-tertiary)", marginLeft: "4px" }}>
              {item.designation}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => onToggleWatchlist(item.id)}
            className="font-mono uppercase"
            style={{
              background: "none",
              border: `1px solid ${isWatchlisted ? "var(--accent)" : "var(--line)"}`,
              color: isWatchlisted ? "var(--accent)" : "var(--text-tertiary)",
              cursor: "pointer",
              padding: "6px 12px",
              fontSize: "10px",
              letterSpacing: "0.1em",
              borderRadius: "2px",
            }}
          >
            {isWatchlisted ? "★ SAVED" : "☆ SAVE"}
          </button>
          <div className="flex gap-1">
            <button onClick={onPrev} style={{ background: "none", border: "1px solid var(--line)", color: "var(--text-secondary)", cursor: "pointer", padding: "6px 10px", borderRadius: "2px" }} aria-label="Previous object">
              ‹
            </button>
            <button onClick={onNext} style={{ background: "none", border: "1px solid var(--line)", color: "var(--text-secondary)", cursor: "pointer", padding: "6px 10px", borderRadius: "2px" }} aria-label="Next object">
              ›
            </button>
          </div>
        </div>
      </header>

      {/* Tab nav */}
      <nav
        className="flex"
        style={{
          borderBottom: "1px solid var(--line)",
          padding: "0 24px",
          transform: entered ? "translateY(0)" : "translateY(-10px)",
          opacity: entered ? 1 : 0,
          transition: "all 0.5s cubic-bezier(0.16,1,0.3,1) 0.15s",
        }}
        role="tablist"
      >
        {tabs.map((t) => (
          <TabButton key={t} active={activeTab === t} onClick={() => setActiveTab(t)}>
            {t}
          </TabButton>
        ))}
      </nav>

      {/* Content */}
      <div className="flex-1 overflow-auto" style={{ display: "flex" }}>
        {/* Left panel */}
        <div
          className="flex-1 overflow-auto"
          style={{
            padding: "24px",
            maxWidth: "calc(100% - 420px)",
            transform: entered ? "translateX(0)" : "translateX(-20px)",
            opacity: entered ? 1 : 0,
            transition: "all 0.6s cubic-bezier(0.16,1,0.3,1) 0.2s",
          }}
        >
          {activeTab === "overview" && (
            <div className="flex flex-col gap-6">
              <p style={{ fontSize: "14px", color: "var(--text-secondary)", lineHeight: 1.7, maxWidth: "600px" }}>{item.summary}</p>

              <SchematicFrame label="Key Statistics">
                <div className="flex flex-wrap gap-6">
                  <StatBlock label="Distance" value={item.distanceFromSun} unit={item.distanceUnit} />
                  <StatBlock label="Mass" value={item.mass} unit={item.massUnit} />
                  <StatBlock label="Radius" value={formatNumber(item.radius)} unit="km" />
                  {item.gravity && <StatBlock label="Gravity" value={item.gravity} unit="m/s²" />}
                  <StatBlock label="Orbital Period" value={formatNumber(item.orbitalPeriod)} unit="days" />
                  {item.rotationPeriod && <StatBlock label="Rotation" value={item.rotationPeriod} unit="hours" />}
                </div>
              </SchematicFrame>

              <SchematicFrame label="Quick Facts">
                <div className="flex flex-col gap-3">
                  {item.facts.map((f, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <span className="font-mono" style={{ fontSize: "9px", color: "var(--accent)", marginTop: "2px" }}>
                        [{String(i + 1).padStart(2, "0")}]
                      </span>
                      <span style={{ fontSize: "13px", color: "var(--text-primary)", lineHeight: 1.5 }}>{f}</span>
                    </div>
                  ))}
                </div>
              </SchematicFrame>

              <SchematicFrame label="Temperature Range" labelRight={`AVG: ${item.temperature.avg}°C`}>
                <div className="flex items-center gap-3">
                  <span className="font-mono" style={{ fontSize: "11px", color: "#6090d0" }}>
                    {item.temperature.min}°C
                  </span>
                  <div style={{ flex: 1, height: "4px", borderRadius: "2px", position: "relative", background: "var(--bg-elevated)" }}>
                    <div
                      style={{
                        position: "absolute",
                        inset: 0,
                        borderRadius: "2px",
                        background: `linear-gradient(90deg, #4060a0, #a06040, #d04020)`,
                        opacity: 0.6,
                      }}
                    />
                    <div
                      style={{
                        position: "absolute",
                        top: "-2px",
                        left: `${Math.max(0, Math.min(100, ((item.temperature.avg + 250) / 700) * 100))}%`,
                        width: "2px",
                        height: "8px",
                        background: "var(--text-primary)",
                        borderRadius: "1px",
                      }}
                    />
                  </div>
                  <span className="font-mono" style={{ fontSize: "11px", color: "#d06040" }}>
                    {item.temperature.max}°C
                  </span>
                </div>
              </SchematicFrame>

              {item.atmosphere.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  <span className="font-mono uppercase" style={{ fontSize: "9px", color: "var(--text-tertiary)", letterSpacing: "0.12em", marginRight: "8px", paddingTop: "3px" }}>
                    Atmosphere
                  </span>
                  {item.atmosphere.map((a) => (
                    <Badge key={a}>{a}</Badge>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === "missions" && (
            <div className="flex flex-col gap-6">
              <div>
                <h2 className="font-mono uppercase" style={{ fontSize: "11px", letterSpacing: "0.15em", color: "var(--text-tertiary)", margin: "0 0 16px" }}>
                  Mission & Observation Timeline
                </h2>
                <MissionTimeline missions={item.missions} accentColor={item.accentColor} />
              </div>
            </div>
          )}

          {activeTab === "physical" && (
            <div className="flex flex-col gap-6">
              <SchematicFrame label="Physical Properties">
                <div className="flex flex-col gap-3">
                  <MeasurementLine label="Mass" value={`${item.mass} ${item.massUnit}`} />
                  <MeasurementLine label="Radius" value={`${formatNumber(item.radius)} km`} />
                  <MeasurementLine label="Gravity" value={item.gravity ? `${item.gravity} m/s²` : "—"} />
                  <MeasurementLine label="Orbital" value={item.orbitalPeriod ? `${formatNumber(item.orbitalPeriod)} days` : "—"} />
                  <MeasurementLine label="Rotation" value={item.rotationPeriod ? `${item.rotationPeriod} hrs` : "—"} />
                  <MeasurementLine label="Rings" value={item.rings ? "Yes" : "No"} />
                  <MeasurementLine label="Moons" value={item.moons !== null ? String(item.moons) : "Unknown"} />
                </div>
              </SchematicFrame>

              <SchematicFrame label="Composition">
                <div className="flex flex-col gap-2">
                  {item.composition.map((c, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div style={{ width: "6px", height: "6px", background: item.accentColor, borderRadius: "1px", opacity: 1 - i * 0.2 }} />
                      <span style={{ fontSize: "13px", color: "var(--text-primary)" }}>{c}</span>
                    </div>
                  ))}
                </div>
              </SchematicFrame>

              <SchematicFrame label="Temperature">
                <div className="flex flex-col gap-3">
                  <MeasurementLine label="Minimum" value={`${item.temperature.min}°C`} />
                  <MeasurementLine label="Average" value={`${item.temperature.avg}°C`} />
                  <MeasurementLine label="Maximum" value={`${item.temperature.max}°C`} />
                </div>
              </SchematicFrame>
            </div>
          )}

          {activeTab === "gallery" && (
            <div className="flex flex-col gap-6">
              <SchematicFrame label="Orbital Diagram">
                <div className="flex items-center justify-center" style={{ height: "260px", position: "relative" }}>
                  <svg width="300" height="260" viewBox="0 0 300 260">
                    {/* Sun */}
                    <circle cx="150" cy="130" r="8" fill="#f0c040" opacity="0.8" />
                    <circle cx="150" cy="130" r="12" fill="none" stroke="#f0c040" strokeWidth="0.5" opacity="0.3" />
                    {/* Orbit */}
                    <ellipse cx="150" cy="130" rx="120" ry="80" fill="none" stroke="var(--line)" strokeWidth="0.5" strokeDasharray="3 4" />
                    {/* Planet */}
                    <circle cx="270" cy="130" r="5" fill={item.color} />
                    <circle cx="270" cy="130" r="10" fill="none" stroke={item.accentColor} strokeWidth="0.5" opacity="0.3" />
                    {/* Labels */}
                    <text x="150" y="155" textAnchor="middle" fill="var(--text-tertiary)" fontSize="8" fontFamily="monospace">
                      HOST STAR
                    </text>
                    <text x="270" y="118" textAnchor="middle" fill="var(--text-secondary)" fontSize="8" fontFamily="monospace">
                      {item.name.toUpperCase()}
                    </text>
                  </svg>
                </div>
              </SchematicFrame>

              <SchematicFrame label="Scale Comparison">
                <div className="flex items-end justify-center gap-6" style={{ height: "140px", paddingBottom: "20px" }}>
                  {/* Earth reference */}
                  <div className="flex flex-col items-center gap-2">
                    <div
                      style={{
                        width: "24px",
                        height: "24px",
                        borderRadius: "50%",
                        background: "radial-gradient(circle at 35% 35%, #6ab0e0, #2a5080)",
                      }}
                    />
                    <span className="font-mono" style={{ fontSize: "8px", color: "var(--text-tertiary)" }}>
                      EARTH
                    </span>
                  </div>
                  {/* Object */}
                  <div className="flex flex-col items-center gap-2">
                    <div
                      style={{
                        width: `${Math.max(8, Math.min(100, (item.radius / 6371) * 24))}px`,
                        height: `${Math.max(8, Math.min(100, (item.radius / 6371) * 24))}px`,
                        borderRadius: "50%",
                        background: `radial-gradient(circle at 35% 35%, ${item.color}cc, ${item.color}40)`,
                      }}
                    />
                    <span className="font-mono" style={{ fontSize: "8px", color: "var(--text-tertiary)" }}>
                      {item.name.toUpperCase()}
                    </span>
                  </div>
                </div>
              </SchematicFrame>

              <div className="flex flex-wrap gap-2">
                <span className="font-mono uppercase" style={{ fontSize: "9px", color: "var(--text-tertiary)", letterSpacing: "0.12em", marginRight: "8px", paddingTop: "3px" }}>
                  Discovery
                </span>
                <Badge>{item.discoveryDate}</Badge>
                <Badge>{item.discoveryMethod}</Badge>
              </div>
            </div>
          )}
        </div>

        {/* Right panel - 3D Viewer */}
        <div
          style={{
            width: "420px",
            minWidth: "420px",
            borderLeft: "1px solid var(--line)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            position: "relative",
            background: "var(--bg-secondary)",
            transform: entered ? "translateX(0)" : "translateX(20px)",
            opacity: entered ? 1 : 0,
            transition: "all 0.6s cubic-bezier(0.16,1,0.3,1) 0.3s",
          }}
        >
          <CornerBrackets size={14} stroke="var(--line)" />
          <PlanetViewer color={item.color} accentColor={item.accentColor} name={item.name} hasRings={item.rings} />
          <div
            className="absolute bottom-6 left-6 right-6"
            style={{
              borderTop: "1px solid var(--line)",
              paddingTop: "12px",
            }}
          >
            <div className="flex flex-wrap gap-2">
              <Badge color={getTypeColor(item.type)}>{item.type}</Badge>
              {item.rings && <Badge>RINGS</Badge>}
              {item.moons > 0 && (
                <Badge>
                  {item.moons} MOON{item.moons > 1 ? "S" : ""}
                </Badge>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────

export default function CelestialAtlas() {
  const [darkMode, setDarkMode] = useState(true);
  const [search, setSearch] = useState("");
  const [typeFilters, setTypeFilters] = useState([]);
  const [sortBy, setSortBy] = useState("name");
  const [viewMode, setViewMode] = useState("grid");
  const [selectedId, setSelectedId] = useState(null);
  const [watchlist, setWatchlist] = useState([]);

  // Persist watchlist in memory (no localStorage per artifact rules)
  const toggleWatchlist = useCallback((id) => {
    setWatchlist((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }, []);

  const toggleTypeFilter = useCallback((type) => {
    setTypeFilters((prev) => (prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]));
  }, []);

  const filtered = useMemo(() => {
    let items = [...CELESTIAL_DATA];
    if (search) {
      const q = search.toLowerCase();
      items = items.filter((i) => i.name.toLowerCase().includes(q) || i.designation.toLowerCase().includes(q) || i.type.toLowerCase().includes(q));
    }
    if (typeFilters.length > 0) {
      items = items.filter((i) => typeFilters.includes(i.type));
    }
    items.sort((a, b) => {
      if (sortBy === "name") return a.name.localeCompare(b.name);
      if (sortBy === "distance") return a.distanceFromSun - b.distanceFromSun;
      if (sortBy === "mass") return b.mass - a.mass;
      if (sortBy === "radius") return b.radius - a.radius;
      return 0;
    });
    return items;
  }, [search, typeFilters, sortBy]);

  const selectedItem = useMemo(() => CELESTIAL_DATA.find((i) => i.id === selectedId), [selectedId]);

  const navigateDetail = useCallback(
    (dir) => {
      if (!selectedId) return;
      const idx = filtered.findIndex((i) => i.id === selectedId);
      const next = idx + dir;
      if (next >= 0 && next < filtered.length) setSelectedId(filtered[next].id);
    },
    [selectedId, filtered],
  );

  const themeVars = darkMode
    ? {
        "--bg-primary": "#0a0a0c",
        "--bg-secondary": "#0e0e12",
        "--bg-elevated": "#14141a",
        "--text-primary": "#e8e8ec",
        "--text-secondary": "#8a8a96",
        "--text-tertiary": "#4a4a56",
        "--line": "#1e1e28",
        "--accent": "#c8965a",
        "--accent-dim": "#c8965a20",
      }
    : {
        "--bg-primary": "#f6f5f3",
        "--bg-secondary": "#eeedeb",
        "--bg-elevated": "#ffffff",
        "--text-primary": "#1a1a1e",
        "--text-secondary": "#6a6a76",
        "--text-tertiary": "#9a9aa6",
        "--line": "#d8d8de",
        "--accent": "#a06830",
        "--accent-dim": "#a0683020",
      };

  return (
    <div
      style={{
        ...themeVars,
        background: "var(--bg-primary)",
        color: "var(--text-primary)",
        minHeight: "100vh",
        fontFamily: "'SF Mono', 'Cascadia Code', 'Fira Code', 'JetBrains Mono', ui-monospace, monospace",
        position: "relative",
      }}
    >
      <style>{`
        * { box-sizing: border-box; margin: 0; }
        body { margin: 0; background: ${darkMode ? "#0a0a0c" : "#f6f5f3"}; }
        ::selection { background: var(--accent); color: var(--bg-primary); }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: var(--bg-primary); }
        ::-webkit-scrollbar-thumb { background: var(--line); border-radius: 3px; }
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        .anim-in { animation: fadeInUp 0.5s cubic-bezier(0.16,1,0.3,1) both; }
        @media (prefers-reduced-motion: reduce) {
          .anim-in { animation: none; opacity: 1; transform: none; }
        }
        input::placeholder { color: var(--text-tertiary); }
        button:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }
        input:focus-visible { outline: 2px solid var(--accent); outline-offset: 0; }
      `}</style>

      {darkMode && <Starfield />}
      <GridOverlay />

      {/* Header */}
      <header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 50,
          background: `${darkMode ? "rgba(10,10,12,0.85)" : "rgba(246,245,243,0.85)"}`,
          backdropFilter: "blur(12px)",
          borderBottom: "1px solid var(--line)",
        }}
      >
        <div className="flex items-center justify-between" style={{ padding: "14px 24px", maxWidth: "1400px", margin: "0 auto" }}>
          <div className="flex items-center gap-3">
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <svg width="20" height="20" viewBox="0 0 20 20">
                <circle cx="10" cy="10" r="3" fill="var(--accent)" />
                <circle cx="10" cy="10" r="7" fill="none" stroke="var(--accent)" strokeWidth="0.5" opacity="0.4" />
                <circle cx="10" cy="10" r="9.5" fill="none" stroke="var(--accent)" strokeWidth="0.5" strokeDasharray="2 3" opacity="0.25" />
              </svg>
              <h1 style={{ fontSize: "15px", fontWeight: 600, letterSpacing: "0.08em", color: "var(--text-primary)" }}>CELESTIAL ATLAS</h1>
            </div>
            <span className="font-mono" style={{ fontSize: "9px", color: "var(--text-tertiary)", letterSpacing: "0.1em" }}>
              v2.1
            </span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                setSearch("");
                setTypeFilters([]);
                setSelectedId(null);
                // Show only watchlisted
                if (typeFilters.length === 0 && watchlist.length > 0) {
                  // Toggle watchlist view - simple approach
                }
              }}
              className="font-mono uppercase"
              style={{
                fontSize: "9px",
                letterSpacing: "0.12em",
                background: "none",
                border: "1px solid var(--line)",
                color: "var(--text-tertiary)",
                padding: "6px 12px",
                cursor: "pointer",
                borderRadius: "2px",
              }}
            >
              ★ {watchlist.length} SAVED
            </button>
            <button
              onClick={() => setDarkMode(!darkMode)}
              style={{
                background: "none",
                border: "1px solid var(--line)",
                color: "var(--text-secondary)",
                cursor: "pointer",
                padding: "6px 10px",
                fontSize: "13px",
                borderRadius: "2px",
                lineHeight: 1,
              }}
              aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
            >
              {darkMode ? "◐" : "◑"}
            </button>
          </div>
        </div>
      </header>

      {/* Main Explore View */}
      <main style={{ position: "relative", zIndex: 1, maxWidth: "1400px", margin: "0 auto", padding: "24px" }}>
        {/* Search + Filters */}
        <div className="anim-in flex flex-col gap-4" style={{ marginBottom: "24px" }}>
          <div className="flex flex-wrap items-center gap-4">
            <SearchInput value={search} onChange={setSearch} onClear={() => setSearch("")} />
            <div className="flex gap-1 flex-wrap">
              {CELESTIAL_TYPES.map((t) => (
                <FilterChip key={t} label={t} active={typeFilters.includes(t)} onClick={() => toggleTypeFilter(t)} />
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <span className="font-mono" style={{ fontSize: "10px", color: "var(--text-tertiary)" }}>
              {filtered.length} OBJECT{filtered.length !== 1 ? "S" : ""} FOUND
            </span>
            <div className="flex items-center gap-3">
              <div className="flex gap-1">
                {["name", "distance", "mass", "radius"].map((s) => (
                  <button
                    key={s}
                    onClick={() => setSortBy(s)}
                    className="font-mono uppercase"
                    style={{
                      fontSize: "9px",
                      letterSpacing: "0.08em",
                      padding: "3px 8px",
                      background: sortBy === s ? "var(--accent-dim)" : "none",
                      color: sortBy === s ? "var(--accent)" : "var(--text-tertiary)",
                      border: `1px solid ${sortBy === s ? "var(--accent)" : "transparent"}`,
                      cursor: "pointer",
                      borderRadius: "1px",
                    }}
                  >
                    {s}
                  </button>
                ))}
              </div>
              <DashedSeparator className="w-4" />
              <div className="flex gap-1">
                {["grid", "table"].map((v) => (
                  <button
                    key={v}
                    onClick={() => setViewMode(v)}
                    className="font-mono uppercase"
                    style={{
                      fontSize: "9px",
                      padding: "3px 8px",
                      background: viewMode === v ? "var(--bg-elevated)" : "none",
                      color: viewMode === v ? "var(--text-primary)" : "var(--text-tertiary)",
                      border: `1px solid ${viewMode === v ? "var(--line)" : "transparent"}`,
                      cursor: "pointer",
                      borderRadius: "1px",
                    }}
                  >
                    {v === "grid" ? "▦" : "☰"} {v}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Table Header (table mode) */}
        {viewMode === "table" && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 100px 100px 100px 80px",
              padding: "8px 16px",
              borderBottom: "1px solid var(--line)",
              gap: "12px",
            }}
          >
            {["Name", "Type", "Distance", "Radius", "Discovered"].map((h) => (
              <span key={h} className="font-mono uppercase" style={{ fontSize: "8px", letterSpacing: "0.15em", color: "var(--text-tertiary)" }}>
                {h}
              </span>
            ))}
          </div>
        )}

        {/* Object Grid / Table */}
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center" style={{ padding: "80px 24px", color: "var(--text-tertiary)" }}>
            <span style={{ fontSize: "32px", marginBottom: "16px" }}>⊘</span>
            <p className="font-mono" style={{ fontSize: "12px" }}>
              No celestial objects match your search
            </p>
            <button
              onClick={() => {
                setSearch("");
                setTypeFilters([]);
              }}
              className="font-mono"
              style={{
                marginTop: "12px",
                background: "none",
                border: "1px solid var(--line)",
                color: "var(--text-secondary)",
                padding: "6px 16px",
                fontSize: "11px",
                cursor: "pointer",
                borderRadius: "2px",
              }}
            >
              Clear filters
            </button>
          </div>
        ) : (
          <div
            style={
              viewMode === "grid"
                ? {
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
                    gap: "16px",
                  }
                : { display: "flex", flexDirection: "column" }
            }
          >
            {filtered.map((item, i) => (
              <div key={item.id} className="anim-in" style={{ animationDelay: `${Math.min(i * 40, 400)}ms` }}>
                <CelestialCard item={item} onClick={() => setSelectedId(item.id)} isWatchlisted={watchlist.includes(item.id)} onToggleWatchlist={toggleWatchlist} viewMode={viewMode} />
              </div>
            ))}
          </div>
        )}

        {/* Footer */}
        <footer style={{ marginTop: "60px", padding: "24px 0", borderTop: "1px solid var(--line)" }}>
          <div className="flex items-center justify-between">
            <span className="font-mono" style={{ fontSize: "9px", color: "var(--text-tertiary)", letterSpacing: "0.1em" }}>
              CELESTIAL ATLAS · {CELESTIAL_DATA.length} OBJECTS CATALOGUED
            </span>
            <span className="font-mono" style={{ fontSize: "9px", color: "var(--text-tertiary)" }}>
              <span style={{ opacity: 0.5 }}>KBD</span> / = SEARCH · ESC = CLOSE · ← → = NAV
            </span>
          </div>
        </footer>
      </main>

      {/* Detail Modal */}
      {selectedItem && <DetailView item={selectedItem} onClose={() => setSelectedId(null)} onPrev={() => navigateDetail(-1)} onNext={() => navigateDetail(1)} isWatchlisted={watchlist.includes(selectedItem.id)} onToggleWatchlist={toggleWatchlist} />}
    </div>
  );
}
