## Hello from vs-code-reviews
We is in biznits

## Create React App
This is all Create React App goodness ("ahem") which you can read about here: [CRA-README.md](CRA-README.md)

## Configuration
To get this thing to work at all you need to add a file at /src/config.js.

Something like:

```javascript
export default Promise.resolve( {

    auth: "Basic Ond6mysupersecretkeygeneratedfromwithinbsogoesherecontainingcredentialsgivingaccessxbmE=",
    root: "https://mycompany.visualstudio.com/DefaultCollection",
    webRoot: "https://mycompany.visualstudio.com/Project-Name"

} );
```
