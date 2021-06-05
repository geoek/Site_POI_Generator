export default class Poi {
    constructor (name, type, coord) {
        this.name = name,
        this.type = type,
        this.coord = coord
    }

    displayDebugPoi () {
        console.log('Le nom du POI est ' + this.name)
        this.type.forEach(v => {
            console.log ('Type : ' + v)            
        });
    }
}
