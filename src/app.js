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
/*
app.get('/storejson/', (request, response) => {
    var jsonString = request.query.data;
    fs.writeFile('./data/mygeojson.geojson', jsonString, err => {
        if (err) {
            console.log('Error writing GeoJson', err)
        } else {
            console.log('Successfully wrote GeoJson')
        }
    })
})
*/
app.post('/storejson/', (request, response) => {
    //on récupère la photo (dans files) et le nom (dans body)
    var jsonString = request.body.geojson
    
    console.log(jsonString)
    fs.writeFile('./data/mygeojson.geojson', jsonString, err => {
        if (err) {
            console.log('Error writing GeoJson', err)
        } else {
            console.log('Successfully wrote GeoJson')
            response.end()
        }
    })
 })
/*
app.get('/storelistcat/', (request, response) => {
    var jsonString = request.query.data;
    console.log(jsonString)
    var myJSON = JSON.stringify(jsonString)
    console.log(myJSON)
    fs.writeFile('./data/listCat.json', myJSON, err => {
        if (err) {
            console.log('Error writing Cat Json', err)
        } else {
            console.log('Successfully wrote Cat Json')
        }
    })
})
*/
app.post('/storelistcat/', (request, response) => {
    //on récupère la photo (dans files) et le nom (dans body)
    var jsonString = request.body.listcat
    
    console.log(jsonString)
    fs.writeFile('./data/listCat.json', jsonString, err => {
        if (err) {
            console.log('Error writing Cat Json', err)
        } else {
            console.log('Successfully wrote Cat Json')
            response.end()
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

 //DELETE de la photo
app.get('/deletephoto/', (request, response) => {
    var photoName = request.query.filename
    console.log('Delete the photo ' + photoName)
    console.log(request.query)
    fs.unlink("./data/img/" + photoName, (err) => {
       if (err) {
           console.log("failed to delete local image:"+err);
       } else {
           console.log('successfully deleted local image');                                
       }
   });
})
 







app.use(cors());

express.static.mime.define({'application/json': ['json']})
express.static.mime.define({'application/json': ['geojson']})

// Permet à express d'utiliser le middelware de bundler, cela permettra à Parcel de gérer chaque requête sur votre serveur express
// Attention à mettre à la fin sinon ca prend le dessus sur les routes
app.use(bundler.middleware());

// Ouverture du serveur d'Express
app.listen(8081)