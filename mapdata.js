const fetch = require('node-fetch');

// Function to fetch Ukrainian cities wiki data as a raw text string
async function fetchCitiesDataRaw() {
    try {
        const response = await fetch('https://en.wikipedia.org/w/index.php?title=Module:Russo-Ukrainian_War_detailed_map&action=raw');
        if (!response.ok) {
            throw new Error(`HTTP error: ${response.status}`);
        }
        const citiesDataRaw = await response.text();
        return citiesDataRaw;
    }
    catch(error) {
        console.error(`Backend could not get cities data ${error}`);
    }
}

// Function to parse raw text string to GeoJSON
function parseToGeoJson(citiesDataRaw) { 
    // INITIALISE VARIABLES    
    const oblastTemplate = ["--Cherkasy Oblast","--Chernihiv Oblast","--Chernivtsi Oblast","--Dnipropetrovsk Oblast","--Donetsk Oblast","--Ivano-Frankivsk Oblast","--Kharkiv Oblast","--Kherson Oblast","--Khmelnytskyi Oblast","--Kyiv City","--Kyiv Oblast","--Kirovohrad Oblast","--Luhansk Oblast","--Lviv Oblast","--Mykolaiv Oblast","--Odessa Oblast","--Poltava Oblast","--Rivne Oblast","--Sumy Oblast","--Ternopil Oblast","--Vinnytsia Oblast","--Volyn Oblast","--Zakarpattia Oblast","--Zaporizhzhia Oblast","--Zhytomyr Oblast","--Crimea","containerArgs ="];
    let oblastString;
    let outputGeoJson = {
        "type": "FeatureCollection",
        "features": []
    };
    // templete for each of the GeoJson features
    let featureObject = {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [0 , 0]
        },
        "properties": {}
    };

    // this anchor index will allow us to maintain and progress our absolute position as we sweep through the string
    let anchorIndex;
    // index variables and variables for storing the string cutting patterns
    let startIndex, endIndex, startSubstring, endSubstring, stringCut;
    
    // the 'label =' property extraction from the wikipedia data has 5 different syntax cases. These variables and function will be use to surgically cater for each of the case.
    let labelSubstring = "label =";
    let labelSubstringIndex, labelSubstringCut;
    function extractLabel(oblastString, labelSubstringIndex, startSubstring, endSubstring, startIndex, endIndex, stringCut) {
        startIndex = labelSubstringIndex + startSubstring.length;
        endIndex = oblastString.indexOf(endSubstring, startIndex);
        stringCut = oblastString.substring(startIndex, endIndex);
        return stringCut;
    };

    // TEST: test variables for error handling
    let testGlobal = true;
    let testIndex, testCountRaw, testCountGeoJson;

    // Iterate through the global raw text string by cutting out the part of string associated with each oblast. Note that the '--' signature substring before each oblast name is necessary for reliable extraction as without it the string 'oblast' sometimes appears mixed inside the cities data as part of the location name data.
    for ( let i = 0; i < (oblastTemplate.length - 1 ); i++ ) {
        startIndex = citiesDataRaw.indexOf(oblastTemplate[i]);
        endIndex = citiesDataRaw.indexOf(oblastTemplate[i + 1]);
        oblastString = citiesDataRaw.substring(startIndex, endIndex);

        anchorIndex = 0; // initialise the initial value of the anchor index to the start of the oblastString

        testCountRaw = 0; // TEST: initialise the test counter for the number of features in the raw oblast string (feature extraction test at end of while loop on each oblast)
        testCountGeoJson = 0; // TEST: initialise the test counter for the number of features extracted to GeoJSON (feature extraction test at end of while loop on each oblast)

        while ( oblastString.indexOf("{ lat = \"", anchorIndex) !== -1 ) { 
            // EXTRACT COORDINATES
            // lattitude (note that GeoJSON coordinate format is [ long , lat ], rather than the reverse order as in the wiki data )
            // note that the anchorIndex has been either set to zero if it's the first iteration of this inner loop, or it has already been updated at the end of the previous iteration
            startSubstring = "{ lat = \"";
            endSubstring = "\", long = \"";
            startIndex = oblastString.indexOf(startSubstring, anchorIndex) + startSubstring.length;
            endIndex = oblastString.indexOf(endSubstring, anchorIndex);
            stringCut = oblastString.substring(startIndex, endIndex);
            featureObject.geometry.coordinates[1] = Number(stringCut);
            // longitude
            anchorIndex = endIndex + endSubstring.length; // update the anchor index
            endSubstring = "\", mark = \"";
            // Wikipedia data contains syntax error for Port of Yevpatoriya. Need to manually remove space within mark template substring
            if ( oblastTemplate[i].slice(2) === 'Crimea' && featureObject.geometry.coordinates[1] === 45.188617 ) {
                endSubstring = "\", mark =\"";
            };
            startIndex = anchorIndex;
            endIndex = oblastString.indexOf(endSubstring, anchorIndex);
            stringCut = oblastString.substring(startIndex, endIndex);
            featureObject.geometry.coordinates[0] = Number(stringCut);

            // EXTRACT MARK ICON TYPE
            anchorIndex = endIndex + endSubstring.length; // update the anchor index
            endSubstring = "\"";
            startIndex = anchorIndex;
            endIndex = oblastString.indexOf(endSubstring, anchorIndex + 1); // Needs to be 1 index greater than anchorIndex because given a second argument: a number, the indexOf method returns the first occurrence of the specified substring at an index greater than or equal to the specified number. And "\"" is contained within the startSubstring.
            stringCut = oblastString.substring(startIndex, endIndex);
            featureObject.properties.mark = stringCut;

            // EXTRACT LABEL OF FEATURE
            anchorIndex = endIndex + endSubstring.length; // update the anchor index
            labelSubstringIndex = oblastString.indexOf(labelSubstring, anchorIndex); // Initialise index that we'll use to deal with the exceptions to the dominent label syntax.

            // Handle the syntax exceptions
            // A small number of the features on the wiki map do not have labels at all. Manually include a label for these cases.
            if (( labelSubstringIndex > oblastString.indexOf("{ lat = \"", anchorIndex)) && (oblastString.indexOf("{ lat = \"", anchorIndex) > -1 )) { 
                if ( oblastTemplate[i].slice(2) === "Donetsk Oblast") { 
                    featureObject.properties.label = "Horlivka";
                } else if ( oblastTemplate[i].slice(2) === "Kharkiv Oblast") { 
                    featureObject.properties.label = "Ternova";
                } else if ( oblastTemplate[i].slice(2) === "Zaporizhzhia Oblast" && featureObject.geometry.coordinates[0] === 36.273) {        
                    featureObject.properties.label = "Huliaipole";
                } else if ( oblastTemplate[i].slice(2) === "Zaporizhzhia Oblast" && featureObject.geometry.coordinates[0] === 35.788 ) {
                    featureObject.properties.label = "Orikhiv";
                }
            } else { 
                // As long as we are not dealing with one of the features with no label, we can process the labels property as follows. 
                // Need if statements to handle the four syntax cases that follows the labelSubtring of 'label =' syntax
                labelSubstringCut = oblastString.substring(labelSubstringIndex);
                if ( labelSubstringCut.startsWith("label = \"[[") ) {
                    startSubstring = "label = \"[[";
                    endSubstring = "]]\",";
                    featureObject.properties.label = extractLabel(oblastString, labelSubstringIndex, startSubstring, endSubstring, startIndex, endIndex, stringCut);
                } else if ( labelSubstringCut.startsWith("label = \" [[") ) {
                    startSubstring = "label = \" [[";
                    endSubstring = "]]\",";
                    featureObject.properties.label = extractLabel(oblastString, labelSubstringIndex, startSubstring, endSubstring, startIndex, endIndex, stringCut);
                } else if ( labelSubstringCut.startsWith("label = \"") ) {
                    startSubstring = "label = \"";
                    endSubstring = "\",";
                    featureObject.properties.label = extractLabel(oblastString, labelSubstringIndex, startSubstring, endSubstring, startIndex, endIndex, stringCut);
                } else if ( labelSubstringCut.startsWith("label = [[") ) {
                    startSubstring = "label = [[";
                    endSubstring = "]],";
                    featureObject.properties.label = extractLabel(oblastString, labelSubstringIndex, startSubstring, endSubstring, startIndex, endIndex, stringCut);
                } else if ( labelSubstringCut.startsWith("label =\"") ) {
                    startSubstring = "label =\"";
                    endSubstring = "\",";
                    featureObject.properties.label = extractLabel(oblastString, labelSubstringIndex, startSubstring, endSubstring, startIndex, endIndex, stringCut);
                } 
            };

            // Wikipedia data contains the wrong coordinates for the "Azovstal Metallurgical Combine" in Mariupol
            // Manually correct it here.
            if ( featureObject.properties.label === "Azovstal Metallurgical Combine" ) {
                featureObject.geometry.coordinates = [37.61, 47.098];
            }

            // EXTRACT OBLAST NAME
            featureObject.properties.oblast = oblastTemplate[i].slice(2);

            // ADD EXTRACTED FEATURE TO THE GEOJSON OBJECT
            outputGeoJson.features.push(featureObject);

            // set the anchor index for the next iteration of the loop
            anchorIndex = endIndex + endSubstring.length;

            // object push method only make shallow copies of the argument, and so does value reassignment of properties. Since we are changing featureObject in each iteration, we need to make sure that a deep copy of featureObject has been made in outputGeoJson at the end of every iteration by reassigning featureObject at root so that it is not just a reference address pointing to the same 'place' in memory as that which we put into outputGeoJson - which would be the case if we simply left it as a shallow copy. This line here ensures featureObject now points to a new reference and so now the previous reference which was copied into outputGeoJson is only pointed to by outputGeoJson. So by changing the properties of featureObject, outputGeoJson will not change.
            featureObject = {
                "type": "Feature",
                "geometry": {
                    "type": "Point",
                    "coordinates": [0, 0]
                },
                "properties": {}
            };

            // TEST: Increment test counter for feature extraction test at end of while loop on each oblast
            testCountGeoJson++;
        }

        // TEST: Run test on each oblast to make sure we've extracted all features from each raw oblast string 
        testIndex = oblastString.indexOf("{ lat = \"");
        try {
            while ( testIndex !== -1 ) {
                testCountRaw++;
                testIndex = oblastString.indexOf("{ lat = \"", testIndex + 1);
            }
            if ( !(testCountRaw === testCountGeoJson) ) {
                testGlobal = false;
                throw new Error(`Raw string to GeoJSON parsing error: # features in ${oblastTemplate[i].slice(2)} raw oblast string = ${testCountRaw}. # corresponding oblast features extracted into GeoJSON = ${testCountGeoJson}`);
            }
        }
        catch(error) {
            console.error(error);
        }
    }

    // TEST: Check global parsing test result to ensure all location features have been extracted from all raw oblast strings
    try {
        if ( testGlobal === false ) {
            throw new Error (`Global error in parsing global raw string to GeoJSON.`)
        }
    } 
    catch(error) {
        console.error(error);
    }

    // RETURN THE GEOJSON OBJECT AS JSON
    return JSON.stringify(outputGeoJson);
}

// EXPORT LOADGING AND PARSING FUNCTIONS AS A SINGLE FUNCTION
// Remember that async functions always return a promise
async function loadCitiesGeoJson() { 
    const geoJson = fetchCitiesDataRaw().then(parseToGeoJson);
    return await geoJson;
}

module.exports = { 
    loadCitiesGeoJson 
};