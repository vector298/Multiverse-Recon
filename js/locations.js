/*
 * locations.js — The Anomaly Atlas
 * -------------------------------------------------------------
 * A predefined list of real-world coordinates used to generate
 * each round's "anomaly". Every entry carries:
 *   - name / country : revealed only AFTER the guess is locked in
 *   - lat / lng      : the true coordinates (ground truth)
 *   - images         : ordered list of candidate photo URLs. They
 *                      are loaded at runtime in the player's browser
 *                      (Wikimedia Commons). If every candidate fails,
 *                      the viewer falls back to a hand-drawn SVG scene
 *                      so the round is always playable.
 *   - silhouette     : key used by viewer.js to draw a recognizable
 *                      landmark silhouette for the offline fallback.
 *   - hint           : a vague cue shown only in EASY mode.
 *   - fact           : trivia shown on the results screen.
 *
 * Images are referenced via Wikimedia's stable Special:FilePath
 * redirect, which resolves a filename to the current file without
 * needing an exact upload path or hash.
 */

(function (global) {
  'use strict';

  // Build a Wikimedia Commons Special:FilePath URL for a given file name.
  function wm(fileName, width) {
    return (
      'https://commons.wikimedia.org/wiki/Special:FilePath/' +
      encodeURIComponent(fileName) +
      '?width=' +
      (width || 1600)
    );
  }

  const LOCATIONS = [
    {
      name: 'Eiffel Tower',
      country: 'Paris, France',
      lat: 48.8584,
      lng: 2.2945,
      silhouette: 'eiffel',
      hint: 'A wrought-iron lattice spire looms over a European capital of light.',
      fact: 'Completed in 1889, it was meant to stand for only 20 years.',
      images: [
        wm('Tour_Eiffel_Wikimedia_Commons.jpg'),
        wm('Eiffel_Tower_from_the_Tour_Montparnasse,_3_August_2014.jpg')
      ]
    },
    {
      name: 'Colosseum',
      country: 'Rome, Italy',
      lat: 41.8902,
      lng: 12.4922,
      silhouette: 'colosseum',
      hint: 'An ancient stone amphitheatre at the heart of the old empire.',
      fact: 'The Flavian Amphitheatre could hold an estimated 50,000 spectators.',
      images: [
        wm('Colosseum_in_Rome,_Italy_-_April_2007.jpg'),
        wm('Colosseo_2020.jpg')
      ]
    },
    {
      name: 'Statue of Liberty',
      country: 'New York, USA',
      lat: 40.6892,
      lng: -74.0445,
      silhouette: 'liberty',
      hint: 'A copper guardian raises a torch over a famous harbour.',
      fact: 'A gift from France, dedicated in 1886; her full height is 93 m.',
      images: [
        wm('Statue_of_Liberty_7.jpg'),
        wm('Lady_Liberty_under_a_blue_sky_(cropped).jpg')
      ]
    },
    {
      name: 'Taj Mahal',
      country: 'Agra, India',
      lat: 27.1751,
      lng: 78.0421,
      silhouette: 'taj',
      hint: 'A white marble mausoleum crowned by a great dome and four minarets.',
      fact: 'Built by Mughal emperor Shah Jahan in memory of Mumtaz Mahal.',
      images: [
        wm('Taj_Mahal_(Edited).jpeg'),
        wm('Taj_Mahal,_Agra,_India.jpg')
      ]
    },
    {
      name: 'Sydney Opera House',
      country: 'Sydney, Australia',
      lat: -33.8568,
      lng: 151.2153,
      silhouette: 'opera',
      hint: 'White shell-like sails rise beside a southern-hemisphere harbour.',
      fact: 'Its roof is clad in over one million tiles from Sweden.',
      images: [
        wm('Sydney_Opera_House_-_Dec_2008.jpg'),
        wm('Sydney_Australia._(21339175489).jpg')
      ]
    },
    {
      name: 'Christ the Redeemer',
      country: 'Rio de Janeiro, Brazil',
      lat: -22.9519,
      lng: -43.2105,
      silhouette: 'redeemer',
      hint: 'A colossal statue with outstretched arms watches over a coastal city.',
      fact: 'Standing atop Corcovado mountain, it is 30 m tall (38 m with pedestal).',
      images: [
        wm('Cristo_Redentor_-_Rio_de_Janeiro,_Brasil.jpg'),
        wm('Christ_on_Corcovado_mountain.JPG')
      ]
    },
    {
      name: 'Great Pyramid of Giza',
      country: 'Giza, Egypt',
      lat: 29.9792,
      lng: 31.1342,
      silhouette: 'pyramid',
      hint: 'Vast sandstone tombs rise from the desert near a great river.',
      fact: 'The oldest of the Seven Wonders of the Ancient World still standing.',
      images: [
        wm('Kheops-Pyramid.jpg'),
        wm('All_Gizah_Pyramids.jpg')
      ]
    },
    {
      name: 'Elizabeth Tower (Big Ben)',
      country: 'London, United Kingdom',
      lat: 51.5007,
      lng: -0.1246,
      silhouette: 'bigben',
      hint: 'A Gothic clock tower stands beside a river parliament.',
      fact: '"Big Ben" is actually the nickname of the Great Bell inside.',
      images: [
        wm('Clock_Tower_-_Palace_of_Westminster,_London_-_May_2007.jpg'),
        wm('Big_Ben_2012-06-02.jpg')
      ]
    },
    {
      name: 'Golden Gate Bridge',
      country: 'San Francisco, USA',
      lat: 37.8199,
      lng: -122.4783,
      silhouette: 'goldengate',
      hint: 'An orange-red suspension bridge is often wreathed in coastal fog.',
      fact: 'Its signature colour is officially called "International Orange".',
      images: [
        wm('GoldenGateBridge-001.jpg'),
        wm('Golden_Gate_Bridge_as_seen_from_Battery_East.jpg')
      ]
    },
    {
      name: 'Tokyo Tower',
      country: 'Tokyo, Japan',
      lat: 35.6586,
      lng: 139.7454,
      silhouette: 'tokyotower',
      hint: 'A red-and-white lattice tower echoes a famous Parisian design in East Asia.',
      fact: 'At 333 m it is taller than its Parisian inspiration.',
      images: [
        wm('Tokyo_Tower_and_around_Skyscrapers.jpg'),
        wm('Tokyo_Tower_2023.jpg')
      ]
    },
    {
      name: 'Burj Khalifa',
      country: 'Dubai, UAE',
      lat: 25.1972,
      lng: 55.2744,
      silhouette: 'burj',
      hint: 'The tallest building on Earth pierces a desert-city skyline.',
      fact: 'Standing 828 m tall, it has been the world’s tallest since 2010.',
      images: [
        wm('Burj_Khalifa.jpg'),
        wm('Burj_Khalifa_2.jpg')
      ]
    },
    {
      name: 'Brandenburg Gate',
      country: 'Berlin, Germany',
      lat: 52.5163,
      lng: 13.3777,
      silhouette: 'gate',
      hint: 'A neoclassical gate topped by a chariot marks a reunified capital.',
      fact: 'The Quadriga on top depicts the goddess of victory in a chariot.',
      images: [
        wm('Brandenburger_Tor_abends.jpg'),
        wm('Brandenburg_Gate_at_Night.jpg')
      ]
    },
    {
      name: 'Moai of Easter Island',
      country: 'Rapa Nui, Chile',
      lat: -27.1212,
      lng: -109.3666,
      silhouette: 'moai',
      hint: 'Monolithic stone heads gaze across a remote Pacific island.',
      fact: 'Nearly 900 moai were carved by the Rapa Nui people.',
      images: [
        wm('Moai_Rano_raraku.jpg'),
        wm('AhuTongariki.JPG')
      ]
    },
    {
      name: 'Table Mountain',
      country: 'Cape Town, South Africa',
      lat: -33.9628,
      lng: 18.4098,
      silhouette: 'tablemtn',
      hint: 'A flat-topped mountain presides over a city at a continent’s southern tip.',
      fact: 'Its level plateau is often draped by a cloud "tablecloth".',
      images: [
        wm('Table_Mountain_DanieVDM.jpg'),
        wm('Tafelberg_Kapstadt.jpg')
      ]
    },
    {
      name: 'Neuschwanstein Castle',
      country: 'Bavaria, Germany',
      lat: 47.5576,
      lng: 10.7498,
      silhouette: 'castle',
      hint: 'A fairy-tale castle perches in alpine foothills.',
      fact: 'It inspired the design of the Disney castle.',
      images: [
        wm('Schloss_Neuschwanstein_2013.jpg'),
        wm('Neuschwanstein_Castle_LOC_print_rotated.jpg')
      ]
    },
    {
      name: 'CN Tower',
      country: 'Toronto, Canada',
      lat: 43.6426,
      lng: -79.3871,
      silhouette: 'cntower',
      hint: 'A slender concrete communications tower dominates a lakeside skyline.',
      fact: 'At 553 m it held the title of world’s tallest free-standing structure for 32 years.',
      images: [
        wm('Toronto_-_ON_-_Toronto_Harbourfront_mit_CN_Tower.jpg'),
        wm('CN_Tower_as_seen_from_the_observation_deck_of_the_Toronto_City_Hall.jpg')
      ]
    },
    {
      name: 'Saint Basil’s Cathedral',
      country: 'Moscow, Russia',
      lat: 55.7525,
      lng: 37.6231,
      silhouette: 'stbasil',
      hint: 'Candy-coloured onion domes crown a cathedral on a vast red square.',
      fact: 'Commissioned by Ivan the Terrible and completed in 1561.',
      images: [
        wm('Moscow_July_2011-7a.jpg'),
        wm('Saint_Basil\'s_Cathedral_and_fountain.jpg')
      ]
    },
    {
      name: 'Santorini',
      country: 'Cyclades, Greece',
      lat: 36.3932,
      lng: 25.4615,
      silhouette: 'santorini',
      hint: 'White-washed villages with blue domes cling to a volcanic caldera.',
      fact: 'The island is the rim of a caldera left by a massive eruption ~1600 BC.',
      images: [
        wm('Santorini_sunset_(5428782813).jpg'),
        wm('Oia_Santorini.jpg')
      ]
    },
    {
      name: 'Petronas Towers',
      country: 'Kuala Lumpur, Malaysia',
      lat: 3.1578,
      lng: 101.7117,
      silhouette: 'petronas',
      hint: 'Twin steel spires linked by a sky bridge rise over a tropical metropolis.',
      fact: 'They were the tallest buildings in the world from 1998 to 2004.',
      images: [
        wm('Petronas_Towers_II.jpg'),
        wm('KLCC_Twin_Tower.jpg')
      ]
    }
  ];

  global.MR_LOCATIONS = LOCATIONS;
})(window);
