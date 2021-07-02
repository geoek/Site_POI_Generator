//Fichier du serveur Express : point d'entrée de Node.
//Pour Parcel, le point d'entrée est le HTML Principal

const Bundler = require('parcel-bundler');
let express = require('express')
let app = express()
let path = require('path');
const fs = require('fs')
const upload = require('express-fileupload')

const cors = require('cors');

// Pour Parcel, il faut définir les réglages :
// Passe ici un chemin absolu vers le point d'entrée
const file = 'index.html'
const options = { production: process.env.NODE_ENV === 'production' } // Voir la section des options de la doc de l'api, pour les possibilités
// Initialise un nouveau bundler en utilisant un fichier et des options
const bundler = new Bundler(file, options)


// ROUTING pour Express :

// pour qu'il route automatiquement les fichiers statiques
app.use("/static", express.static('./static/'))
app.use("/data", express.static('./data/'))
app.use("/style", express.static('./style/'))

app.use(upload())

app.get('/storejson/', (request, response) => {
    var jsonString = request.query.data;
    fs.writeFile('./data/mygeojson.geojson', jsonString, err => {
        if (err) {
            console.log('Error writing file', err)
        } else {
            console.log('Successfully wrote file')
        }
    })
})
    /*
        var id = request.query.id; 
        var x = request.query.x; 
        var y = request.query.y; 
        //client.query("DELETE FROM covid19.myposition WHERE id=1;INSERT INTO covid19.myposition VALUES (" + id + ",'ol_position',st_SetSRID(st_makepoint("+ x +","+ y +"),2154));", function (err, result) {
        client.query("DELETE FROM covid19.myposition WHERE id=1;INSERT INTO covid19.myposition VALUES (1,'ol_position',st_SetSRID(st_makepoint("+ x +","+ y +"),2154));", function (err, result) {
                if (err) {
                console.log(err);
                response.status(400).send(err);
            }
            response.status(200).send(result.rows);
        }
        
        */


//UPLOAD de la photo
app.post('/uploadphoto/', (request, response) => {
   //on récupère la photo (dans files) et le nom (dans body)
    var photoFile = request.files.photo.data
    var photoName = request.body.name
    
    console.log(request)
    fs.writeFile('./data/img/' + photoName, photoFile, err => {
        if (err) {
            console.log('Error upload', err)
        } else {
            console.log('Successfully upload')
            response.end()
        }
    })
})








app.use(cors());

express.static.mime.define({'application/json': ['json']})
express.static.mime.define({'application/json': ['geojson']})

// Permet à express d'utiliser le middelware de bundler, cela permettra à Parcel de gérer chaque requête sur votre serveur express
// Attention à mettre à la fin sinon ca prend le dessus sur les routes
app.use(bundler.middleware());

// Ouverture du serveur d'Express
app.listen(8081)