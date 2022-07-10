
import * as Http from "http";
import { ParsedUrlQuery } from "querystring";
import * as url from "url";
import * as Mongo from "mongodb";


export namespace TextAdventure {
    /* enum PlayerState {
         USER,
         PLAYER,
         REGISTERT_USER
     }*/
    interface Input {
        [type: string]: string | string[];
    }
    interface TextAdventure {
        name: string;
        places: string;
        sizeX: number;
        sizeY: number;
    }
    class SelectabelAdventure {
        name: string;
        places: string;
        sizeX: number;
        sizeY: number;

        constructor(_name: string, _places: string, _sizeX: number, _sizeY: number) {
            this.name = _name;
            this.places = _places;
            this.sizeX = _sizeX;
            this.sizeY = _sizeY;
        }

    }
    let textAdventureCollection: Mongo.Collection;
    let databaseUrl: string = "mongodb+srv://FynnJ:nicnjX5MjRSm4wtu@gis-ist-geil.wb5k5.mongodb.net/?retryWrites=true&w=majority";
    let selectedAdventure: SelectabelAdventure = new SelectabelAdventure("empty", "empty", 0, 0);
    let currentLocationNumber: number = 0;


    console.log("Starting server");
    let port: number = Number(process.env.PORT);
    if (!port)
        port = 8100;

    startServer(port);
    connectToDatabase(databaseUrl);



    function startServer(_port: number | string): void {
        let server: Http.Server = Http.createServer();
        server.addListener("request", handleRequest);
        server.addListener("listening", handleListen);
        server.listen(_port);
    }

    async function connectToDatabase(_url: string): Promise<void> {
        let options: Mongo.MongoClientOptions = { useNewUrlParser: true, useUnifiedTopology: true };
        let mongoClient: Mongo.MongoClient = new Mongo.MongoClient(_url, options);
        await mongoClient.connect();
        textAdventureCollection = mongoClient.db("Test").collection("Adventures");
        console.log("Database connection", textAdventureCollection != undefined);
    }


    function handleListen(): void {
        console.log("Listening");
    }


    async function handleRequest(_request: Http.IncomingMessage, _response: Http.ServerResponse): Promise<void> {


        _response.setHeader("Access-Control-Allow-Origin", "*");

        let q: url.UrlWithParsedQuery = url.parse(_request.url, true);
        let daten: ParsedUrlQuery = q.query;

        if (q.pathname == "//saveAdventure") {
            _response.write(await saveAdventure(q.query));
        }
        if (q.pathname == "//showAdventures") {
            _response.write(await showAdventures());
        }
        if (q.pathname == "//selectAdventure") {
            _response.write(await selectAdventure(daten.adventureName));
        }
        if (q.pathname == "//left") {
            _response.write(await onAction("left"));
        }
        if (q.pathname == "//right") {
            _response.write(await onAction("right"));
        }
        if (q.pathname == "//up") {
            _response.write(await onAction("up"));
        }
        if (q.pathname == "//down") {
            _response.write(await onAction("down"));
        }
        _response.end();
    }
    async function showAdventures(): Promise<String> {

        let data: TextAdventure[] = await textAdventureCollection.find().toArray();
        if (data.length > 0) {
            let dataString: string = "";
            for (let counter: number = 0; counter < 5; counter++) {
                if (counter < data.length) {
                    let adventureNumber: number = counter + 1;
                    dataString = dataString + " Adventure " + adventureNumber + ": " + data[counter].name + "(" + data[counter].sizeX + "X" + data[counter].sizeY + " Felder) ";
                }
                else {
                    return (dataString);
                }
            }
            return (dataString);
        }
        return ("Es ist noch kein Adventure angelegt worden.");
    }
    async function selectAdventure(_filterName: string | string[]): Promise<string> {
        console.log(_filterName);
        currentLocationNumber = 0;
        let adventureName: string = _filterName.toString();
        let data: TextAdventure[] = await textAdventureCollection.find().toArray();
        if (data.length > 0) {
            let dataString: string = "";
            for (let counter: number = 0; counter < data.length - 1; counter++) {
                if (data[counter].name != undefined) {
                    if (data[counter].name == adventureName) {
                        selectedAdventure.name = data[counter].name;
                        selectedAdventure.places = data[counter].places;
                        selectedAdventure.sizeX = data[counter].sizeX;
                        selectedAdventure.sizeY = data[counter].sizeY;
                        dataString = "Durch drücken einer Pfeiltaste starten sie das Text Adventure" + selectedAdventure.name + " an der Stelle links oben.";

                    }
                }
            }
            if (data[data.length - 1].name == adventureName) {
                console.log(data[data.length - 1].places);
                selectedAdventure.name = data[data.length - 1].name;
                selectedAdventure.places = data[data.length - 1].places;
                selectedAdventure.sizeX = data[data.length - 1].sizeX;
                selectedAdventure.sizeY = data[data.length - 1].sizeY;
                dataString = "Durch drücken einer Pfeiltaste starten sie das Text Adventure" + selectedAdventure.name + " an der Stelle links oben.";
            }
            if (dataString == "") {
                return ("Es gibt noch kein Text Adventure mit diesem Name, bitte Überprüfen sie die Schreibweise des Text Adventures");
            }
            return (dataString);
        }

        return ("Es ist Aktuell noch kein Text Adventure gespeichert.");

    }

