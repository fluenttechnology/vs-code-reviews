import React, { Component } from 'react';
import './Review.css';

class Review extends Component{

    render() {
                
        const { created, reviewer, requester, closedDate, status, state, id, statusComment, title, browserId, vsoid, duration, disposition } = this.props;
        const stateName = ( status || state );
        const className = "Review Review_" + stateName.replace( / /g, "-" );
        const isOngoing = !closedDate;        
        return <div className={className} key={id}>

            <span className="Review-status" title={`${stateName}: ${statusComment || "-"}`}>{stateName}</span>
            <span>{vsoid}</span>             
            <span className="Review-title">{title}</span>            
            <span className="Review-detail">                
                <p>Reviewee: {requester}</p>
                <p><a href={browserId} onClick={e => e.stopPropagation()}>{browserId}</a></p>
                <p>Created: {created.calendar()}</p>
                <p>Duration: {duration.humanize()} {isOngoing ? " (and counting...)": ""}</p>
                <p>{statusComment}</p>
                <p>Reviewer: {reviewer}</p>
                <p className={"Review-severity-" + disposition.severity}>{disposition.reason}</p>
            </span>

        </div>;
        
    }

}
export default Review;
