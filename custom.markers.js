/*

This is a JavaScript file you can edit to add custom markers to the map.
uNmINeD does not overwrite this file during map generation.

Steps:

    1. Edit this file using Notepad or a code editor (do not use document editors like Microsoft Word)
    2. Change the line "isEnabled: false," to "isEnabled: true," to display the markers
    3. Change or remove the example markers
    4. Add your own markers

Marker format:

    {
        x: X coordinate of the marker (in Minecraft block units),
        z: Z coordinate of the marker (in Minecraft block units),
        image: marker image URL to display (in quotes),
        imageScale: scale of the image (e.g. 1 = display full size, 0.5 = display half size),
        imageAnchor: [0.5, 1] means the tip of the pin is at the center-bottom of the image (see OpenLayers documentation for more info),
        text: marker text do display (in quotes),
        textColor: text color in HTML/CSS format (in quotes),
        offsetX: horizontal pixel offset of the text,
        offsetY: vertical pixel offset of the text,
        font: text font in HTML/CSS format (in quotes),
    },

Things to keep in mind:

* There are opening and closing brackets for each marker "{" and "}"
* Property names are case sensitive (i.e. "textColor" is okay, "TextColor" is not)
* There is a comma (",") at the end of each line except the opening brackets ("{")

You can use https://mapmarker.io/editor to generate custom pin images.
Use the imageScale property if the pin image is too large.

*/

UnminedCustomMarkers = {

    isEnabled: true,

    markers: [
        {
            x: -120,
            z: -25,
            image: "custom.pin.png",
            imageAnchor: [0.5, 1],
            imageScale: 0.3,
            text: "MountVille",
            textColor: "white", 
            offsetX: 0,
            offsetY: 20,
            font: "bold 20px Calibri,sans serif",
        },

        {
            x: 36,
            z: 241,
            image: "store.pin.png",
            imageAnchor: [0.5, 1],
            imageScale: 0.17,
            text: "Lysseberg",
            textColor: "white", 
            offsetX: 0,
            offsetY: 20,
            font: "bold 20px Calibri,sans serif",
        },

        {
            x: -656,
            z: 53,
            image: "lock2.pin.png",
            imageAnchor: [0.5, 1],
            imageScale: 0.25,
            text: "Gooneristan",
            textColor: "white", 
            offsetX: 0,
            offsetY: 20,
            font: "bold 20px Calibri,sans serif",
        },

        {
            x: 50,
            z: -177,
            image: "custom.pin.png",
            imageAnchor: [0.5, 1],
            imageScale: 0.17,
            text: "MountTopia",
            textColor: "white", 
            offsetX: 0,
            offsetY: 20,
            font: "bold 20px Calibri,sans serif",
        },

        {
            x: 119,
            z: 481,
            image: "custom.pin.png",
            imageAnchor: [0.5, 1],
            imageScale: 0.17,
            text: "TobbeTopia",
            textColor: "white", 
            offsetX: 0,
            offsetY: 20,
            font: "bold 20px Calibri,sans serif",
        },

        {
            x: -177,
            z: -159,
            image: "store.pin.png",
            imageAnchor: [0.5, 1],
            imageScale: 0.17,
            text: "The Big Barrel",
            textColor: "white", 
            offsetX: 0,
            offsetY: 20,
            font: "bold 20px Calibri,sans serif",
        },

        {
            x: -92,
            z: -1,
            image: "store.pin.png",
            imageAnchor: [0.5, 1],
            imageScale: 0.17,
            text: "Casino",
            textColor: "white", 
            offsetX: 0,
            offsetY: 20,
            font: "bold 20px Calibri,sans serif",
        },

        {
            x: 228,
            z: -136,
            image: "custom.pin.png",
            imageAnchor: [0.5, 1],
            imageScale: 0.3,
            text: "Hedekas",
            textColor: "white", 
            offsetX: 0,
            offsetY: 20,
            font: "bold 20px Calibri,sans serif",
        },

    ]
}
