import React, { Component } from 'react';
import moment from 'moment';
import { XAxis, YAxis, CartesianGrid, ResponsiveContainer, BarChart, Bar, Tooltip } from 'recharts';
import './Analysis.css';

class Analysis extends Component {

    renderReviewVolumeChart( filteredResponses ) {

        const digest = filteredResponses
            .map( x => moment( x.created ).startOf("day").unix() )
            .reduce( ( acc, when ) => {

                acc[ when ] = ( acc[ when ] || 0 ) + 1;
                return acc;

            }, {} );

        const points = Object.keys( digest ).map( key => ( {
            
            created: parseInt( key, 10),
            value: digest[ key ]
            
        } ) );

        const dates = points.map( x => x.created );
        let startDate = moment.unix( Math.min.apply( null, dates ) ).subtract( 20, "d" );
        const endDate = moment.unix( Math.max.apply( null, dates ) ).add( 2, "d" );
        if ( endDate.diff( startDate, "days" ) < 7 ) {

            startDate = moment( endDate ).subtract( 7, "days" );

        }
        const start = startDate.unix();
        const end = endDate.unix();
        
        const tick = Math.round( ( end - start ) / 10);
        const ticks = [];
        for ( var i = 0; i < 10; i++ ) {

            ticks.push( start + ( tick * i ) );

        }
    
        const dateFormat = x => moment.unix( x ).format('LL');
        const tooltipDateFormat = { nextDay: "[Tomorrow]", sameDay: "[Today]", nextWeek: "dddd", lastDay: "[Yesterday]", lastWeek: "[Last] dddd", sameElse: "dddd d MMMM" };
        const renderTooltip = x => {

            const [ y ] = x.payload;          
            if ( !y ) { return <span>n/a</span>; }
            try {
            return <div className="Analysis-tooltip">
                {moment.unix(y.payload.created).calendar( null, tooltipDateFormat )}
                <span className="Analysis-tooltip-value">
                    {y.payload.value}
                </span>                
            </div>
            } catch( e ) {

               return <span>?</span>;

            }            

        }

        return <ResponsiveContainer width="100%" height={200}>

            <BarChart data={points}>
            
                <Bar dataKey="value" fill="#FFCC44" />
                <CartesianGrid styoke="#ccc" />
                <XAxis type="number" dataKey="created" domain={[start,end]} ticks={ticks} tickFormatter={dateFormat} />
                <YAxis />
                <Tooltip content={renderTooltip} />

            </BarChart>

        </ResponsiveContainer>

    }

    renderScalars( filteredResponses ) {

        const averageDuration = filteredResponses.reduce( ( acc, x ) => acc + x.duration.asDays(), 0 ) / filteredResponses.length;
        const maximumDuration = Math.max.apply( Math, filteredResponses.map( x => x.duration.asDays() ) );
        const overFourDays = filteredResponses.filter( x => x.duration.asDays() > 4 ).length;
        const warnings = filteredResponses.filter( x => x.disposition.severity === 1 ).length;
        const errors = filteredResponses.filter( x => x.disposition.severity === 2 ).length;

        return [ 
        
        <article key="longest">
            <span className="Analysis-scalar-figure">{maximumDuration.toFixed( 1 )}</span>
            Longest review (days)            
        </article>,
        
        <article key="average">                        
            <span className="Analysis-scalar-figure">{averageDuration.toFixed( 1 )}</span>
            Average duration (days)
        </article>,

        <article key="very-long">
            <span className="Analysis-scalar-figure">{overFourDays}</span>
            Number of long reviews (> 4 days)
        </article>,
        
        <article key="warnings">
            <span className="Analysis-scalar-figure">{warnings}</span>
            Number of less than ideal reviews (e.g. removed after days)
        </article>,

        <article key="errors">
            <span className="Analysis-scalar-figure">{errors}</span>
            Number of bad reviews (e.g. > 10 days)
        </article>
        
        ];

    }
    render() {

        const { data } = this.props;
        const { codeReviews } = data;
        if ( !codeReviews ) { return null; }
        const { filteredResponses } = codeReviews;



        return <article className="Analysis">

            <section className="Analysis-sticker">

                <div className="Analysis-charts">

                    {this.renderReviewVolumeChart( filteredResponses )}                 

                </div>
                <div className="Analysis-scalars">

                    {this.renderScalars( filteredResponses )}

                </div>

            </section>

        </article>
        ;

    }

}

export default Analysis;
