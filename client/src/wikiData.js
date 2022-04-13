// Simple response test from server
async function fetchServerHello() {
    try {
        const response = await fetch('/api/hello');
        if (!response.ok) {
            throw new Error(`HTTP error: ${response.status}`);
        }
        const serverHello = await response.json();
        return serverHello;
    }
    catch(error) {
        console.error(`Could not get hello ${error}`)
    }
}

const serverHelloPromise = fetchServerHello();
serverHelloPromise.then((serverHello) => console.log(serverHello));

// Function to fetch Ukrainian towns and cities wiki data as a raw text string
async function fetchCitiesDataRaw() {
    try {
        const response = await fetch('/api/citiesData');
        if (!response.ok) {
            throw new Error(`HTTP error: ${response.status}`);
        }
        const citiesDataRaw = await response.text();
        return citiesDataRaw;
    }
    catch(error) {
        console.error(`Could not get cities data ${error}`)
    }
}

// Function to parse raw text string to GeoJSON
function parseToGeoJson(citiesDataRaw) { 
    
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

    let startIndex;
    let endIndex;
    // this index will allow us to maintain position as we sweep through the string
    let anchorIndex;
    let startSubstring;
    let endSubstring;
    let stringCut;
    // the 'label =' property extraction has 4 different syntax cases. These variables will be use to surgically cater for each of the case.
    let labelSubstring = "label =";
    let labelSubstringIndex;
    let labelSubstringCut;

    // TEST: test variables
    let testLocal;
    let testGlobal = true;
    let testIndex;
    let testCountRaw;
    let testCountGeoJson;

    
    // Break up string into an object of properties where the key for each property is the oblast name and the value is the raw text string associated with it. Note that the '--' signature substring before each oblast name is necessary for reliable extraction as without it the string '** oblast' sometimes appears mixed inside the cities data as part of the location name data.
    for ( let i = 0; i < (oblastTemplate.length - 1 ); i++ ) {
        startIndex = citiesDataRaw.indexOf(oblastTemplate[i]);
        endIndex = citiesDataRaw.indexOf(oblastTemplate[i + 1]);
        oblastString = citiesDataRaw.substring(startIndex, endIndex);

        anchorIndex = 0; // initialise the initial value of the anchor index to the start of the oblastString

        testCountRaw = 0; // TEST: initialise the test counter for the number of features in the raw oblast string (feature extraction test at end of while loop on each oblast)
        testCountGeoJson = 0; // TEST: initialise the test counter for the number of features extracted to GeoJSON (feature extraction test at end of while loop on each oblast)

        while ( oblastString.indexOf("{ lat = \"", anchorIndex) !== -1 ) { 
            // extract coordinates
            // lattitude (note that GeoJSON coordinate format is [ long , lat ], rather than the reverse order as in the wiki data )
            // note that the anchorIndex has been either set to zero if it's the first iteration of this inner loop, or it has already been updated at the end of the previous iteration
            startSubstring = "{ lat = \"";
            endSubstring = "\", long = \"";
            startIndex = oblastString.indexOf(startSubstring, anchorIndex) + startSubstring.length;
            endIndex = oblastString.indexOf(endSubstring, anchorIndex);
            stringCut = oblastString.substring(startIndex, endIndex);
            featureObject.geometry.coordinates[1] = Number(stringCut);
            //longitude
            anchorIndex = endIndex + endSubstring.length; // update the anchor index
            endSubstring = "\", mark = \"";
            startIndex = anchorIndex;
            endIndex = oblastString.indexOf(endSubstring, anchorIndex);
            stringCut = oblastString.substring(startIndex, endIndex);
            featureObject.geometry.coordinates[0] = Number(stringCut);

            // extract mark icon type
            anchorIndex = endIndex + endSubstring.length; // update the anchor index
            endSubstring = "\"";
            startIndex = anchorIndex;
            endIndex = oblastString.indexOf(endSubstring, anchorIndex + 1); // Needs to be 1 index greater than anchorIndex because given a second argument: a number, the indexOf method returns the first occurrence of the specified substring at an index greater than or equal to the specified number. And "\"" is contained within the startSubstring.
            stringCut = oblastString.substring(startIndex, endIndex);
            featureObject.properties.mark = stringCut;

            //extract label of feature
            anchorIndex = endIndex + endSubstring.length; // update the anchor index
            labelSubstringIndex = oblastString.indexOf(labelSubstring, anchorIndex); // Initialise index that we'll use to deal with the exceptions to the dominent label syntax.

             // two of the features on the wiki map do not have labels at all. These are the seige icons for "Horlivka" in Donetsk Oblast, and "Huliaipole" in "Zaporizhzhia Oblast". Manually include a label for these two cases.
            if ((labelSubstringIndex > oblastString.indexOf("{ lat = \"", anchorIndex)) && (oblastString.indexOf("{ lat = \"", anchorIndex) > -1)) { 
                if ( oblastTemplate[i].slice(2) === "Donetsk Oblast" ) { 
                    featureObject.properties.label = "Horlivka";
                } else if ( oblastTemplate[i].slice(2) === "Zaporizhzhia Oblast" )        
                    featureObject.properties.label = "Huliaipole";
            } else { 
                // As long as we are not dealing with one of the features with no label, we can process the labels property as follows. 
                // Need if statements to handle the four syntax cases that follows the labelSubtring of 'label =' syntax
                labelSubstringCut = oblastString.substring(labelSubstringIndex);
                
                if( labelSubstringCut.startsWith("label = \"[[") ) {
                    startSubstring = "label = \"[[";
                    endSubstring = "]]\",";
                    startIndex = labelSubstringIndex + startSubstring.length;
                    endIndex = oblastString.indexOf(endSubstring, anchorIndex);
                    stringCut = oblastString.substring(startIndex, endIndex);
                    featureObject.properties.label = stringCut;
                } else if ( labelSubstringCut.startsWith("label = \"") ) {
                    startSubstring = "label = \"";
                    endSubstring = "\",";
                    startIndex = labelSubstringIndex + startSubstring.length;
                    endIndex = oblastString.indexOf(endSubstring, anchorIndex);
                    stringCut = oblastString.substring(startIndex, endIndex);
                    featureObject.properties.label = stringCut;
                } else if ( labelSubstringCut.startsWith("label = \" [[") ) {
                    startSubstring = "label = \" [[";
                    endSubstring = "]]\",";
                    startIndex = labelSubstringIndex + startSubstring.length;
                    endIndex = oblastString.indexOf(endSubstring, anchorIndex);
                    stringCut = oblastString.substring(startIndex, endIndex);
                    featureObject.properties.label = stringCut;
                } else if ( labelSubstringCut.startsWith("label = [[") ) {
                    startSubstring = "label = [[";
                    endSubstring = "]],";
                    startIndex = labelSubstringIndex + startSubstring.length;
                    endIndex = oblastString.indexOf(endSubstring, anchorIndex);
                    stringCut = oblastString.substring(startIndex, endIndex);
                    featureObject.properties.label = stringCut;
                } else if ( labelSubstringCut.startsWith("label =\"") ) {
                    startSubstring = "label =\"";
                    endSubstring = "\",";
                    startIndex = labelSubstringIndex + startSubstring.length;
                    endIndex = oblastString.indexOf(endSubstring, anchorIndex);
                    stringCut = oblastString.substring(startIndex, endIndex);
                    featureObject.properties.label = stringCut;
                } 
            };

            // extract oblast name
            featureObject.properties.oblast = oblastTemplate[i].slice(2);

            // add to GeoJson output
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

        // TEST: Run test on each oblast to make sure we've extracted all features from the raw string
        testIndex = oblastString.indexOf("{ lat = \"");

        while ( testIndex !== -1 ) {
            testCountRaw++;
            testIndex = oblastString.indexOf("{ lat = \"", testIndex + 1);
        }
        console.log(`# features in ${oblastTemplate[i].slice(2)} raw oblast string = ${testCountRaw}`);
        console.log(`# corresponding oblast features extracted into GeoJSON = ${testCountGeoJson}`);
        if (testCountRaw === testCountGeoJson) {
            testLocal = true;
        } else {
            testLocal = false;
            testGlobal = false;
        }
        console.log(`Local test pass in ${oblastTemplate[i].slice(2)} = ${testLocal}`)

    }

    // TEST: Check global parsing test result
    console.log(`Global test pass in all oblasts = ${testGlobal}`)

    // Output GeoJson
    console.log(JSON.stringify(outputGeoJson));

}

// Initiate data fetch from wiki. Remember the asyn functions always return a promise
const citiesDataPromise = fetchCitiesDataRaw();

// Parse resolved promise from raw text string to GeoJSON
citiesDataPromise.then( parseToGeoJson );

// This returns as 'undefined' meaning that it's value hasn't been declared because it is exectued synchronously before citiesDataPromise resolves above. I will need to put all of the GeoJSON parsing logic into a function and pass that as a handler function into the Promise's then() method (citiesDataPromise being the promise here) 
// console.log(citiesDataRaw);
