import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import registerServiceWorker from './registerServiceWorker';
import WorkItemClient from './vso/workitem-client';
import moment from "moment";
import fetchConfiguration from "./config";

const data = {};
const ops = { 
    filterReviewers: handleFilterReviewers,
    filterPageSize: handleFilterPageSize,
    filterMaxAgoDays: handleFilterMaxAgoDays,
    filterDisposition: handleFilterByDisposition
};

const render = () => ReactDOM.render(<App data={data} ops={ops}/>, document.getElementById('root'));
render(); // loading


function sortByCreatedDate( responses ) {

    return responses.slice(0).sort( ( a, b ) => 
        a.created.valueOf() > b.created.valueOf() ? -1 :
        a.created.valueOf() < b.created.valueOf() ? 1 :
        0
    );

}

function filterReviewers( strategy ) {

    const { codeReviews } = data;
    if ( !codeReviews ) { return; }    
    const filter = codeReviews.filter = codeReviews.filter || {};
    strategy( filter );    
    const { recentResponses } = codeReviews;
    data.codeReviews.filteredResponses = filterResponses( recentResponses );
    render();

}

function handleFilterReviewers( reviewer ) {

    filterReviewers( filter => filter.reviewer = reviewer || undefined );

}

function handleFilterMaxAgoDays( maxAgoDays ) {

    filterReviewers( filter => {

        const previously = filter.maxAgo || undefined;
        try {

            filter.maxAgo = parseInt( maxAgoDays, 10 );

        } catch( _ ) {

            filter.maxAgo = previously;

        }

    } );

}

function handleFilterByDisposition( disposition ) {

    disposition = [].concat( disposition || [] ).map( x => +x );    
    filterReviewers( filter => filter.disposition = disposition );

}

function handleFilterPageSize( pageSize ) {

    filterReviewers( filter => {

        const previously = filter.max || 250;
        try {

            filter.max = parseInt( pageSize, 10 )
        
        } catch( _ ) {

            filter.max = previously;

        }

    } );    

}

function filterResponses( responses ) {

    const { codeReviews } = data;
    if ( !codeReviews ) { return; }
    const filter = codeReviews.filter = codeReviews.filter || {};
    filter.max = filter.max || 9999;
    const { max, reviewer, maxAgo } = filter;
    const disposition = ( filter.disposition && filter.disposition.length ) ? filter.disposition : null;
    const now = moment();    
    const filtered = responses.filter( x => {

        if ( maxAgo && now.diff( x.created, "days" ) > maxAgo ) { return false; }
        if ( reviewer && x.reviewer !== reviewer ) { return false; }
        if ( disposition && !~disposition.indexOf( x.disposition.severity ) ) { return false; }
        return true;

    } );
    return filtered.slice( 0, max );

}

function responseReviewers( responses ) {

    const reviewers = [];
    for( var i = 0; i < responses.length; i++ ) {

        const { reviewer } = responses[ i ];
        if ( !~reviewers.indexOf( reviewer ) ) reviewers.push( reviewer );

    }
    reviewers.sort();
    return reviewers;

}

fetchConfiguration.then( config => {

    config = Object.assign( { ver: "3.0" }, config );
    config.webItemUrlTemplate = `${config.webRoot}/_workitems?id=`;
    
    Promise.all( [

        new WorkItemClient(config).fetchRecentResponses("Flexi-Grant"),
        new WorkItemClient(config).fetchRecentResponses("ESIF")

    ] ).then( ( [ flexigrant, esif ] ) => {

        const recentResponses = sortByCreatedDate( flexigrant.concat(esif) );
        data.codeReviews = { recentResponses };
        data.codeReviews.reviewers = responseReviewers( recentResponses );
        data.codeReviews.filteredResponses = filterResponses( recentResponses );
        render();

    }, e => {

        console.log( e );
        alert(e.message || e);

    } );

} );

registerServiceWorker();
 