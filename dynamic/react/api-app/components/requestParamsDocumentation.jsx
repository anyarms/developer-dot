/* Stateless component for either a querystring or
 * path parameter that comes in an api request
 */

import React from 'react';
import ReactMarkdown from 'react-markdown';

const PARAM_TYPES = {
    QUERY_STRING: 'QUERY_STRING',
    PATH: 'PATH'
};

const RequestParamsDocumentation = ({paramType, params}) => {
    return (
        <div>
            <h4 className={'api-doc-header'}>{paramType === PARAM_TYPES.QUERY_STRING ? 'Querystring Parameters' : 'Path Parameters'}</h4>
            {Object.keys(params).map((key, i) => {
                // return (
                //     <div className={'row documentation-parameter-body'} key={i}>
                //         <div className={'col-md-2 api-doc-left-col'}><div className={'api-doc-parameter-name s5'} title={key}>{key}</div>{params[key].required ? <div className={'small-required-text'}>{'Required'}</div> : null}</div>
                //         <div className={'col-md-8 t1'}><ReactMarkdown source={params[key].description || ''} /></div>
                //         <div className={'col-md-2 t3'}>{params[key].fieldType}</div>
                //     </div>
                // );
                return (
                    <div className={'documentation-parameter-body'} key={i}>
                        <div><div className={'api-doc-parameter-name s5'} title={key}>{key}</div>{params[key].required ? <div className={'small-required-text'}>{'Required'}</div> : null}</div>
                        <div className={'t1'}><ReactMarkdown source={params[key].description || ''} /></div>
                        <div className={'t3'}>{params[key].fieldType}</div>
                    </div>
                );
            })}
        </div>
    );
};

RequestParamsDocumentation.displayName = 'Request Parameters';
RequestParamsDocumentation.propTypes = {
    paramType: React.PropTypes.oneOf(['QUERY_STRING', 'PATH']).isRequired,
    params: React.PropTypes.objectOf(
        React.PropTypes.shape({
            fieldType: React.PropTypes.string.isRequired,
            description: React.PropTypes.string,
            example: React.PropTypes.any,
            required: React.PropTypes.bool,
            value: React.PropTypes.any.isRequired
        })
    ).isRequired
};

export default RequestParamsDocumentation;