    async function saveAdventure(_rückgabe: Input): Promise<string> {
        textAdventureCollection.insertOne(_rückgabe);
        return ("Text Adventure erfolgreich gespeichert!");
    }
    export async function onAction(_action: string): Promise<string> {
        let stringSplitLimiter: number = selectedAdventure.sizeX * selectedAdventure.sizeY;
        let adventureMap: string[] = selectedAdventure.places.toString().split(",", stringSplitLimiter);
        let endOfRowNumber: number = selectedAdventure.sizeX - 1;
        let startOfRowNumber: number = 0;
        let startOfLastRow: number = selectedAdventure.sizeX * (selectedAdventure.sizeY - 1);
        if (selectedAdventure.places == undefined) {
            return ("es wurde noch kein Adventure ausgewählt");
        }
        if (_action == "left") {
            for (let counter: number = 0; counter < selectedAdventure.sizeY; counter++) {
                if (currentLocationNumber == startOfRowNumber) {
                    return ("du bist am rechten Linken Rand des Adventures angekommen und kannst deshalb nicht weiter nach Links. Du bleibst deshalb hier: " + adventureMap[currentLocationNumber]);
                }
                startOfRowNumber = 1 * startOfRowNumber + 1 * selectedAdventure.sizeX;
            }
            currentLocationNumber = currentLocationNumber + -1;
            return (adventureMap[currentLocationNumber]);
        } else if (_action == "right") {
            for (let counter: number = 0; counter < selectedAdventure.sizeY; counter++) {
                if (currentLocationNumber == endOfRowNumber) {
                    return ("du bist am rechten Rand des Adventures angekommen und kannst deshalb nicht weiter nach Rechts. Du bleibst deshalb hier: " + adventureMap[currentLocationNumber]);
                }
                endOfRowNumber = 1 * endOfRowNumber + 1 * selectedAdventure.sizeX;
            }
            currentLocationNumber = currentLocationNumber + 1;
            return (adventureMap[currentLocationNumber]);

        }
        else if (_action == "up") {
            if (currentLocationNumber > endOfRowNumber) {
                currentLocationNumber = currentLocationNumber * 1 - selectedAdventure.sizeX * 1;
                console.log("currentLocationNumber" + currentLocationNumber);
                return (adventureMap[currentLocationNumber]);
            }
            else {
                return ("du bist am oberen Rand des Adventures angekommen und kannst deshalb nicht weiter hoch. Du bleibst deshalb hier: " + adventureMap[currentLocationNumber]);
            }
        } else if (_action == "down") {
            if (currentLocationNumber < startOfLastRow) {
                currentLocationNumber = currentLocationNumber * 1 + selectedAdventure.sizeX * 1;
                console.log("currentLocationNumber" + currentLocationNumber);
                return (adventureMap[currentLocationNumber]);
            }
            else {
                return ("du bist am unteren Rand des Adventures angekommen und kannst deshalb nicht weiter runter. Du bleibst deshalb hier: " + adventureMap[currentLocationNumber]);
            }
        }
        else {
            return ("ein fehler ist aufgetreten");
        }
    }
}

