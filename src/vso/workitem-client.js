import Client from "./client";
import recentResponses from "./wiql/recent-responses.json";
import moment from "moment";

const wiql = "_apis/wit/wiql";
const workItemTemplate = "_apis/wit/WorkItems?ids=";

function parseAsResponseIds( result ) {

    if ( !result ) { return []; }
    const { workItemRelations } = result;
    return ( workItemRelations || [] )
        .filter( x => !x.rel )
        .map( x => x.target.id );

}


function parseAsResponseBatchesDetails( batches, webItemUrlTemplate ) {

    const asDetails = batch => batch.value.map( response => parseAsResponseDetails( response, webItemUrlTemplate ) );
    return [].concat.apply( [], batches.map( asDetails ) );

}

const maybeMoment = value => value ? moment( value ) : null;

function reviewDisposition( details ) {

    const duration = details.duration.asDays();
    if ( duration > 7 ) { return { severity: 2, reason: "Very long duration" }; }
    if ( duration > 4 ) { return { severity: 1, reason: "Long duration" };  }
    switch( ( details.status || "" ).toLowerCase() ) {

        case "looks good":
        case "with comments":
        case "needs work":
        case "":
            return { severity: 0, reason: "On-time" };
        case "declined":
            if ( ( details.statusComment || "" ).indexOf( "Automatically declined" ) !== 0 ) {

                // manually declined is ok
                return { severity: 0, reason: "Manually declined" };

            }
            if ( duration < 2 ) {

                // automatic decline is ok within the two days
                return { severity: 0, reason: "Quickly auto-declined (mistaken review assignment?)" };

            }
            // automatic declie after more than a day
            return { severity: 1, reason: "Auto-declined (took too long?)" };

        case "removed":
            if ( duration < 2 ) {

                // removed from review within 2 days
                return { severity: 0, reason: "Quickly removed from review" };

            }
            return { severity: 1, reason: "Removed from the reivew (took too lonng?)" };
        
        default:
            return { severity: 1, reason: "Unrecognised status" };

    }   

}

function parseAsResponseDetails( response, webItemUrlTemplate ) {
    
    const { fields } = response;
    const details = {
        
        reviewer: fields[ "Microsoft.VSTS.Common.ReviewedBy" ],
        requester: fields[ "System.CreatedBy" ],
        created: maybeMoment( fields[ "System.CreatedDate" ] ),
        modified: maybeMoment( fields[ "System.ChangedDate" ] ),
        state: fields[ "System.State" ],
        title: fields[ "System.Title" ],
        status: fields[ "Microsoft.VSTS.CodeReview.ClosedStatus" ],
        statusComment: fields[ "Microsoft.VSTS.CodeReview.ClosingComment" ],
        closedDate: maybeMoment(fields[ "Microsoft.VSTS.Common.ClosedDate" ]),
        id: response.url,
        browserId: webItemUrlTemplate + response.id,
        vsoid: response.id,
        data: response        
        
    };
    details.duration = moment.duration( ( details.closedDate || moment() ).diff( details.created ) );
    details.disposition = reviewDisposition( details );    
    return details;

}

function asWorkItemsPath( ids ) {

    return workItemTemplate + ids.join( "," )

}

function fetchResponseDetails( client, ids ) {

    const requests = [];    
    for ( let i = 0; i < ids.length; i+=100 ) {

        const subset = ids.slice( i, i + 100 );
        requests.push( client.get( asWorkItemsPath( subset ) ) );

    }    
    return Promise
        .all( requests )        
        .then( responses => parseAsResponseBatchesDetails( responses, client.webItemUrlTemplate ) );

}

export default class WorkItemClient extends Client {

    constructor( config ) {

        super( config );
        this.webItemUrlTemplate = config.webItemUrlTemplate;

    }

    fetchRecentResponses( projectName ) {
        
        const query = JSON.stringify( recentResponses ).replace( "{{project}}", `'${projectName}'` );
        return this
            .post( wiql, query )
            .then( parseAsResponseIds )
            .then( ids => fetchResponseDetails( this, ids ) )

    }

}