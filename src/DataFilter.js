import React, { Component } from 'react';
import './DataFilter.css';
import debounce from "debounce";

class DataFilter extends Component {

    constructor( props ) {

        super( props );        
        const { ops } = props;       
        this.state = { max: 0 };
        this.filterPageSize = debounce( ops.filterPageSize, 500 );
        this.filterMaxAgoDays = debounce( ops.filterMaxAgoDays, 500 );

    }

    handleReviewersChange = ( e ) => {

        const { ops } = this.props;
        ops.filterReviewers( e.target.value );        

    }

    handleMaxResponsesChange = ( e ) => {
        
        const max = +e.target.value;        
        this.setState( { max } );
        this.filterPageSize( max );
        
    }

    handleMaxDaysAgoChange = ( e ) => {

        const maxAgo = +e.target.value;
        this.setState( { maxAgo } );
        this.filterMaxAgoDays( maxAgo );

    }

    handleDispositionChange = ( e ) => {

        const selected = [].slice.apply( e.target.options ).filter( opt => opt.selected ).map( opt => opt.value );
        const { ops } = this.props;
        ops.filterDisposition( selected );

    }

    deselectDisposition = ( e ) => {

        this.dispositionSelect.selectedIndex = -1;
        const { ops } = this.props;
        ops.filterDisposition( [] );

    }

    render() {

        const { data } = this.props;        
        const { codeReviews } = data || {};
        if ( !codeReviews ) { return null; }                
        const { recentResponses, filteredResponses, reviewers, max, maxAgo } = codeReviews;
        const responseCount = filteredResponses.length;        
        const maxLimit = this.state.max || max || "";
        const maxAgoLimit = this.state.maxAgo || maxAgo || "";

        return <div>

            <p>
                Limit the maximum number of responses to: <input className="DataFilter-maxResponses" value={maxLimit} onChange={this.handleMaxResponsesChange} />
            </p>
            <p>
                Reviewer: <select onChange={this.handleReviewersChange}>
                    <option key="all" value="">All</option>
                    {reviewers.map( x => <option key={x} value={x}>{x}</option> )}
                </select>
            </p>
            <p>
                Limit the reviews to those created up to a maximum of <input className="DataFilter-maxDaysAgo" value={maxAgoLimit} onChange={this.handleMaxDaysAgoChange} /> days ago.
            </p>
            <p>
                Limit reviews to ones with disposition: <select multiple className="DataFilter-disposition" ref={x => this.dispositionSelect = x} rows="3" onChange={this.handleDispositionChange}>                    
                    <option value="0">OK</option>
                    <option value="1">Warning</option>
                    <option value="2">Problem</option>
                </select> <button type="button" onClick={this.deselectDisposition}>Deselect</button>
            </p>
            <p>
                Showing {responseCount} of {recentResponses.length} review responses. 
            </p>

        </div>;

    }

}

export default DataFilter;
