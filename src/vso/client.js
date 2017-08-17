
export default class Client {

    constructor({ auth, ver, root }) {

        this.accept = `application/json;api-version=${ver}`;
        this.authorization = auth;
        root = root || "";
        this.root = root.match(/\/$/) ? root : root + "/";

    }

    fetchToJSON( pathOrUrl, opts ) {

        opts = Object.assign( {}, opts );
        opts.headers = Object.assign( {}, opts.headers, { Authorization: this.authorization, Accept: this.accept } );
        pathOrUrl = pathOrUrl || "";        
        const url = pathOrUrl.indexOf( "http" ) === 0 ? pathOrUrl : `${this.root}${pathOrUrl}`;
        return fetch( url, opts ).then( res => res.json() );

    }

    post( pathOrUrl, body ) {

        const headers = { "Content-Type": "application/json" };
        const opts = { method: "POST", headers, body };     
        return this.fetchToJSON( pathOrUrl, opts );

    }

    get( path ) {

        return this.fetchToJSON( path, {} );

    }

}
