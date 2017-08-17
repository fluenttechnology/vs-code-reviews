import React, { Component } from 'react';
import Review from "./Review.js";
import './Reviews.css';

class Reviews extends Component {

    constructor() {

        super();
        this.state = {};

    }

    selectReview = ( review ) => {
       
        const { selected } = this.state;
        if ( review.id === selected ) {

            this.setState( { selected: undefined } );

        } else {
        
            this.setState( { selected: review.id } );

        }

    }

    renderReview = ( review ) => {

        const { selected } = this.state;
        const isItemSelected = review.id === selected;
        const className = "Review-item" + ( isItemSelected ? " Review-item_Selected" : "" );
        return <li className={className} key={review.id} onClick={() => this.selectReview(review)}>

            <Review {...review} selected={isItemSelected} />            

        </li>;

    }

    renderReviews() {

        const { data } = this.props;
        const { codeReviews } = data || {};
        if ( !codeReviews ) {

            return "Loading...";

        } 
        
        const reviews = codeReviews.filteredResponses || [];
        if ( !reviews.length ) {

            return "No reviews found!";

        }

        return <ul>{ reviews.map( this.renderReview ) }</ul>;

    }

    render() {
        
        return <article className="recent-reviews">

            { this.renderReviews() }
            
        </article>

    }

}
export default Reviews;
